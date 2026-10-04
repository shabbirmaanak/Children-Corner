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
    ctx.fillStyle = '#FAF7F2';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.12)';
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
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(originX, originY, roomScreenW, roomScreenH);
    ctx.strokeRect(originX, originY, roomScreenW, roomScreenH);

    // Dimension labels
    ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#0369a1';
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

      const zoneColorMap: Record<string, { fill: string; stroke: string; bar: string }> = {
        active: { fill: 'rgba(248, 200, 34, 0.18)', stroke: '#d97706', bar: '#f59e0b' },
        calm: { fill: 'rgba(62, 180, 137, 0.18)', stroke: '#059669', bar: '#10b981' },
        focus: { fill: 'rgba(14, 165, 233, 0.18)', stroke: '#0284c7', bar: '#0ea5e9' },
        storage: { fill: 'rgba(255, 112, 82, 0.18)', stroke: '#ea580c', bar: '#ff7052' }
      };
      const zTheme = zoneColorMap[item.zone] || { fill: 'rgba(245, 245, 244, 0.8)', stroke: '#a8a29e', bar: '#78716c' };

      if (item.category === 'rug') {
        ctx.strokeStyle = '#f59e0b';
        ctx.fillStyle = 'rgba(248, 200, 34, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(ix, iy, iw, ih);
        ctx.fillRect(ix, iy, iw, ih);
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = zTheme.fill;
        ctx.strokeStyle = zTheme.stroke;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(ix, iy, iw, ih, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = zTheme.bar;
        ctx.fillRect(ix, iy, iw, 3);

        ctx.font = 'bold 9px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#1c1917';
        ctx.textAlign = 'center';
        ctx.fillText(item.name.substring(0, 16), ix + iw / 2, iy + ih / 2 + 3);
      }
    });

  }, [isOpen, roomConfig, furniture]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-stone-50/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-mint-500 to-azure-500 text-white flex items-center justify-center shadow-lg shadow-azure-500/20 ring-2 ring-white/80">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-display">
                Architectural Blueprint & Family Registration Plan
              </h2>
              <p className="text-xs text-stone-500">1-Page official blueprint with ITS52, Mauze, Jamiat and HOF details</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-azure-600 to-mint-500 hover:from-azure-500 hover:to-mint-400 text-white font-bold text-xs transition-all shadow-md shadow-azure-500/25"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Blueprint Sheet */}
        <div 
          ref={printAreaRef}
          className="p-6 overflow-y-auto space-y-6 bg-birch-50 text-stone-800 flex-1"
        >
          {/* Blueprint Title Block with ITS & Family Registration */}
          <div className="border border-azure-200 rounded-3xl p-5 bg-white shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-azure-600 font-bold">
                  DEVELOPMENTAL BLUEPRINT SPECIFICATION • PROJECT CHILDREN'S CORNER
                </div>
                <h1 className="text-xl font-black text-stone-900 font-display mt-0.5">
                  {roomConfig.childName || "Child"}'s Room — {milestone.stageTitle}
                </h1>
                {roomConfig.itsId && (
                  <div className="text-xs font-mono text-amber-600 font-bold mt-0.5">
                    ITS52: {roomConfig.itsId}
                  </div>
                )}
              </div>

              {/* Compliance Seal */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Audit Score: {auditScore}% Compliant</span>
              </div>
            </div>

            {/* Family & ITS Registration Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-stone-50 p-3 rounded-2xl border border-stone-200">
              <div>
                <div className="text-[10px] font-mono uppercase text-stone-500">Child / Member</div>
                <div className="font-bold text-stone-900 mt-0.5 truncate">{roomConfig.childName || '—'}</div>
                <div className="text-[10px] font-mono text-amber-600 font-bold">ITS: {roomConfig.itsId || '—'}</div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-stone-500">Head of Family (HOF)</div>
                <div className="font-bold text-stone-900 mt-0.5 truncate">{roomConfig.hofName || '—'}</div>
                <div className="text-[10px] font-mono text-emerald-600 font-bold">HOF ITS: {roomConfig.hofIts || '—'}</div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-stone-500">Mauze</div>
                <div className="font-bold text-azure-700 mt-0.5 truncate">{roomConfig.mauze || '—'}</div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-stone-500">Jamiat</div>
                <div className="font-bold text-stone-700 mt-0.5 truncate">{roomConfig.jamiat || '—'}</div>
              </div>
            </div>

            {/* Architecture Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs">
                <div className="text-stone-400 text-[10px] uppercase font-mono">Room Dimensions</div>
                <div className="font-bold text-stone-900 mt-0.5">
                  {(roomConfig.widthCm / 100).toFixed(2)}m × {(roomConfig.lengthCm / 100).toFixed(2)}m
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs">
                <div className="text-stone-400 text-[10px] uppercase font-mono">Net Usable Area</div>
                <div className="font-bold text-sunshine-600 mt-0.5 font-mono">
                  {totalAreaSqM} m²
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs">
                <div className="text-stone-400 text-[10px] uppercase font-mono">Child Age Bracket</div>
                <div className="font-bold text-azure-600 mt-0.5">
                  {roomConfig.ageBracket} years
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs">
                <div className="text-stone-400 text-[10px] uppercase font-mono">Est. Procurement</div>
                <div className="font-bold text-emerald-600 mt-0.5 font-mono">
                  {curr.symbol}{totalCostConverted.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* 2D Blueprint Floorplan Canvas */}
          <div className="border border-stone-200 rounded-3xl p-4 bg-white shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-xs text-stone-500 mb-3">
              <span className="font-bold text-stone-800 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-azure-500" />
                <span>2D Top-Down Architectural Layout Grid</span>
              </span>
              <span className="font-mono text-[11px] text-azure-600 font-bold">Scale: 1:50</span>
            </div>

            <canvas
              ref={canvasRef}
              className="rounded-2xl border border-stone-200 shadow-inner max-w-full"
            />
          </div>

          {/* Zone Allocations Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {allocations.map((alloc) => (
              <div
                key={alloc.zone}
                className="p-3 rounded-2xl border border-stone-200 bg-white shadow-2xs text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800">{alloc.label}</span>
                  <span className="font-mono text-amber-600 font-bold">{alloc.targetPercent}%</span>
                </div>
                <div className="text-[11px] text-stone-500">{alloc.targetAreaSqM} m² allocated</div>
              </div>
            ))}
          </div>

          {/* Itemized Procurement List */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3">
            <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider font-display">
              Itemized Furniture Specifications ({curr.code})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 text-[10px] uppercase font-mono">
                    <th className="py-2">Item Name</th>
                    <th className="py-2">Zone</th>
                    <th className="py-2">Dimensions</th>
                    <th className="py-2">Lighting</th>
                    <th className="py-2">Price ({curr.symbol})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {furniture.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/50">
                      <td className="py-2.5 font-semibold text-stone-900">{item.name}</td>
                      <td className="py-2.5 capitalize text-stone-600">{item.zone}</td>
                      <td className="py-2.5 font-mono text-[11px] text-stone-500">{item.width} × {item.height} cm</td>
                      <td className="py-2.5 text-stone-500">{item.lightingKelvin ? `${item.lightingKelvin}K` : '—'}</td>
                      <td className="py-2.5 font-bold font-mono text-emerald-600">
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
