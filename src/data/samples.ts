// Sample mock receipt and table images encoded as data URLs for instant testing

export interface SampleImage {
  id: string;
  title: string;
  description: string;
  preset: 'receipt' | 'inventory' | 'table';
  dataUrl: string;
}

// Crisp sample SVG receipt
const receiptSvg = `
<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg" style="background:#fdfcf7;font-family:monospace;padding:20px;">
  <rect width="360" height="560" x="20" y="20" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
  <text x="200" y="70" text-anchor="middle" font-size="22" font-weight="bold" fill="#1e293b">CAFÉ DEL SOL</text>
  <text x="200" y="95" text-anchor="middle" font-size="12" fill="#64748b">Calle Mayor 45, Madrid</text>
  <text x="200" y="115" text-anchor="middle" font-size="12" fill="#64748b">NIF: B-89234102 | Ticket #04821</text>
  <text x="200" y="135" text-anchor="middle" font-size="12" fill="#64748b">Fecha: 2026-10-12 14:22</text>
  
  <line x1="40" y1="155" x2="360" y2="155" stroke="#cbd5e1" stroke-dasharray="4"/>
  
  <text x="45" y="180" font-weight="bold" font-size="13" fill="#334155">ITEM</text>
  <text x="220" y="180" font-weight="bold" font-size="13" fill="#334155">CANT</text>
  <text x="320" y="180" font-weight="bold" font-size="13" fill="#334155" text-anchor="end">TOTAL</text>
  
  <line x1="40" y1="195" x2="360" y2="195" stroke="#cbd5e1"/>
  
  <text x="45" y="225" font-size="13" fill="#1e293b">Café Espresso Doble</text>
  <text x="230" y="225" font-size="13" fill="#1e293b">2</text>
  <text x="320" y="225" font-size="13" fill="#1e293b" text-anchor="end">€ 5.00</text>
  
  <text x="45" y="255" font-size="13" fill="#1e293b">Croissant Artesano</text>
  <text x="230" y="255" font-size="13" fill="#1e293b">1</text>
  <text x="320" y="255" font-size="13" fill="#1e293b" text-anchor="end">€ 2.80</text>
  
  <text x="45" y="285" font-size="13" fill="#1e293b">Tostada Aguacate y Pavo</text>
  <text x="230" y="285" font-size="13" fill="#1e293b">1</text>
  <text x="320" y="285" font-size="13" fill="#1e293b" text-anchor="end">€ 6.50</text>
  
  <text x="45" y="315" font-size="13" fill="#1e293b">Zumo de Naranja Natural</text>
  <text x="230" y="315" font-size="13" fill="#1e293b">2</text>
  <text x="320" y="315" font-size="13" fill="#1e293b" text-anchor="end">€ 7.00</text>

  <line x1="40" y1="350" x2="360" y2="350" stroke="#cbd5e1" stroke-dasharray="4"/>
  
  <text x="45" y="380" font-size="13" fill="#64748b">SUBTOTAL</text>
  <text x="320" y="380" font-size="13" fill="#64748b" text-anchor="end">€ 19.36</text>
  
  <text x="45" y="405" font-size="13" fill="#64748b">IVA (10%)</text>
  <text x="320" y="405" font-size="13" fill="#64748b" text-anchor="end">€ 1.94</text>
  
  <line x1="40" y1="425" x2="360" y2="425" stroke="#334155" stroke-width="1.5"/>
  
  <text x="45" y="455" font-size="17" font-weight="bold" fill="#0f172a">TOTAL A PAGAR</text>
  <text x="320" y="455" font-size="18" font-weight="bold" fill="#0f172a" text-anchor="end">€ 21.30</text>
  
  <text x="200" y="500" text-anchor="middle" font-size="12" fill="#64748b">Pago: Visa **** 8912 (Aprobado)</text>
  <text x="200" y="530" text-anchor="middle" font-size="12" font-style="italic" fill="#94a3b8">¡Gracias por su visita!</text>
</svg>
`.trim();

