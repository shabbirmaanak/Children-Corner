import React from 'react';
import { 
  Sparkles, 
  Settings, 
  Download, 
  Plus, 
  ShieldCheck, 
  AlertTriangle, 
  Maximize2,
  BookOpen,
  ShoppingBag,
  Layers,
  Ruler
} from 'lucide-react';
import { RoomConfig, AgeBracket } from '../types/index.ts';

interface HeaderProps {
  roomConfig: RoomConfig;
  onOpenConfig: () => void;
  onAutoGenerate: () => void;
  onResetLayout: () => void;
  onOpenCatalog: () => void;
  onOpenCustomItem: () => void;
  onExportBlueprint: () => void;
  activeTab: 'canvas' | 'milestones' | 'shopping' | 'zones';
  setActiveTab: (tab: 'canvas' | 'milestones' | 'shopping' | 'zones') => void;
  auditScore: number;
  criticalViolationCount: number;
  warningCount: number;
  onAgeChange: (age: AgeBracket) => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomConfig,
  onOpenConfig,
  onAutoGenerate,
  onOpenCatalog,
  onOpenCustomItem,
  onExportBlueprint,
  activeTab,
  setActiveTab,
  auditScore,
  criticalViolationCount,
  warningCount,
  onAgeChange
}) => {
  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 px-4 lg:px-6 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Room Info */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-2 ring-white/15">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white font-display">
                  Children's Corner
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Spatial Engine v2.5
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <span className="text-slate-200">{roomConfig.childName || "Child"}'s Room</span>
                <span className="text-slate-600">•</span>
                <span>{(roomConfig.widthCm / 100).toFixed(1)}m × {(roomConfig.lengthCm / 100).toFixed(1)}m</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400 font-bold">{((roomConfig.widthCm * roomConfig.lengthCm) / 10000).toFixed(1)} m²</span>
              </p>
            </div>
          </div>

          {/* Quick Age Switcher */}
          <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700/80 text-xs">
            {(['0-2', '3-5', '6-8', '9-12'] as AgeBracket[]).map((age) => (
              <button
                key={age}
                onClick={() => onAgeChange(age)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  roomConfig.ageBracket === age
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <div className="flex items-center bg-slate-800/90 rounded-2xl p-1 border border-slate-700/80 w-full md:w-auto justify-center shadow-inner">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'canvas'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>2D Layout Canvas</span>
          </button>

          <button
            onClick={() => setActiveTab('zones')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'zones'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Zone Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'milestones'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Milestones & Lighting</span>
          </button>

          <button
            onClick={() => setActiveTab('shopping')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'shopping'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Curated Specs</span>
          </button>
        </div>

        {/* Action Controls & Audit Score */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Spatial Audit Quick Score Pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm ${
            criticalViolationCount > 0
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              : warningCount > 0
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
          }`}>
            {criticalViolationCount > 0 ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span>{auditScore}% Audit</span>
          </div>

          {/* Add Custom Item */}
          <button
            onClick={onOpenCustomItem}
            title="Add custom measured item"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <Ruler className="w-3.5 h-3.5 text-amber-400" />
            <span>Custom Item</span>
          </button>

          {/* Add Catalog Item */}
          <button
            onClick={onOpenCatalog}
            title="Browse ergonomic furniture catalog"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Catalog</span>
          </button>

          {/* Blueprint Export */}
          <button
            onClick={onExportBlueprint}
            title="Export 1-Page Architectural Blueprint"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Blueprint</span>
          </button>
        </div>
      </div>
    </header>
  );
};
