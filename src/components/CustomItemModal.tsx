import React, { useState } from 'react';
import { X, Plus, Sparkles, Ruler } from 'lucide-react';
import { Box, ZoneType, RoomConfig, CurrencyCode, CURRENCIES } from '../types/index.ts';

interface CustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomConfig: RoomConfig;
  currency: CurrencyCode;
  onAddCustomItem: (item: Box) => void;
}

export const CustomItemModal: React.FC<CustomItemModalProps> = ({
  isOpen,
  onClose,
  roomConfig,
  currency,
  onAddCustomItem
}) => {
  const [name, setName] = useState('');
  const [zone, setZone] = useState<ZoneType>('active');
  const [category, setCategory] = useState<Box['category']>('custom');
  const [widthCm, setWidthCm] = useState(80);
  const [heightCm, setHeightCm] = useState(80);
  const [shelfHeightCm, setShelfHeightCm] = useState<number | undefined>(undefined);
  const [priceInput, setPriceInput] = useState<number>(100);
  const [safetyNotes, setSafetyNotes] = useState('');

  if (!isOpen) return null;

  const curr = CURRENCIES[currency];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Convert input price to USD base
    const priceUSD = Math.round(priceInput / curr.rateFromUSD);

    const newItem: Box = {
      id: `custom-item-${Date.now()}`,
      name: name.trim(),
      zone,
      category,
      x: Math.max(20, Math.round((roomConfig.widthCm - widthCm) / 2)),
      y: Math.max(20, Math.round((roomConfig.lengthCm - heightCm) / 2)),
      width: widthCm,
      height: heightCm,
      rotation: 0,
      shelfHeightCm: shelfHeightCm || undefined,
      priceEst: priceUSD,
      safetyNotes: safetyNotes.trim() || 'Custom item placement'
    };

    onAddCustomItem(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-mint-500 to-azure-500 text-white flex items-center justify-center shadow-lg shadow-azure-500/20 ring-2 ring-white/80">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-display">Add Custom Measured Item</h3>
              <p className="text-xs text-stone-500">Specify exact dimensions, category, and price in {curr.code}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-700 font-bold mb-1">Item Title / Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Pikler Climbing Triangle, Reading Canopy..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-azure-500 focus:bg-white shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-bold mb-1">Target Zone</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value as ZoneType)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-azure-500 focus:bg-white shadow-xs"
              >
                <option value="active">Active Play Area</option>
                <option value="calm">Calm / Sensory Nook</option>
                <option value="focus">Focus / Tabletop</option>
                <option value="storage">Sleep / Storage</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Category Type</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-azure-500 focus:bg-white shadow-xs"
              >
                <option value="custom">Custom Furniture</option>
                <option value="play_mat">Play Mat / Gym</option>
                <option value="shelf">Shelf / Storage Unit</option>
                <option value="desk">Table / Desk</option>
                <option value="chair">Seating / Beanbag</option>
                <option value="bed">Bed Frame</option>
                <option value="nook">Nook / Tent</option>
                <option value="rug">Floor Rug</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-bold mb-1">Width (cm)</label>
              <input
                type="number"
                min="10"
                max="400"
                value={widthCm}
                onChange={(e) => setWidthCm(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-azure-500 focus:bg-white font-mono shadow-xs"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Depth / Height (cm)</label>
              <input
                type="number"
                min="10"
                max="400"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-azure-500 focus:bg-white font-mono shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-bold mb-1">Shelf Reach Height (cm, optional)</label>
              <input
                type="number"
                min="0"
                max="220"
                placeholder="e.g. 60"
                value={shelfHeightCm || ''}
                onChange={(e) => setShelfHeightCm(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-azure-500 focus:bg-white font-mono shadow-xs"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Est. Price ({curr.symbol})</label>
              <input
                type="number"
                min="0"
                value={priceInput}
                onChange={(e) => setPriceInput(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-azure-500 focus:bg-white font-mono shadow-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-azure-600 to-mint-500 hover:from-azure-500 hover:to-mint-400 text-white font-bold shadow-md shadow-azure-500/25 transition-all"
            >
              Add to Floorplan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
