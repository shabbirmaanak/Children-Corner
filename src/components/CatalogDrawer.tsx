import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  ShieldCheck, 
  Search, 
  Filter, 
  Sparkles,
  Bed,
  Layers,
  BookOpen,
  Archive,
  SunMedium
} from 'lucide-react';
import { Box, ZoneType, RoomConfig, AgeBracket } from '../types/index.ts';
import { FURNITURE_CATALOG, CatalogItem } from '../data/furnitureCatalog.ts';

interface CatalogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roomConfig: RoomConfig;
  onAddItem: (item: Box) => void;
}

export const CatalogDrawer: React.FC<CatalogDrawerProps> = ({
  isOpen,
  onClose,
  roomConfig,
  onAddItem
}) => {
  const [selectedZone, setSelectedZone] = useState<ZoneType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAgeOnly, setFilterAgeOnly] = useState(true);

  if (!isOpen) return null;

  // Filter catalog items
  const filteredItems = FURNITURE_CATALOG.filter(item => {
    // Zone filter
    if (selectedZone !== 'all' && item.zone !== selectedZone) return false;
    
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchRet = (item.retailer || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchRet) return false;
    }

    return true;
  });

  const handleAdd = (catalogItem: CatalogItem) => {
    // Generate a new Box item placed near center of room
    const newItem: Box = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: catalogItem.name,
      category: catalogItem.category,
      zone: catalogItem.zone,
      x: Math.max(20, Math.round((roomConfig.widthCm - catalogItem.width) / 2)),
      y: Math.max(20, Math.round((roomConfig.lengthCm - catalogItem.height) / 2)),
      width: catalogItem.width,
      height: catalogItem.height,
      rotation: 0,
      shelfHeightCm: catalogItem.shelfHeightCm,
      depthCm: catalogItem.depthCm,
      color: catalogItem.color,
      priceEst: catalogItem.priceEst,
      retailer: catalogItem.retailer,
      lightingKelvin: catalogItem.lightingKelvin,
      safetyNotes: catalogItem.safetyNotes
    };

    onAddItem(newItem);
  };

  const zoneBadges: { id: ZoneType | 'all'; label: string; icon: any; color: string }[] = [
    { id: 'all', label: 'All Catalog', icon: Layers, color: 'text-slate-300' },
    { id: 'active', label: 'Active Play', icon: Sparkles, color: 'text-amber-400' },
    { id: 'calm', label: 'Calm Nook', icon: BookOpen, color: 'text-indigo-400' },
    { id: 'focus', label: 'Focus / Desk', icon: SunMedium, color: 'text-emerald-400' },
    { id: 'storage', label: 'Sleep & Storage', icon: Archive, color: 'text-orange-400' },
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-display">Furniture & Ergonomic Catalog</h2>
            <p className="text-xs text-slate-400">Scaled for age {roomConfig.ageBracket} years</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-850">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search shelves, desks, sensory mats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Zone Pill Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {zoneBadges.map((z) => {
            const Icon = z.icon;
            return (
              <button
                key={z.id}
                onClick={() => setSelectedZone(z.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg shrink-0 font-medium transition-all ${
                  selectedZone === z.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${selectedZone === z.id ? 'text-white' : z.color}`} />
                <span>{z.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No furniture items match your search or filter criteria.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.catalogId}
              className="p-4 rounded-xl border border-slate-800 bg-slate-850 hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      item.zone === 'active' ? 'bg-amber-400' :
                      item.zone === 'calm' ? 'bg-indigo-400' :
                      item.zone === 'focus' ? 'bg-emerald-400' : 'bg-orange-400'
                    }`} />
                    <h3 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {item.name}
                    </h3>
                  </div>
                  {item.priceEst && (
                    <span className="text-xs font-semibold text-emerald-400">
                      ${item.priceEst}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">
                  {item.description}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 font-mono">
                    {item.dimensionsText}
                  </span>

                  {item.shelfHeightCm && (
                    <span className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
                      Reach Cap: {item.shelfHeightCm} cm
                    </span>
                  )}

                  {item.certification && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{item.certification}</span>
                    </span>
                  )}
                </div>

                {item.retailer && (
                  <div className="text-[10px] text-slate-500 mt-2">
                    Retail source: <span className="text-slate-400">{item.retailer}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  Target age: {item.minAge} – {item.maxAge} yrs
                </span>
                <button
                  onClick={() => handleAdd(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Place in Room</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
