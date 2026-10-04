import React, { useState } from 'react';
import { X, Check, Sliders, Home, Compass, Sun, Shield } from 'lucide-react';
import { RoomConfig, AgeBracket, WallSide } from '../types/index.ts';

interface RoomConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RoomConfig;
  onSave: (newConfig: RoomConfig) => void;
}

export const RoomConfigModal: React.FC<RoomConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave
}) => {
  const [formData, setFormData] = useState<RoomConfig>({ ...config });

  if (!isOpen) return null;

  const presets = [
    {
      name: 'Montessori Toddler Sanctuary',
      child: 'Oliver',
      age: '0-2' as AgeBracket,
      width: 360,
      length: 420,
      doorWall: 'bottom' as WallSide,
      doorOffset: 40,
      doorWidth: 85,
      windowWall: 'top' as WallSide,
      windowOffset: 80,
      windowWidth: 160,
      scheme: 'warm_neutral' as const
    },
    {
      name: 'Preschool Active Play & Craft',
      child: 'Maya',
      age: '3-5' as AgeBracket,
      width: 380,
      length: 440,
      doorWall: 'left' as WallSide,
      doorOffset: 40,
      doorWidth: 90,
      windowWall: 'top' as WallSide,
      windowOffset: 90,
      windowWidth: 180,
      scheme: 'earthy_sage' as const
    },
    {
      name: 'Primary Student Study Suite',
      child: 'Liam',
      age: '6-8' as AgeBracket,
      width: 400,
      length: 480,
      doorWall: 'bottom' as WallSide,
      doorOffset: 50,
      doorWidth: 90,
      windowWall: 'right' as WallSide,
      windowOffset: 100,
      windowWidth: 200,
      scheme: 'calm_indigo' as const
    },
    {
      name: 'Tween Studio & Creative Lounge',
      child: 'Sophia',
      age: '9-12' as AgeBracket,
      width: 420,
      length: 500,
      doorWall: 'left' as WallSide,
      doorOffset: 50,
      doorWidth: 90,
      windowWall: 'top' as WallSide,
      windowOffset: 110,
      windowWidth: 220,
      scheme: 'soft_terracotta' as const
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setFormData({
      ...formData,
      name: preset.name,
      childName: preset.child,
      ageBracket: preset.age,
      widthCm: preset.width,
      lengthCm: preset.length,
      doorWall: preset.doorWall,
      doorOffsetCm: preset.doorOffset,
      doorLeafWidthCm: preset.doorWidth,
      windowWall: preset.windowWall,
      windowOffsetCm: preset.windowOffset,
      windowWidthCm: preset.windowWidth,
      colorScheme: preset.scheme
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">Room Dimensions & Anchors</h2>
              <p className="text-xs text-slate-400">Define perimeter geometry, doors, windows & developmental profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-sm">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Quick Architecture Presets
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`p-3 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                    formData.ageBracket === p.age && formData.widthCm === p.width
                      ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-sm'
                      : 'border-slate-800 bg-slate-850 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-slate-200">{p.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {p.age} yrs • {(p.width / 100).toFixed(1)}m × {(p.length / 100).toFixed(1)}m ({((p.width * p.length) / 10000).toFixed(1)} m²)
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Child & Age Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Child's Name</label>
              <input
                type="text"
                value={formData.childName}
                onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Oliver"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Developmental Age Bracket</label>
              <select
                value={formData.ageBracket}
                onChange={(e) => setFormData({ ...formData, ageBracket: e.target.value as AgeBracket })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="0-2">0 – 2 yrs (Gross Motor, Crawling, Tactile)</option>
                <option value="3-5">3 – 5 yrs (Symbolic Play, Craft, Pre-literacy)</option>
                <option value="6-8">6 – 8 yrs (Primary Focus, Homework, Lego)</option>
                <option value="9-12">9 – 12 yrs (Tween Workstation, Lounge, Identity)</option>
              </select>
            </div>
          </div>

          {/* Room Width and Length */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Room Width (cm) — <span className="text-indigo-400">{(formData.widthCm / 100).toFixed(2)} m</span>
              </label>
              <input
                type="number"
                min="240"
                max="800"
                step="10"
                value={formData.widthCm}
                onChange={(e) => setFormData({ ...formData, widthCm: Math.max(200, Number(e.target.value)) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Recommended: 300 – 500 cm</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Room Length (cm) — <span className="text-indigo-400">{(formData.lengthCm / 100).toFixed(2)} m</span>
              </label>
              <input
                type="number"
                min="240"
                max="800"
                step="10"
                value={formData.lengthCm}
                onChange={(e) => setFormData({ ...formData, lengthCm: Math.max(200, Number(e.target.value)) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Recommended: 320 – 600 cm</span>
            </div>
          </div>

          {/* Wall Anchors: Door & Window */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4" />
              <span>Door & Window Wall Placement</span>
            </h3>

            {/* Door Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Entry Door Wall</label>
                <select
                  value={formData.doorWall}
                  onChange={(e) => setFormData({ ...formData, doorWall: e.target.value as WallSide })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="bottom">Bottom Wall (South)</option>
                  <option value="top">Top Wall (North)</option>
                  <option value="left">Left Wall (West)</option>
                  <option value="right">Right Wall (East)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Door Offset from Corner (cm)</label>
                <input
                  type="number"
                  min="10"
                  max={Math.max(formData.widthCm, formData.lengthCm) - 100}
                  value={formData.doorOffsetCm}
                  onChange={(e) => setFormData({ ...formData, doorOffsetCm: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Door Leaf Width (cm)</label>
                <input
                  type="number"
                  min="60"
                  max="110"
                  value={formData.doorLeafWidthCm}
                  onChange={(e) => setFormData({ ...formData, doorLeafWidthCm: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            {/* Window Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-700/60">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Window Wall</span>
                </label>
                <select
                  value={formData.windowWall}
                  onChange={(e) => setFormData({ ...formData, windowWall: e.target.value as WallSide })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="top">Top Wall (North Light)</option>
                  <option value="bottom">Bottom Wall (South Light)</option>
                  <option value="left">Left Wall (West Light)</option>
                  <option value="right">Right Wall (East Light)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Window Offset (cm)</label>
                <input
                  type="number"
                  min="20"
                  max={Math.max(formData.widthCm, formData.lengthCm) - 120}
                  value={formData.windowOffsetCm}
                  onChange={(e) => setFormData({ ...formData, windowOffsetCm: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Window Width (cm)</label>
                <input
                  type="number"
                  min="80"
                  max="280"
                  value={formData.windowWidthCm}
                  onChange={(e) => setFormData({ ...formData, windowWidthCm: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Color Palette Scheme */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Sensory-Safe Color Scheme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'warm_neutral', name: 'Warm Oat Neutral', hex: '#F3EFE0', accent: '#D8A48F' },
                { id: 'earthy_sage', name: 'Earthy Sage Green', hex: '#E2E8D5', accent: '#6B8E8F' },
                { id: 'soft_terracotta', name: 'Soft Terracotta Clay', hex: '#F0D5C9', accent: '#C86D51' },
                { id: 'calm_indigo', name: 'Calm Twilight Blue', hex: '#DCE2E9', accent: '#4338CA' }
              ].map((scheme) => (
                <button
                  key={scheme.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, colorScheme: scheme.id as any })}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                    formData.colorScheme === scheme.id
                      ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                      : 'border-slate-800 bg-slate-850 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: scheme.hex }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: scheme.accent }} />
                  </div>
                  <div className="font-medium text-slate-200">{scheme.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Apply Room Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
