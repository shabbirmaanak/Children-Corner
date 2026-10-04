import React, { useRef, useEffect } from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  Sparkles, 
  Sun, 
  Ruler,
  Building2,
  MapPin,
  Users,
  Hash
} from 'lucide-react';
import { Box, RoomConfig, CurrencyCode, CURRENCIES } from '../types/index.ts';
import { computeZoneAllocations, getOrientedBox } from '../engine/spatialEngine.ts';
import { DEVELOPMENTAL_RULES } from '../data/furnitureCatalog.ts';

interface BlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomConfig: RoomConfig;
  furniture: Box[];
  auditScore: number;
  currency: CurrencyCode;
}

export const BlueprintModal: React.FC<BlueprintModalProps> = ({
  isOpen,
  onClose,
  roomConfig,
  furniture,
  auditScore,
  currency
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const printAreaRef = useRef<HTMLDivElement | null>(null);

  const curr = CURRENCIES[currency];
  const milestone = DEVELOPMENTAL_RULES[roomConfig.ageBracket];
  const allocations = computeZoneAllocations(roomConfig.ageBracket, roomConfig.widthCm, roomConfig.lengthCm);
  const totalAreaSqM = ((roomConfig.widthCm * roomConfig.lengthCm) / 10000).toFixed(2);
  const totalCostUSD = furniture.reduce((sum, item) => sum + (item.priceEst || 0), 0);
  const totalCostConverted = Math.round(totalCostUSD * curr.rateFromUSD);

  // Render Blueprint Floorplan Canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 580;
    const height = 400;
    const dpr = 2;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Blueprint background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Scale room inside canvas
    const margin = 50;
    const availW = width - margin * 2;
    const availH = height - margin * 2;
    const scale = Math.min(availW / roomConfig.widthCm, availH / roomConfig.lengthCm);

    const originX = (width - roomConfig.widthCm * scale) / 2;
    const originY = (height - roomConfig.lengthCm * scale) / 2;
    const roomScreenW = roomConfig.widthCm * scale;
    const roomScreenH = roomConfig.lengthCm * scale;

    // Room wall boundaries
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(originX, originY, roomScreenW, roomScreenH);
    ctx.strokeRect(originX, originY, roomScreenW, roomScreenH);

    // Dimension labels
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#7dd3fc';
    ctx.textAlign = 'center';
    ctx.fillText(`${(roomConfig.widthCm / 100).toFixed(2)} m (${roomConfig.widthCm} cm)`, originX + roomScreenW / 2, originY - 12);
    
    ctx.save();
    ctx.translate(originX - 12, originY + roomScreenH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${(roomConfig.lengthCm / 100).toFixed(2)} m (${roomConfig.lengthCm} cm)`, 0, 0);
    ctx.restore();

    // Draw Furniture Pieces
    furniture.forEach((item) => {
      const ob = getOrientedBox(item);
      const ix = originX + ob.xMin * scale;
      const iy = originY + ob.yMin * scale;
      const iw = ob.w * scale;
      const ih = ob.h * scale;

      const zoneColorMap: Record<string, string> = {
        active: '#f59e0b',
        calm: '#6366f1',
        focus: '#10b981',
        storage: '#f97316'
      };
      const zColor = zoneColorMap[item.zone] || '#64748b';

      if (item.category === 'rug') {
        ctx.strokeStyle = '#f59e0b';
        ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(ix, iy, iw, ih);
        ctx.fillRect(ix, iy, iw, ih);
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = zColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(ix, iy, iw, ih, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = zColor;
        ctx.fillRect(ix, iy, iw, 4);

        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText(item.name.substring(0, 16), ix + iw / 2, iy + ih / 2);
      }
    });

  }, [isOpen, roomConfig, furniture]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                Architectural Blueprint & Family Registration Plan
              </h2>
              <p className="text-xs text-slate-400">1-Page official blueprint with ITS52, Mauze, Jamiat and HOF details</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Blueprint Sheet */}
        <div 
          ref={printAreaRef}
          className="p-6 overflow-y-auto space-y-6 bg-slate-950 text-slate-100 flex-1"
        >
          {/* Blueprint Title Block with ITS & Family Registration */}
          <div className="border-2 border-sky-600/60 rounded-2xl p-5 bg-sky-950/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-700/40 pb-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold">
                  DEVELOPMENTAL BLUEPRINT SPECIFICATION • PROJECT CHILDREN'S CORNER
                </div>
                <h1 className="text-xl font-black text-white font-display mt-0.5">
                  {roomConfig.childName || "Child"}'s Room — {milestone.stageTitle}
                </h1>
                {roomConfig.itsId && (
                  <div className="text-xs font-mono text-amber-400 font-bold mt-0.5">
                    ITS52: {roomConfig.itsId}
                  </div>
                )}
              </div>

              {/* Compliance Seal */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Audit Score: {auditScore}% Compliant</span>
              </div>
            </div>

            {/* Family & ITS Registration Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">Child / Member</div>
                <div className="font-bold text-white mt-0.5 truncate">{roomConfig.childName || '—'}</div>
                <div className="text-[10px] font-mono text-amber-400 font-bold">ITS: {roomConfig.itsId || '—'}</div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">Head of Family (HOF)</div>
                <div className="font-bold text-slate-200 mt-0.5 truncate">{roomConfig.hofName || '—'}</div>
                <div className="text-[10px] font-mono text-emerald-400 font-bold">HOF ITS: {roomConfig.hofIts || '—'}</div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">Mauze</div>
                <div className="font-bold text-indigo-300 mt-0.5 truncate">{roomConfig.mauze || '—'}</div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">Jamiat</div>
                <div className="font-bold text-slate-300 mt-0.5 truncate">{roomConfig.jamiat || '—'}</div>
              </div>
            </div>

            {/* Architecture Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-mono">Room Dimensions</div>
                <div className="font-bold text-white mt-0.5">
                  {(roomConfig.widthCm / 100).toFixed(2)}m × {(roomConfig.lengthCm / 100).toFixed(2)}m
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-mono">Net Usable Area</div>
                <div className="font-bold text-amber-400 mt-0.5 font-mono">
                  {totalAreaSqM} m²
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-mono">Child Age Bracket</div>
                <div className="font-bold text-indigo-300 mt-0.5">
                  {roomConfig.ageBracket} years
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-mono">Est. Procurement</div>
                <div className="font-bold text-emerald-400 mt-0.5 font-mono">
                  {curr.symbol}{totalCostConverted.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* 2D Blueprint Floorplan Canvas */}
          <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900/80 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-sky-400" />
                <span>2D Top-Down Architectural Layout Grid</span>
              </span>
              <span className="font-mono text-[11px] text-sky-400">Scale: 1:50</span>
            </div>

            <canvas
              ref={canvasRef}
              className="rounded-xl border border-sky-900/50 shadow-inner max-w-full"
            />
          </div>

          {/* Zone Allocations Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {allocations.map((alloc) => (
              <div
                key={alloc.zone}
                className="p-3 rounded-xl border border-slate-800 bg-slate-900 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{alloc.label}</span>
                  <span className="font-mono text-amber-400 font-bold">{alloc.targetPercent}%</span>
                </div>
                <div className="text-[11px] text-slate-400">{alloc.targetAreaSqM} m² allocated</div>
              </div>
            ))}
          </div>

          {/* Itemized Procurement List */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              Itemized Furniture Specifications ({curr.code})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                    <th className="py-2">Item Name</th>
                    <th className="py-2">Zone</th>
                    <th className="py-2">Dimensions</th>
                    <th className="py-2">Lighting</th>
                    <th className="py-2">Price ({curr.symbol})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {furniture.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 font-semibold text-slate-200">{item.name}</td>
                      <td className="py-2 capitalize">{item.zone}</td>
                      <td className="py-2 font-mono text-[11px]">{item.width} × {item.height} cm</td>
                      <td className="py-2">{item.lightingKelvin ? `${item.lightingKelvin}K` : '—'}</td>
                      <td className="py-2 font-bold font-mono text-emerald-400">
                        {curr.symbol}{Math.round((item.priceEst || 0) * curr.rateFromUSD).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