const inventorySvg = `
<svg width="600" height="420" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff;font-family:sans-serif;padding:20px;">
  <rect width="560" height="380" x="20" y="20" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="40" y="60" font-size="20" font-weight="bold" fill="#0f172a">REPORTE DE INVENTARIO - BODEGA NORTE</text>
  <text x="40" y="85" font-size="12" fill="#64748b">Almacén Central | Auditoría Mensual 2026</text>
  
  <rect x="40" y="105" width="520" height="35" fill="#3b82f6" rx="4"/>
  <text x="55" y="128" font-weight="bold" font-size="12" fill="#ffffff">SKU</text>
  <text x="140" y="128" font-weight="bold" font-size="12" fill="#ffffff">PRODUCTO</text>
  <text x="290" y="128" font-weight="bold" font-size="12" fill="#ffffff">CATEGORÍA</text>
  <text x="410" y="128" font-weight="bold" font-size="12" fill="#ffffff">STOCK</text>
  <text x="490" y="128" font-weight="bold" font-size="12" fill="#ffffff">PRECIO</text>
  
  <rect x="40" y="145" width="520" height="35" fill="#ffffff"/>
  <text x="55" y="168" font-size="12" fill="#1e293b">SKU-101</text>
  <text x="140" y="168" font-size="12" fill="#1e293b">Monitor UltraSharp 27"</text>
  <text x="290" y="168" font-size="12" fill="#1e293b">Electrónica</text>
  <text x="410" y="168" font-size="12" fill="#1e293b">24</text>
  <text x="490" y="168" font-size="12" fill="#1e293b">$ 320.00</text>

  <rect x="40" y="185" width="520" height="35" fill="#f1f5f9"/>
  <text x="55" y="208" font-size="12" fill="#1e293b">SKU-204</text>
  <text x="140" y="208" font-size="12" fill="#1e293b">Teclado Mecánico RGB</text>
  <text x="290" y="208" font-size="12" fill="#1e293b">Periféricos</text>
  <text x="410" y="208" font-size="12" fill="#1e293b">85</text>
  <text x="490" y="208" font-size="12" fill="#1e293b">$ 75.50</text>

  <rect x="40" y="225" width="520" height="35" fill="#ffffff"/>
  <text x="55" y="248" font-size="12" fill="#1e293b">SKU-309</text>
  <text x="140" y="248" font-size="12" fill="#1e293b">Ratón Ergonómico Pro</text>
  <text x="290" y="248" font-size="12" fill="#1e293b">Periféricos</text>
  <text x="410" y="248" font-size="12" fill="#1e293b">120</text>
  <text x="490" y="248" font-size="12" fill="#1e293b">$ 45.00</text>

  <rect x="40" y="265" width="520" height="35" fill="#f1f5f9"/>
  <text x="55" y="288" font-size="12" fill="#1e293b">SKU-412</text>
  <text x="140" y="288" font-size="12" fill="#1e293b">Silla Ergonómica Mesh</text>
  <text x="290" y="288" font-size="12" fill="#1e293b">Mobiliario</text>
  <text x="410" y="288" font-size="12" fill="#1e293b">15</text>
  <text x="490" y="288" font-size="12" fill="#1e293b">$ 210.00</text>

  <rect x="40" y="305" width="520" height="35" fill="#ffffff"/>
  <text x="55" y="328" font-size="12" fill="#1e293b">SKU-550</text>
  <text x="140" y="328" font-size="12" fill="#1e293b">Cable USB-C Blindado 2m</text>
  <text x="290" y="328" font-size="12" fill="#1e293b">Accesorios</text>
  <text x="410" y="328" font-size="12" fill="#1e293b">340</text>
  <text x="490" y="328" font-size="12" fill="#1e293b">$ 12.90</text>
</svg>
`.trim();

function svgToDataUrl(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'receipt-sample',
    title: 'Ticket / Recibo de Café',
    description: 'Factura simplificada con ítems, subtotales, IVA y total',
    preset: 'receipt',
    dataUrl: svgToDataUrl(receiptSvg),
  },
  {
    id: 'inventory-sample',
    title: 'Tabla de Inventario',
    description: 'Lista de almacén con SKU, productos, stock y precios',
    preset: 'inventory',
    dataUrl: svgToDataUrl(inventorySvg),
  },
];
