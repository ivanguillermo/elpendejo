import React from 'react';
import { X, Key, FileSpreadsheet, Sparkles, ExternalLink, CheckCircle, HelpCircle, Code } from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_SNIPPET } from '../utils/sheetsExporter';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_SNIPPET);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 text-indigo-600 bg-indigo-50 rounded-xl">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Guía de Uso: AI Studio, API Key y Google Sheets</h2>
              <p className="text-sm text-slate-500">Respuestas rápidas para configurar tu flujo de trabajo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-slate-700">
          {/* Question 1: Where do I get my API Key? */}
          <section className="p-5 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 rounded-xl border border-indigo-100">
            <div className="flex items-start gap-3">
              <div className="p-2 mt-0.5 text-indigo-600 bg-white rounded-lg shadow-xs">
                <Key className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-indigo-950">
                  1. ¿Dónde consigo mi API KEY en Google AI Studio?
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Para obtener una clave de API de Gemini:
                </p>
                <ol className="text-sm space-y-1.5 list-decimal list-inside text-slate-700">
                  <li>
                    Ingresa a la consola oficial de Google AI Studio:{' '}
                    <a
                      href="https://aistudio.google.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-indigo-600 underline inline-flex items-center gap-1 hover:text-indigo-800"
                    >
                      aistudio.google.com <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </li>
                  <li>
                    Inicia sesión con tu cuenta de Google.
                  </li>
                  <li>
                    En la esquina superior izquierda o menú lateral, haz clic en el botón azul <strong className="text-indigo-900 font-semibold">"Get API key"</strong>.
                  </li>
                  <li>
                    Haz clic en <strong className="text-indigo-900 font-semibold">"Create API key"</strong> (puedes crearla en un proyecto nuevo o existente de Google Cloud).
                  </li>
                  <li>
                    ¡Listo! Copia tu clave.
                  </li>
                </ol>

                <div className="mt-3 p-3 text-xs bg-white/90 rounded-lg border border-indigo-200/70 text-indigo-900 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>¡Importante en este entorno!:</strong> Aquí en Google AI Studio Build, la clave de API ya está integrada de forma segura en el servidor mediante variables de entorno (en <em>Settings &gt; Secrets</em>). No necesitas pegarla en ningún formulario de la app.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Question 2: How does the image to JSON reading work? */}
          <section className="p-5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="p-2 mt-0.5 text-emerald-600 bg-white rounded-lg shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-slate-900">
                  2. ¿Cómo lee la imagen y genera el JSON?
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Esta aplicación utiliza el modelo <strong>Gemini 3.8 Flash con visión multimodal</strong> ejecutado desde el servidor de Node/Express.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Paso A: Carga de Imagen</span>
                    Arrastra cualquier foto de factura, ticket, tabla, documento o lista de productos (o pega con Ctrl+V).
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Paso B: Plantilla o Prompt</span>
                    Elige el tipo de extracción (Recibo, Inventario, Tabla, Objetos o Personalizado con campos propios).
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Paso C: Extracción JSON</span>
                    Gemini analiza la imagen y responde con un JSON que contiene columnas y filas estructuradas.
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Paso D: Edición y Validación</span>
                    Puedes revisar los datos en una tabla interactiva, corregir celdas o añadir filas antes de exportar.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Question 3: How to save to Google Sheets? */}
          <section className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <div className="flex items-start gap-3">
              <div className="p-2 mt-0.5 text-emerald-600 bg-white rounded-lg shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-emerald-950">
                  3. ¿Cómo grabar o pasar los datos a tu Google Sheet?
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Tienes 3 formas inmediatas y sin complicaciones:
                </p>

                <div className="space-y-3 mt-2 text-sm">
                  <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                    <div className="font-semibold text-emerald-900 flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 font-bold rounded-md">Opción 1 (Más rápida)</span>
                      Copiar con 1 Clic y Pegar en Google Sheets (Ctrl + V)
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Haz clic en el botón verde <strong>"Copiar para Google Sheets"</strong> en la tabla. Luego abre cualquier hoja de Google Sheets, haz clic en la celda A1 y presiona <strong>Ctrl + V</strong> (o Cmd + V). Las columnas y filas se rellenan automáticamente.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                    <div className="font-semibold text-emerald-900 flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 font-bold rounded-md">Opción 2</span>
                      Descargar archivo CSV / Abrir en Sheets
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Descarga el archivo <code>.csv</code>. En Google Sheets, ve a <em>Archivo &gt; Importar &gt; Subir</em> y selecciona el archivo.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                    <div className="font-semibold text-emerald-900 flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 font-bold rounded-md">Opción 3 (Automática)</span>
                      Sincronización directa mediante Webhook de Google Apps Script
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      En tu Google Sheet, ve a <em>Extensiones &gt; Apps Script</em>, pega el script de abajo e impleméntalo como Aplicación Web. Copia la URL resultante en la sección de Webhook de esta app para enviar filas directamente con un clic.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={handleCopyScript}
                        className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Code className="w-3.5 h-3.5" />
                        {copiedCode ? '¡Código Copiado!' : 'Copiar Script para Google Sheets'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
          >
            Entendido, ¡vamos a probar!
          </button>
        </div>
      </div>
    </div>
  );
};
