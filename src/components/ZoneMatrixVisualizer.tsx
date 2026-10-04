import React from 'react';
import { 
  Home, 
  BookOpen, 
  SunMedium, 
  Archive, 
  Layers, 
  TrendingUp, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { RoomConfig, Box, ZoneType, AgeBracket } from '../types/index.ts';
import { computeZoneAllocations, getOrientedBox } from '../engine/spatialEngine.ts';

interface ZoneMatrixVisualizerProps {
  roomConfig: RoomConfig;
  furniture: Box[];
  onAgeChange: (age: AgeBracket) => void;
  onAutoGenerate: () => void;
}

export const ZoneMatrixVisualizer: React.FC<ZoneMatrixVisualizerProps> = ({
  roomConfig,
  furniture,
  onAgeChange,
  onAutoGenerate
}) => {
  const totalRoomAreaSqM = (roomConfig.widthCm * roomConfig.lengthCm) / 10000;
  const allocations = computeZoneAllocations(roomConfig.ageBracket, roomConfig.widthCm, roomConfig.lengthCm);

  // Compute placed footprint by zone in m²
  const placedFootprintByZone: Record<ZoneType, number> = {
    active: 0,
    calm: 0,
    focus: 0,
    storage: 0
  };

  furniture.forEach((item) => {
    const ob = getOrientedBox(item);
    const itemAreaSqM = (ob.w * ob.h) / 10000;
    placedFootprintByZone[item.zone] = (placedFootprintByZone[item.zone] || 0) + itemAreaSqM;
  });

  const ageStageMeta: Record<AgeBracket, { title: string; subtitle: string; stageSummary: string }> = {
    '0-2': {
      title: 'Infant / Toddler Discovery (0–2 yrs)',
      subtitle: 'Gross Motor & Tactile Crawling Focus',
      stageSummary: '50% dedicated to active floor rolling, cruising and soft tumbling. Zero tabletop desk required.'
    },
    '3-5': {
      title: 'Preschool & Early Autonomy (3–5 yrs)',
      subtitle: 'Pre-Literacy & Symbolic Pretend Play',
      stageSummary: 'Active play (35%) balances with toddler craft table (15%), cozy reading teepee (20%) and accessible low cubbies (30%).'
    },
    '6-8': {
      title: 'Primary School / Focus Habit (6–8 yrs)',
      subtitle: 'Homework Stamina & Fine Motor Construction',
      stageSummary: 'Focus zone expands to 35% with height-adjustable study desk and task light, paired with quiet reading nook (15%) and Lego floor zone (25%).'
    },
    '9-12': {
      title: 'Tween Autonomy & Identity (9–12 yrs)',
      subtitle: 'Executive Study Workstation & Privacy Lounge',
      stageSummary: 'Focus workstation dominates at 45%, complemented by private retreat seating (15%) and vertical storage (25%).'
    }
  };

  const icons: Record<ZoneType, any> = {
    active: Home,
    calm: BookOpen,
    focus: SunMedium,
    storage: Archive
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 lg:p-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-amber-950/40 p-6 rounded-3xl border border-indigo-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white font-display">
              Developmental Zone Matrix Engine
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Translates child anthropometrics and developmental milestones into deterministic square-meter zone weightings and ergonomic clearance ratios.
          </p>
        </div>

        {/* Age Selector Tabs */}
        <div className="flex items-center bg-slate-900/90 rounded-2xl p-1.5 border border-slate-700/80 shadow-inner">
          {(['0-2', '3-5', '6-8', '9-12'] as AgeBracket[]).map((age) => (
            <button
              key={age}
              onClick={() => onAgeChange(age)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                roomConfig.ageBracket === age
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {age} yrs
            </button>
          ))}
        </div>
      </div>

      {/* Stage Summary Card */}
      <div className="bg-slate-850 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Active Milestone Profile
          </div>
          <h3 className="text-base font-bold text-white">
            {ageStageMeta[roomConfig.ageBracket].title}
          </h3>
          <p className="text-xs text-slate-400">
            {ageStageMeta[roomConfig.ageBracket].stageSummary}
          </p>
        </div>

        <button
          onClick={onAutoGenerate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition-all shrink-0 active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>Apply Age Weighting to Room</span>
        </button>
      </div>

      {/* 4 Primary Micro-Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allocations.map((alloc) => {
          const Icon = icons[alloc.zone];
          const placedM2 = placedFootprintByZone[alloc.zone];
          const placedPercent = Math.round((placedM2 / totalRoomAreaSqM) * 100);

          return (
            <div
              key={alloc.zone}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-850/80 hover:border-slate-700 transition-all space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
                    style={{ backgroundColor: `${alloc.color}20`, color: alloc.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{alloc.label}</h4>
                    <span className="text-[11px] text-slate-400">
                      Target: <strong className="text-slate-200">{alloc.targetPercent}%</strong> ({alloc.targetAreaSqM} m²)
                    </span>
                  </div>
                </div>

                <div 
                  className="px-3 py-1 rounded-full text-xs font-extrabold border"
                  style={{ 
                    backgroundColor: `${alloc.color}15`, 
                    color: alloc.color, 
                    borderColor: `${alloc.color}40` 
                  }}
                >
                  {alloc.targetPercent}% Area
                </div>
              </div>

              {/* Visual Target vs Placed Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Current Placed Footprint:</span>
                  <span className="font-mono text-slate-300">
                    {placedM2.toFixed(2)} m² ({placedPercent}% of room)
                  </span>
                </div>

                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (placedPercent / (alloc.targetPercent || 1)) * 100)}%`,
                      backgroundColor: alloc.color
                    }}
                  />
                </div>
              </div>

              {/* Description & Milestone Rationale */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-1.5">
                <p className="text-slate-300 font-medium leading-relaxed">
                  {alloc.description}
                </p>
                <p className="text-[11px] text-slate-400 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{alloc.milestoneRationale}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Age-to-Zone Weighting Matrix Reference Table */}
      <div className="bg-slate-850 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Master Developmental Milestone Matrix Reference</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Age Bracket</th>
                <th className="py-3 px-4 font-semibold">Focus / Milestone Stage</th>
                <th className="py-3 px-4 font-semibold text-amber-400">Active Play</th>
                <th className="py-3 px-4 font-semibold text-indigo-400">Calm Nook</th>
                <th className="py-3 px-4 font-semibold text-emerald-400">Focus Desk</th>
                <th className="py-3 px-4 font-semibold text-orange-400">Sleep / Storage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr className={roomConfig.ageBracket === '0-2' ? 'bg-indigo-950/30 font-semibold text-white' : ''}>
                <td className="py-3 px-4">0 – 2 yrs</td>
                <td className="py-3 px-4 text-slate-400">Gross motor, crawling, tactile discovery</td>
                <td className="py-3 px-4 text-amber-400">50% (open floor)</td>
                <td className="py-3 px-4 text-indigo-400">20% (soft mats)</td>
                <td className="py-3 px-4 text-emerald-400">0%</td>
                <td className="py-3 px-4 text-orange-400">30% (low open bins)</td>
              </tr>
              <tr className={roomConfig.ageBracket === '3-5' ? 'bg-indigo-950/30 font-semibold text-white' : ''}>
                <td className="py-3 px-4">3 – 5 yrs</td>
                <td className="py-3 px-4 text-slate-400">Symbolic play, autonomy, pre-literacy</td>
                <td className="py-3 px-4 text-amber-400">35% (block/pretend)</td>
                <td className="py-3 px-4 text-indigo-400">20% (reading corner)</td>
                <td className="py-3 px-4 text-emerald-400">15% (craft table)</td>
                <td className="py-3 px-4 text-orange-400">30% (accessible cubbies)</td>
              </tr>
              <tr className={roomConfig.ageBracket === '6-8' ? 'bg-indigo-950/30 font-semibold text-white' : ''}>
                <td className="py-3 px-4">6 – 8 yrs</td>
                <td className="py-3 px-4 text-slate-400">Fine motor, reading, homework habits</td>
                <td className="py-3 px-4 text-amber-400">25% (lego/craft)</td>
                <td className="py-3 px-4 text-indigo-400">15% (quiet nook)</td>
                <td className="py-3 px-4 text-emerald-400">35% (desk, task light)</td>
                <td className="py-3 px-4 text-orange-400">25% (shelving, closet)</td>
              </tr>
              <tr className={roomConfig.ageBracket === '9-12' ? 'bg-indigo-950/30 font-semibold text-white' : ''}>
                <td className="py-3 px-4">9 – 12 yrs</td>
                <td className="py-3 px-4 text-slate-400">Identity, study focus, social boundary</td>
                <td className="py-3 px-4 text-amber-400">15% (lounge/seating)</td>
                <td className="py-3 px-4 text-indigo-400">15% (privacy zone)</td>
                <td className="py-3 px-4 text-emerald-400">45% (ergonomic study)</td>
                <td className="py-3 px-4 text-orange-400">25% (vertical storage)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
