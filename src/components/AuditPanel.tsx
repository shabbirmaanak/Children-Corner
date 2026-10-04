import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  Wrench, 
  ArrowRight,
  CheckCircle2,
  Home,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Violation, DistanceLine, Box, RoomConfig } from '../types/index.ts';

interface AuditPanelProps {
  score: number;
  violations: Violation[];
  distanceLines: DistanceLine[];
  furniture: Box[];
  roomConfig: RoomConfig;
  onSelectItem: (id: string) => void;
  onAutoFix: () => void;
}

export const AuditPanel: React.FC<AuditPanelProps> = ({
  score,
  violations,
  distanceLines,
  furniture,
  roomConfig,
  onSelectItem,
  onAutoFix
}) => {
  const criticalViolations = violations.filter(v => v.severity === 'CRITICAL');
  const warningViolations = violations.filter(v => v.severity === 'WARNING');
  const infoViolations = violations.filter(v => v.severity === 'INFO');

  const getScoreColor = () => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
    if (score >= 70) return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
    return 'text-rose-400 border-rose-500/30 bg-rose-950/20';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-5">
      {/* Header & Score Gauge */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-display">Live Spatial & Safety Audit</h3>
          </div>
          <p className="text-[11px] text-slate-400">
            Real-time verification of 75cm corridors & door swept arcs
          </p>
        </div>

        {/* Circular / Pill Score Display */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-sm ${getScoreColor()}`}>
          <span className="font-mono text-base">{score}%</span>
          <span className="text-[11px] uppercase tracking-wider font-semibold">
            {score >= 90 ? 'Passed' : score >= 70 ? 'Needs Tuning' : 'Critical'}
          </span>
        </div>
      </div>

      {/* Auto-Fix Banner if any violations exist */}
      {violations.length > 0 && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-indigo-200">
            <Home className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{violations.length} safety or spatial item{violations.length > 1 ? 's' : ''} detected.</span>
          </div>
          <button
            onClick={onAutoFix}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all shrink-0 active:scale-95"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Auto-Resolve</span>
          </button>
        </div>
      )}

      {/* Zero Violations Clean State */}
      {violations.length === 0 && (
        <div className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-xs font-bold text-emerald-300">Perfect Architectural Compliance!</h4>
          <p className="text-[11px] text-emerald-400/80 max-w-sm mx-auto">
            Door sweep path is completely unobstructed, and all furniture pieces maintain standard ≥75cm circulation corridors.
          </p>
        </div>
      )}

      {/* Critical Violations Section */}
      {criticalViolations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Critical Hazards ({criticalViolations.length})</span>
          </div>

          <div className="space-y-2">
            {criticalViolations.map((v) => (
              <div
                key={v.id}
                className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-1.5 hover:border-rose-400 transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                  <span>{v.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 uppercase">
                    Critical
                  </span>
                </div>
                <p className="text-[11px] text-rose-200/90 leading-relaxed">
                  {v.description}
                </p>
                {v.suggestedFix && (
                  <div className="text-[10px] text-rose-300/80 pt-1 flex items-start gap-1">
                    <span className="font-semibold text-rose-200">Fix:</span>
                    <span>{v.suggestedFix}</span>
                  </div>
                )}
                {v.involvedIds.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1">
                    {v.involvedIds.map(id => {
                      const item = furniture.find(f => f.id === id);
                      if (!item) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => onSelectItem(id)}
                          className="text-[10px] px-2 py-0.5 rounded bg-rose-900/80 text-white hover:bg-rose-700 flex items-center gap-1 transition-colors"
                        >
                          <span>Select {item.name}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning Violations Section */}
      {warningViolations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Clearance & Ergonomic Warnings ({warningViolations.length})</span>
          </div>

          <div className="space-y-2">
            {warningViolations.map((v) => (
              <div
                key={v.id}
                className="p-3 rounded-xl bg-amber-950/25 border border-amber-500/30 space-y-1.5 hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                  <span>{v.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/50 text-amber-200 uppercase">
                    Warning
                  </span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  {v.description}
                </p>
                {v.suggestedFix && (
                  <div className="text-[10px] text-amber-300/80 pt-1 flex items-start gap-1">
                    <span className="font-semibold text-amber-200">Fix:</span>
                    <span>{v.suggestedFix}</span>
                  </div>
                )}
                {v.involvedIds.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1">
                    {v.involvedIds.map(id => {
                      const item = furniture.find(f => f.id === id);
                      if (!item) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => onSelectItem(id)}
                          className="text-[10px] px-2 py-0.5 rounded bg-amber-900/80 text-white hover:bg-amber-700 flex items-center gap-1 transition-colors"
                        >
                          <span>Select {item.name}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info / Ergonomic Suggestions */}
      {infoViolations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <Info className="w-3.5 h-3.5" />
            <span>Ergonomic Recommendations ({infoViolations.length})</span>
          </div>

          <div className="space-y-2">
            {infoViolations.map((v) => (
              <div
                key={v.id}
                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1"
              >
                <div className="text-xs font-bold text-slate-200">{v.title}</div>
                <p className="text-[11px] text-slate-400">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ergonomic Guardrails Card */}
      <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 text-xs space-y-2.5">
        <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Active Dimensional Guardrails</span>
        </h4>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-slate-400">Min Corridor</div>
            <div className="font-bold text-white text-xs">75 cm clear</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-slate-400">Shelf Height Cap</div>
            <div className="font-bold text-white text-xs">
              {roomConfig.ageBracket === '0-2' ? '60 cm (2-tier)' :
               roomConfig.ageBracket === '3-5' ? '90 cm (3-tier)' :
               roomConfig.ageBracket === '6-8' ? '130 cm' : '160 cm'}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-slate-400">Max Shelf Depth</div>
            <div className="font-bold text-white text-xs">25–30 cm</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-slate-400">Play Perimeter</div>
            <div className="font-bold text-white text-xs">90 cm open</div>
          </div>
        </div>
      </div>
    </div>
  );
};
