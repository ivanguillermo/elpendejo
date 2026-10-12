import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileJson,
  Copy,
  Check,
  Download,
  ExternalLink,
  Plus,
  Trash2,
  Send,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  copyTsvToClipboard,
  downloadCsv,
  downloadJson,
} from '../utils/sheetsExporter';

export interface ExtractedData {
  title?: string;
  summary?: string;
  metadata?: Record<string, any>;
  columns: string[];
  rows: Record<string, any>[];
  rawJsonString?: string;
}

interface ResultViewerProps {
  data: ExtractedData;
  onDataChange: (updated: ExtractedData) => void;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({ data, onDataChange }) => {
  const [activeTab, setActiveTab] = useState<'table' | 'json' | 'metadata'>('table');
  const [copiedTsv, setCopiedTsv] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [showWebhookPanel, setShowWebhookPanel] = useState(false);

  const columns = data.columns || [];
  const rows = data.rows || [];

  const handleCellEdit = (rowIndex: number, colKey: string, newValue: string) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [colKey]: newValue,
    };
    onDataChange({
      ...data,
      rows: updatedRows,
    });
  };

  const handleAddRow = () => {
    const newRow: Record<string, any> = {};
    columns.forEach((col) => {
      newRow[col] = '';
    });
    onDataChange({
      ...data,
      rows: [...rows, newRow],
    });
  };

  const handleDeleteRow = (rowIndex: number) => {
    const updatedRows = rows.filter((_, idx) => idx !== rowIndex);
    onDataChange({
      ...data,
      rows: updatedRows,
    });
  };

  const handleAddColumn = () => {
    const colName = window.prompt('Nombre de la nueva columna:');
    if (!colName || !colName.trim()) return;
    const cleanName = colName.trim();
    if (columns.includes(cleanName)) {
      alert('Esa columna ya existe.');
      return;
    }
    const updatedCols = [...columns, cleanName];
    const updatedRows = rows.map((r) => ({ ...r, [cleanName]: '' }));
    onDataChange({
      ...data,
      columns: updatedCols,
      rows: updatedRows,
    });
  };

  const handleCopyForSheets = async () => {
    const ok = await copyTsvToClipboard(columns, rows);
    if (ok) {
      setCopiedTsv(true);
      setTimeout(() => setCopiedTsv(false), 2500);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleSendWebhook = async () => {
    if (!webhookUrl || !webhookUrl.startsWith('https://')) {
      alert('Por favor introduce una URL válida de Webhook de Google Apps Script (inicia con https://)');
      return;
    }
    setIsSendingWebhook(true);
    setWebhookStatus(null);
    try {
      const res = await fetch('/api/export/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl,
          sheetName: data.title || 'Extracción_AI',
          data: {
            columns,
            rows,
            metadata: data.metadata,
          },
        }),
      });
      const resData = await res.json();
      if (res.ok) {
        setWebhookStatus('¡Datos enviados exitosamente a Google Sheets!');
      } else {
        setWebhookStatus(`Error: ${resData.error || 'No se pudo enviar'}`);
      }
    } catch (err: any) {
      setWebhookStatus(`Error al conectar: ${err.message}`);
    } finally {
      setIsSendingWebhook(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Banner / Summary */}
      <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Extracción Exitosa
            </span>
            <span className="text-xs text-slate-300">
              {rows.length} {rows.length === 1 ? 'fila' : 'filas'} • {columns.length} columnas
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            {data.title || 'Datos Extraídos de la Imagen'}
          </h3>
          {data.summary && (
            <p className="text-xs text-slate-300 max-w-2xl mt-0.5 line-clamp-2">
              {data.summary}
            </p>
          )}
        </div>

        {/* Action Buttons for Sheets */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopyForSheets}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm ${
              copiedTsv
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-emerald-500/20'
            }`}
            title="Copia en formato TSV. Abre Google Sheets y pulsa Ctrl+V para pegar en filas y columnas."
          >
            {copiedTsv ? (
              <>
                <Check className="w-4 h-4" />
                ¡Copiado para Google Sheets!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar para Google Sheets
              </>
            )}
          </button>

          <button
            onClick={() => downloadCsv(columns, rows, `${(data.title || 'datos').replace(/\s+/g, '_')}.csv`)}
            className="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl flex items-center gap-1.5 transition-colors"
            title="Descargar archivo CSV compatible con Google Sheets y Excel"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>

          <a
            href="https://sheets.new"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl flex items-center gap-1.5 transition-colors"
            title="Abre una nueva hoja en blanco de Google Sheets"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            sheets.new
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between px-5 pt-3 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('table')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'table'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Vista Hoja de Cálculo ({rows.length})
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'json'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileJson className="w-4 h-4" />
            JSON Estructurado
          </button>

          {data.metadata && Object.keys(data.metadata).length > 0 && (
            <button
              onClick={() => setActiveTab('metadata')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'metadata'
                  ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Info className="w-4 h-4" />
              Metadatos Generales
            </button>
          )}
        </div>

        <button
          onClick={() => setShowWebhookPanel(!showWebhookPanel)}
          className="text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1 py-1"
        >
          {showWebhookPanel ? 'Ocultar Webhook' : 'Conectar Apps Script Webhook'}
          {showWebhookPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Webhook Sync Dropdown */}
      {showWebhookPanel && (
        <div className="p-4 bg-indigo-50/60 border-b border-indigo-100 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-indigo-600" />
              Sincronización directa a Google Sheets mediante Apps Script Webhook
            </span>
            <span className="text-[11px] text-slate-500">
              (Pega la URL de tu Web App desplegada en Google Sheets)
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSendWebhook}
              disabled={isSendingWebhook}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              {isSendingWebhook ? 'Enviando...' : 'Guardar en Sheet'}
            </button>
          </div>
          {webhookStatus && (
            <p className="text-xs font-medium text-indigo-900 mt-1">{webhookStatus}</p>
          )}
        </div>
      )}

      {/* Tab 1: Table Spreadsheet View */}
      {activeTab === 'table' && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="text-slate-500">
              💡 <em>Puedes hacer clic sobre cualquier celda para editar el valor antes de exportarlo.</em>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddRow}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Fila
              </button>
              <button
                onClick={handleAddColumn}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Columna
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-800">
                  <th className="py-2.5 px-3 w-10 text-center text-slate-400">#</th>
                  {columns.map((col, idx) => (
                    <th key={idx} className="py-2.5 px-3 border-r border-slate-200 min-w-[120px]">
                      {col}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 w-12 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="py-8 text-center text-slate-400">
                      No se encontraron filas estructuradas. Agrega una fila manualmente o prueba con otra plantilla.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="border-b border-slate-200 hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px] bg-slate-50/50">
                        {rIdx + 1}
                      </td>
                      {columns.map((col, cIdx) => (
                        <td key={cIdx} className="py-1.5 px-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={row[col] !== undefined ? String(row[col]) : ''}
                            onChange={(e) => handleCellEdit(rIdx, col, e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-transparent hover:bg-white focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 rounded-sm"
                          />
                        </td>
                      ))}
                      <td className="py-1 px-2 text-center">
                        <button
                          onClick={() => handleDeleteRow(rIdx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                          title="Eliminar fila"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: JSON View */}
      {activeTab === 'json' && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Formato JSON generado por Gemini Vision listo para API o exportación:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyJson}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedJson ? '¡Copiado!' : 'Copiar JSON'}
              </button>
              <button
                onClick={() => downloadJson(data, `${(data.title || 'datos').replace(/\s+/g, '_')}.json`)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar .json
              </button>
            </div>
          </div>
          <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-[450px] leading-relaxed">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {/* Tab 3: Metadata View */}
      {activeTab === 'metadata' && data.metadata && (
        <div className="p-5">
          <h4 className="text-sm font-bold text-slate-800 mb-3">
            Datos Generales y Cabeceras Detectadas
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(data.metadata).map(([key, val], idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block break-words">
                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
