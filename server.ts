import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Support up to 30MB base64 images
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // Initialize Gemini client on the server
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health and API status
  app.get('/api/status', (_req, res) => {
    res.json({
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      model: 'gemini-3.8-flash',
      envConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    });
  });

  // Analyze image with Gemini 3.8 Flash
  app.post('/api/analyze-image', async (req, res) => {
    try {
      const { imageData, mimeType = 'image/jpeg', preset = 'receipt', customPrompt = '' } = req.body;

      if (!imageData) {
        return res.status(400).json({ error: 'No se proporcionó imagen para analizar.' });
      }

      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
        return res.status(500).json({
          error: 'No se ha configurado la variable GEMINI_API_KEY en el servidor.',
          guide: 'En Google AI Studio, haz clic en "Get API key" o en el panel Settings > Secrets.',
        });
      }

      // Clean base64 string
      let cleanBase64 = imageData;
      let detectedMime = mimeType;
      if (imageData.startsWith('data:')) {
        const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          detectedMime = matches[1];
          cleanBase64 = matches[2];
        } else {
          cleanBase64 = imageData.replace(/^data:[^;]+;base64,/, '');
        }
      }

      let promptInstruction = '';
      switch (preset) {
        case 'receipt':
          promptInstruction = `Analiza esta factura, ticket, comprobante o recibo de compra.
Extrae los datos clave y desglosa cada ítem o producto comprado en filas.
Formato JSON requerido:
{
  "title": "Nombre del comercio o título del recibo",
  "summary": "Resumen breve en español de la transacción",
  "metadata": {
    "fecha": "YYYY-MM-DD o texto visible",
    "comercio": "Nombre del emisor",
    "numero_factura": "Número o folio si existe",
    "subtotal": "Valor numérico o string",
    "impuestos": "Valor numérico o string",
    "total": "Valor total",
    "moneda": "EUR / USD / MXN / COP / etc",
    "metodo_pago": "Efectivo / Tarjeta / etc"
  },
  "columns": ["Item", "Cantidad", "Precio Unitario", "Total"],
  "rows": [
    {"Item": "Nombre del producto", "Cantidad": 1, "Precio Unitario": 10.0, "Total": 10.0}
  ]
}`;
          break;

        case 'inventory':
          promptInstruction = `Analiza los productos, inventario, etiquetas o estantería en esta imagen.
Identifica cada producto visible y organízalo como registros de hoja de cálculo.
Formato JSON requerido:
{
  "title": "Registro de Inventario / Catálogo",
  "summary": "Resumen en español de los productos detectados",
  "metadata": {
    "total_articulos_detectados": 0,
    "categoria_general": "Categoría o tipo de productos"
  },
  "columns": ["Codigo_SKU", "Producto", "Categoria", "Cantidad", "Estado", "Precio_Estimado"],
  "rows": [
    {"Codigo_SKU": "...", "Producto": "...", "Categoria": "...", "Cantidad": 1, "Estado": "Nuevo/Visible", "Precio_Estimado": "..."}
  ]
}`;
          break;

        case 'table':
          promptInstruction = `Transcribe minuciosamente la tabla, cuadrícula o lista tabulada visible en este documento o imagen.
Conserva las columnas originales y todas las filas de datos.
Formato JSON requerido:
{
  "title": "Tabla de Documento",
  "summary": "Resumen en español del contenido de la tabla",
  "metadata": {
    "filas_detectadas": 0,
    "columnas_detectadas": 0
  },
  "columns": ["Columna1", "Columna2", "Columna3"],
  "rows": [
    {"Columna1": "...", "Columna2": "...", "Columna3": "..."}
  ]
}`;
          break;

        case 'objects':
          promptInstruction = `Realiza una inspección visual y detección de elementos u objetos clave en esta imagen.
Formato JSON requerido:
{
  "title": "Detección de Objetos e Inspección",
  "summary": "Descripción general de la escena",
  "metadata": {
    "ambiente": "Interior/Exterior/Oficina/etc",
    "calidad_imagen": "Buena/Regular"
  },
  "columns": ["Elemento", "Cantidad", "Color_Detalles", "Ubicacion", "Observaciones"],
  "rows": [
    {"Elemento": "...", "Cantidad": 1, "Color_Detalles": "...", "Ubicacion": "Centro/Superior/etc", "Observaciones": "..."}
  ]
}`;
          break;

        case 'custom':
        default:
          promptInstruction = `Analiza la imagen según estas instrucciones específicas del usuario:
"${customPrompt || 'Extrae todo el contenido relevante estructurado en formato tabular y JSON'}".
Formato JSON requerido:
{
  "title": "Extracción Personalizada",
  "summary": "Resumen de lo encontrado",
  "metadata": {},
  "columns": ["Campo1", "Campo2"],
  "rows": [
    {"Campo1": "...", "Campo2": "..."}
  ]
}`;
          break;
      }

      const systemInstruction = `Eres un motor experto de visión por computadora y OCR con IA para Google Sheets.
Tu trabajo es analizar imágenes y extraer SIEMPRE datos estructurados en formato JSON VÁLIDO.
REGLAS OBLIGATORIAS:
1. Responde ÚNICAMENTE con código JSON válido.
2. Cada elemento en "rows" debe ser un objeto plano cuyas claves coincidan con los nombres listados en "columns". Esto es crucial para crear filas directas en Google Sheets.
3. Si algún valor no es legible, coloca "N/D" o deja string vacío en lugar de inventar datos.
4. "columns" debe ser una lista de strings con nombres claros de columnas para una hoja de cálculo.
5. "summary" y "title" deben estar en español claro.`;

      const finalPrompt = customPrompt && preset !== 'custom' 
        ? `${promptInstruction}\n\nInstrucción adicional del usuario: ${customPrompt}` 
        : promptInstruction;

      let response: any = null;
      let lastError: any = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: detectedMime,
                    data: cleanBase64,
                  },
                },
                {
                  text: finalPrompt,
                },
              ],
            },
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });
          break; // Success
        } catch (apiErr: any) {
          lastError = apiErr;
          console.warn(`Attempt ${attempt} failed:`, apiErr?.message || apiErr);
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, 1000 * attempt));
          }
        }
      }

      if (!response && lastError) {
        throw lastError;
      }

      const responseText = response.text || '{}';
      let parsedJson: any;

      try {
        parsedJson = JSON.parse(responseText);
      } catch (parseErr) {
        // Fallback: strip code blocks if present
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedJson = JSON.parse(cleaned);
      }

      // Normalize structure if model returned an array or nested object
      if (Array.isArray(parsedJson)) {
        const columns = parsedJson.length > 0 ? Object.keys(parsedJson[0]) : ['Dato'];
        parsedJson = {
          title: 'Registros Extraídos',
          summary: `Se detectaron ${parsedJson.length} registros`,
          metadata: {},
          columns,
          rows: parsedJson,
        };
      }

      if (!parsedJson.columns && Array.isArray(parsedJson.rows) && parsedJson.rows.length > 0) {
        parsedJson.columns = Object.keys(parsedJson.rows[0]);
      } else if (!parsedJson.columns) {
        parsedJson.columns = ['Campo', 'Valor'];
      }

      if (!Array.isArray(parsedJson.rows)) {
        // If it extracted key-values in metadata, convert to rows
        if (parsedJson.metadata && typeof parsedJson.metadata === 'object') {
          parsedJson.rows = Object.entries(parsedJson.metadata).map(([k, v]) => ({
            Campo: k,
            Valor: String(v),
          }));
          parsedJson.columns = ['Campo', 'Valor'];
        } else {
          parsedJson.rows = [];
        }
      }

      return res.json({
        success: true,
        data: parsedJson,
        rawJsonString: JSON.stringify(parsedJson, null, 2),
      });
    } catch (error: any) {
      console.error('Error in /api/analyze-image:', error);
      return res.status(500).json({
        error: error.message || 'Error al procesar la imagen con Gemini.',
      });
    }
  });

  // Webhook proxy to send rows directly to a Google Sheets Apps Script Web App
  app.post('/api/export/webhook', async (req, res) => {
    try {
      const { webhookUrl, sheetName, data } = req.body;

      if (!webhookUrl || !webhookUrl.startsWith('https://')) {
        return res.status(400).json({ error: 'URL de Webhook inválida.' });
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetName, data, timestamp: new Date().toISOString() }),
      });

      const responseText = await response.text();
      return res.json({ success: true, response: responseText });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error al conectar con el Webhook de Google Sheets' });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
