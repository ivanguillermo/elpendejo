/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Receipt,
  Boxes,
  TableProperties,
  ScanEye,
  SlidersHorizontal,
  RefreshCw,
  HelpCircle,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  Trash2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { GuideModal } from './components/GuideModal';
import { ResultViewer, ExtractedData } from './components/ResultViewer';
import { SAMPLE_IMAGES, SampleImage } from './data/samples';

type ExtractionPreset = 'receipt' | 'inventory' | 'table' | 'objects' | 'custom';

interface HistoryItem {
  id: string;
  timestamp: string;
  title: string;
  preset: ExtractionPreset;
  imageThumbnail: string;
  data: ExtractedData;
}

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [preset, setPreset] = useState<ExtractionPreset>('receipt');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extractedResult, setExtractedResult] = useState<ExtractedData | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [serverStatus, setServerStatus] = useState<{ hasApiKey: boolean; model: string } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check server status on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => setServerStatus(data))
      .catch((err) => console.warn('Could not fetch server status:', err));
  }, []);

  // Listen for Ctrl+V / paste image anywhere
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleFileProcess(blob);
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileProcess = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
      return;
    }
    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: SampleImage) => {
    setErrorMsg(null);
    setSelectedImage(sample.dataUrl);
    setImageMime('image/svg+xml');
    setPreset(sample.preset);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setErrorMsg('Primero sube o selecciona una imagen.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: selectedImage,
          mimeType: imageMime,
          preset,
          customPrompt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error al analizar la imagen.');
      }

      setExtractedResult(data.data);

      // Save to recent history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: data.data.title || 'Análisis de Imagen',
        preset,
        imageThumbnail: selectedImage,
        data: data.data,
      };
      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 7)]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al comunicarse con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const presetOptions = [
    {
      id: 'receipt' as ExtractionPreset,
      name: 'Factura / Ticket',
      desc: 'Ítems, precios, impuestos, total y fecha',
      icon: Receipt,
    },
    {
      id: 'inventory' as ExtractionPreset,
      name: 'Inventario / Catálogo',
      desc: 'Productos, SKU, cantidad y categoría',
      icon: Boxes,
    },
    {
      id: 'table' as ExtractionPreset,
      name: 'Tabla de Documento',
      desc: 'Transcribe filas y columnas exactas',
      icon: TableProperties,
    },
    {
      id: 'objects' as ExtractionPreset,
      name: 'Inspección de Objetos',
      desc: 'Detecta elementos visuales y conteo',
      icon: ScanEye,
    },
    {
      id: 'custom' as ExtractionPreset,
      name: 'Personalizado',
      desc: 'Tú defines los campos en lenguaje natural',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-xl shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  ImageToSheet AI
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-full">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Lee imágenes, genera JSON estructurado y expórtalo a Google Sheets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Status pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Motor AI Activo</span>
            </div>

            {/* Guide Button */}
            <button
              onClick={() => setIsGuideOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Guía: API Key &amp; Sheets</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Upload & Configuration (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Image Upload Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Paso 1: Imagen a Analizar
                </span>
                {selectedImage && (
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Quitar imagen
                  </button>
                )}
              </div>

              {/* Upload Dropzone */}
              {!selectedImage ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                      : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileProcess(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-12 h-12 mx-auto mb-3 text-indigo-600 bg-indigo-50 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Sube una foto o arrástrala aquí
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Facturas, recibos, inventario, tablas o documentos (JPG, PNG, WEBP)
                  </p>
                  <p className="text-[11px] text-indigo-600 font-medium mt-2">
                    💡 O presiona <strong>Ctrl + V</strong> para pegar directamente desde el portapapeles
                  </p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-full max-h-64 object-contain mx-auto"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors"
                    >
                      Cambiar foto
                    </button>
                  </div>
                </div>
              )}

              {/* Sample Preloaded Images for instant testing */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  O prueba con imágenes de ejemplo:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_IMAGES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className="p-2.5 text-left border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 text-indigo-600 bg-indigo-50 group-hover:bg-indigo-100 rounded-lg">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-900 truncate">
                          {sample.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                        {sample.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Presets Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Paso 2: Formato de Extracción a JSON
              </span>

              <div className="space-y-2">
                {presetOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = preset === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setPreset(opt.id)}
                      className={`w-full p-3 text-left rounded-xl border transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg mt-0.5 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold ${
                              isSelected ? 'text-indigo-950' : 'text-slate-800'
                            }`}
                          >
                            {opt.name}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Prompt Box */}
              {preset === 'custom' && (
                <div className="pt-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Especifica qué campos y cómo quieres que los organice:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ejemplo: Extrae las columnas: Paciente, Fecha, Diagnóstico, Médico y Medicamentos..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  />
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !selectedImage}
                className="w-full py-3.5 px-4 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini Vision Analizando Imagen...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Leer Imagen y Generar JSON / Sheets</span>
                  </>
                )}
              </button>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">{errorMsg}</p>
                    <p className="text-[11px] text-rose-600">
                      Revisa que la imagen sea legible o consulta la sección de ayuda en la esquina superior.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Session History */}
            {history.length > 0 && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
                  <Clock className="w-3.5 h-3.5" /> Extracciones Recientes
                </span>
                <div className="space-y-1.5">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedImage(item.imageThumbnail);
                        setExtractedResult(item.data);
                        setPreset(item.preset);
                      }}
                      className="w-full p-2 text-left rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs transition-colors border border-transparent hover:border-slate-200"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <img
                          src={item.imageThumbnail}
                          alt=""
                          className="w-7 h-7 rounded object-cover border border-slate-200 shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 truncate">{item.title}</p>
                          <p className="text-[10px] text-slate-400">{item.timestamp}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-indigo-600 font-medium shrink-0 ml-2">
                        {item.data.rows?.length || 0} filas
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Extracted Results & Sheets Flow (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {isLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <Sparkles className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Analizando visualmente la imagen...
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Gemini 3.8 Flash está detectando texto, cuadrículas y valores para convertirlos en JSON estructurado y filas tabulares.
                  </p>
                </div>
              </div>
            ) : extractedResult ? (
              <ResultViewer
                data={extractedResult}
                onDataChange={(updated) => setExtractedResult(updated)}
              />
            ) : (
              /* Empty Placeholder State */
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs space-y-5">
                <div className="w-16 h-16 mx-auto bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Layers className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-base font-bold text-slate-800">
                    Listo para extraer datos de imágenes a Sheets
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Sube una foto de un recibo, documento o tabla a la izquierda. Gemini procesará la imagen, creará el JSON y te permitirá copiar o exportar las filas a tu Google Sheet en segundos.
                  </p>
                </div>

                {/* 3 Step Explanation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center mb-2">
                      1
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">Sube la Foto</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Cualquier comprobante, tabla o lista de productos.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center mb-2">
                      2
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">IA genera JSON</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Extrae filas y columnas con precisión milimétrica.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center mb-2">
                      3
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">Guarda en Sheet</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Copia con Ctrl+V, descarga CSV o usa Webhook.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Guide Modal */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
