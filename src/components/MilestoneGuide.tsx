import React from 'react';
import { 
  BookOpen, 
  Sun, 
  Moon, 
  Sparkles, 
  CheckCircle2, 
  Palette, 
  Ruler, 
  ShieldCheck, 
  Lightbulb,
  HeartHandshake,
  Info
} from 'lucide-react';
import { RoomConfig, AgeBracket } from '../types/index.ts';
import { DEVELOPMENTAL_RULES } from '../data/furnitureCatalog.ts';

interface MilestoneGuideProps {
  roomConfig: RoomConfig;
  onAgeChange: (age: AgeBracket) => void;
}

export const MilestoneGuide: React.FC<MilestoneGuideProps> = ({
  roomConfig,
  onAgeChange
}) => {
  const milestone = DEVELOPMENTAL_RULES[roomConfig.ageBracket];

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 lg:p-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950/40 p-6 rounded-3xl border border-indigo-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white font-display">
              Developmental Milestones & Lighting Guidance
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Child-centric ergonomics translating neurodevelopmental stages, circadian lighting Kelvin ratings, and anthropometrics into spatial harmony.
          </p>
        </div>

        {/* Age Switcher */}
        <div className="flex items-center bg-slate-900/90 rounded-2xl p-1.5 border border-slate-700/80">
          {(['0-2', '3-5', '6-8', '9-12'] as AgeBracket[]).map((age) => (
            <button
              key={age}
              onClick={() => onAgeChange(age)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                roomConfig.ageBracket === age
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {age} yrs
            </button>
          ))}
        </div>
      </div>

      {/* Stage Focus & Anthropometrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stage Overview */}
        <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 space-y-3 md:col-span-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {milestone.stageTitle}
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {milestone.primaryFocus}
          </p>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="text-xs font-bold text-indigo-300">Milestone Checklist & Architecture Requirements:</div>
            <ul className="space-y-2">
              {milestone.keyDevelopmentalGoals.map((goal, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Anthropometric Ergonomic Dimensions */}
        <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Ergonomic Dimensions
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Max Shelf Reach:</span>
              <strong className="text-amber-400 font-mono text-sm">{milestone.ergonomicLimits.maxShelfHeightCm} cm</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Max Shelf Depth:</span>
              <strong className="text-slate-200 font-mono text-sm">{milestone.ergonomicLimits.maxShelfDepthCm} cm</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Clear Corridor:</span>
              <strong className="text-emerald-400 font-mono text-sm">≥ {milestone.ergonomicLimits.clearanceCorridorCm} cm</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Desk Height:</span>
              <strong className="text-indigo-300 font-mono text-sm">
                {milestone.ergonomicLimits.recommendedDeskHeightCm ? `${milestone.ergonomicLimits.recommendedDeskHeightCm} cm` : 'Floor-Level'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Circadian Lighting & Kelvin Strategy */}
      <div className="bg-slate-850 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Circadian Lighting & Kelvin Temperature Strategy</h3>
              <p className="text-xs text-slate-400">Prevents melatonin disruption while maximizing reading and focus stamina</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Ambient Lighting */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sun className="w-4 h-4" /> Ambient Room Light
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60">
                {milestone.lightingGuidance.ambientKelvin}K
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Warm diffuse general illumination. Avoid exposed bulb fixtures directly visible from floor beds.
            </p>
          </div>

          {/* Task Focus Lighting */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" /> Task / Tabletop Light
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                {milestone.lightingGuidance.taskKelvin}K
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              High-CRI (Ra &gt; 90) neutral white. Positioned perpendicular to non-dominant hand to eliminate shadows.
            </p>
          </div>

          {/* Night / Decompression */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <Moon className="w-4 h-4" /> Night & Sensory Nook
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                {milestone.lightingGuidance.nightKelvin}K
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Ultra-warm amber spectrum. Promotes melatonin synthesis and bedtime autonomy.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 flex items-start gap-2">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>{milestone.lightingGuidance.notes}</span>
        </div>
      </div>

      {/* Sensory Safe Color Scheme */}
      <div className="bg-slate-850 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5">
          <Palette className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white font-display">Sensory-Safe Color Palettes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {milestone.sensoryColorPalette.map((palette, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <span className="w-8 h-8 rounded-full border-2 border-slate-800 shadow" style={{ backgroundColor: palette.hex }} />
                  <span className="w-8 h-8 rounded-full border-2 border-slate-800 shadow" style={{ backgroundColor: palette.accent }} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{palette.name}</h4>
                  <span className="text-[10px] font-mono text-slate-400">{palette.hex} + {palette.accent}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {palette.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
