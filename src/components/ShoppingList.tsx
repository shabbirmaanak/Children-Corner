import React from 'react';
import { 
  ShoppingBag, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Sun, 
  Copy, 
  Check,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Box, RoomConfig } from '../types/index.ts';

interface ShoppingListProps {
  furniture: Box[];
  roomConfig: RoomConfig;
  onExportBlueprint: () => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({
  furniture,
  roomConfig,
  onExportBlueprint
}) => {
  const [copied, setCopied] = React.useState(false);

  const totalCost = furniture.reduce((sum, item) => sum + (item.priceEst || 0), 0);

  const handleCopy = () => {
    const text = furniture.map((item, idx) => 
      `${idx + 1}. ${item.name} (${item.width}x${item.height} cm) - Est: $${item.priceEst || 'N/A'} - Retailer: ${item.retailer || 'Standard'}`
    ).join('\n');

    navigator.clipboard.writeText(`CHILDREN'S CORNER SPECIFICATIONS:\nRoom: ${roomConfig.childName}'s Room (${(roomConfig.widthCm/100).toFixed(1)}x${(roomConfig.lengthCm/100).toFixed(1)}m)\nAge: ${roomConfig.ageBracket} yrs\nTotal Est: $${totalCost}\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 lg:p-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-950/60 via-slate-900 to-indigo-950/40 p-6 rounded-3xl border border-orange-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ShoppingBag className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl font-bold text-white font-display">
              Curated Furniture & Lighting Manifest
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Detailed procurement specifications, exact child anthropometric dimensions, Kelvin ratings, and certified non-toxic safety standards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Specs'}</span>
          </button>

          <button
            onClick={onExportBlueprint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Blueprint</span>
          </button>
        </div>
      </div>

      {/* Budget Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Total Placed Modules</div>
            <div className="text-2xl font-bold text-white mt-0.5">{furniture.length} items</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Estimated Procurement Cost</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">${totalCost}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Child Age Bracket</div>
            <div className="text-2xl font-bold text-amber-400 mt-0.5">{roomConfig.ageBracket} years</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Items Manifest Table */}
      <div className="bg-slate-850 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Itemized Specifications</h3>
          <span className="text-xs text-slate-400">{furniture.length} items in current layout</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Furniture Module</th>
                <th className="py-3 px-4 font-semibold">Zone</th>
                <th className="py-3 px-4 font-semibold">Dimensions</th>
                <th className="py-3 px-4 font-semibold">Lighting Kelvin</th>
                <th className="py-3 px-4 font-semibold">Safety & Certifications</th>
                <th className="py-3 px-4 font-semibold">Est. Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {furniture.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-[11px] text-slate-400">{item.retailer || 'Standard Modular'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.zone === 'active' ? 'bg-amber-950/40 border-amber-800/40 text-amber-300' :
                      item.zone === 'calm' ? 'bg-indigo-950/40 border-indigo-800/40 text-indigo-300' :
                      item.zone === 'focus' ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300' :
                      'bg-orange-950/40 border-orange-800/40 text-orange-300'
                    }`}>
                      {item.zone.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {item.width} × {item.height} cm
                    {item.shelfHeightCm && <span className="block text-[10px] text-amber-400">Shelf Reach: {item.shelfHeightCm}cm</span>}
                  </td>
                  <td className="py-3 px-4">
                    {item.lightingKelvin ? (
                      <span className="flex items-center gap-1 font-mono text-amber-300">
                        <Sun className="w-3 h-3 text-amber-400" />
                        <span>{item.lightingKelvin}K</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="text-[11px] text-slate-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{item.safetyNotes || 'Child-Safe Non-Toxic'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    ${item.priceEst || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
