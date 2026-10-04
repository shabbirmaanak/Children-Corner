import React, { useState, useEffect } from 'react';
import { 
  Ruler, 
  Home, 
  Sun, 
  DoorClosed, 
  Sliders, 
  Check, 
  Compass, 
  Layers, 
  ChevronRight,
  Maximize2,
  RefreshCw,
  Zap,
  RotateCcw
} from 'lucide-react';
import { RoomConfig, AgeBracket, WallSide, UnitType } from '../types/index.ts';

interface InteractiveMeasurementBarProps {
  roomConfig: RoomConfig;
  onApplyConfigAndGenerate: (newConfig: RoomConfig) => void;
  onAgeChange: (age: AgeBracket) => void;
}

export const InteractiveMeasurementBar: React.FC<InteractiveMeasurementBarProps> = ({
  roomConfig,
  onApplyConfigAndGenerate,
  onAgeChange
}) => {
  const [unit, setUnit] = useState<UnitType>('m');
  const [widthInput, setWidthInput] = useState<number>(roomConfig.widthCm);
  const [lengthInput, setLengthInput] = useState<number>(roomConfig.lengthCm);
  const [doorWall, setDoorWall] = useState<WallSide>(roomConfig.doorWall);
  const [doorOffset, setDoorOffset] = useState<number>(roomConfig.doorOffsetCm);
  const [windowWall, setWindowWall] = useState<WallSide>(roomConfig.windowWall);
  const [windowOffset, setWindowOffset] = useState<number>(roomConfig.windowOffsetCm);
  const [childAge, setChildAge] = useState<AgeBracket>(roomConfig.ageBracket);
  const [childName, setChildName] = useState<string>(roomConfig.childName || 'Oliver');
  const [layoutGoal, setLayoutGoal] = useState<string>('montessori_autonomy');
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Sync inputs when external config changes
  useEffect(() => {
    setWidthInput(roomConfig.widthCm);
    setLengthInput(roomConfig.lengthCm);
    setDoorWall(roomConfig.doorWall);
    setDoorOffset(roomConfig.doorOffsetCm);
    setWindowWall(roomConfig.windowWall);
    setWindowOffset(roomConfig.windowOffsetCm);
    setChildAge(roomConfig.ageBracket);
    setChildName(roomConfig.childName || 'Oliver');
  }, [roomConfig]);

  // Unit conversions
  const cmToCurrentUnit = (cm: number): string => {
    if (unit === 'm') return (cm / 100).toFixed(2);
    if (unit === 'ft') return (cm / 30.48).toFixed(1);
    return cm.toString();
  };

  const handleWidthChange = (valStr: string) => {
    const val = parseFloat(valStr);
    if (isNaN(val)) return;
    let cm = val;
    if (unit === 'm') cm = val * 100;
    if (unit === 'ft') cm = val * 30.48;
    setWidthInput(Math.max(200, Math.min(800, Math.round(cm))));
  };

  const handleLengthChange = (valStr: string) => {
    const val = parseFloat(valStr);
    if (isNaN(val)) return;
    let cm = val;
    if (unit === 'm') cm = val * 100;
    if (unit === 'ft') cm = val * 30.48;
    setLengthInput(Math.max(200, Math.min(800, Math.round(cm))));
  };

  const areaSqM = ((widthInput * lengthInput) / 10000).toFixed(1);
  const areaSqFt = ((widthInput * lengthInput) / 929.03).toFixed(0);
  const aspectRatio = (widthInput / lengthInput).toFixed(2);

  const handleApply = () => {
    setIsApplying(true);
    const updatedConfig: RoomConfig = {
      ...roomConfig,
      childName,
      ageBracket: childAge,
      widthCm: widthInput,
      lengthCm: lengthInput,
      doorWall,
      doorOffsetCm: doorOffset,
      windowWall,
      windowOffsetCm: windowOffset,
      layoutGoal: layoutGoal as any
    };

    onApplyConfigAndGenerate(updatedConfig);

    setTimeout(() => {
      setIsApplying(false);
    }, 600);
  };

  // Quick space size presets
  const spacePresets = [
    { label: 'Compact (3.2 × 3.6m)', w: 320, l: 360 },
    { label: 'Standard (3.6 × 4.2m)', w: 360, l: 420 },
    { label: 'Spacious (4.2 × 4.8m)', w: 420, l: 480 },
    { label: 'Long Playroom (3.0 × 5.2m)', w: 300, l: 520 },
  ];

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-920 border border-slate-700/80 rounded-3xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Glow decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-amber-400 to-emerald-400 opacity-80" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ring-2 ring-white/10">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <span>Space Measurement & Layout Configurator</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Step 1: Measure & Anchor
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Input room dimensions, anchor door/window orientations, and click to apply deterministic zoning.
            </p>
          </div>
        </div>

        {/* Units Switcher & Expand Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700/70 text-xs">
            {(['m', 'ft', 'cm'] as UnitType[]).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  unit === u
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {u.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/70 text-xs flex items-center gap-1 transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isExpanded ? 'Collapse' : 'Expand Controls'}</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Quick presets pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
            <span className="text-slate-400 text-[11px] font-semibold shrink-0">Presets:</span>
            {spacePresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setWidthInput(preset.w);
                  setLengthInput(preset.l);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium shrink-0 transition-all ${
                  widthInput === preset.w && lengthInput === preset.l
                    ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/50'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Main 4-Column Control Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Room Width */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-700/70 hover:border-slate-600 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Room Width ({unit})</span>
                </label>
                <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                  {widthInput} cm
                </span>
              </div>
              
              <div className="relative flex items-center">
                <input
                  type="number"
                  step={unit === 'm' ? '0.1' : unit === 'ft' ? '0.5' : '10'}
                  value={cmToCurrentUnit(widthInput)}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-base font-bold text-white focus:outline-none focus:border-indigo-500 pr-10 font-mono shadow-inner"
                />
                <span className="absolute right-3 text-xs font-bold text-slate-400 uppercase">
                  {unit}
                </span>
              </div>

              {/* Quick Slider */}
              <input
                type="range"
                min="200"
                max="700"
                step="10"
                value={widthInput}
                onChange={(e) => setWidthInput(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* 2. Room Length */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-700/70 hover:border-slate-600 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Room Length ({unit})</span>
                </label>
                <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                  {lengthInput} cm
                </span>
              </div>

              <div className="relative flex items-center">
                <input
                  type="number"
                  step={unit === 'm' ? '0.1' : unit === 'ft' ? '0.5' : '10'}
                  value={cmToCurrentUnit(lengthInput)}
                  onChange={(e) => handleLengthChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-base font-bold text-white focus:outline-none focus:border-indigo-500 pr-10 font-mono shadow-inner"
                />
                <span className="absolute right-3 text-xs font-bold text-slate-400 uppercase">
                  {unit}
                </span>
              </div>

              {/* Quick Slider */}
              <input
                type="range"
                min="200"
                max="800"
                step="10"
                value={lengthInput}
                onChange={(e) => setLengthInput(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* 3. Door & Window Walls */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-700/70 hover:border-slate-600 transition-all space-y-2.5">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Wall Anchors</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Door Wall</span>
                  <select
                    value={doorWall}
                    onChange={(e) => setDoorWall(e.target.value as WallSide)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="bottom">South (Bottom)</option>
                    <option value="top">North (Top)</option>
                    <option value="left">West (Left)</option>
                    <option value="right">East (Right)</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Window Wall</span>
                  <select
                    value={windowWall}
                    onChange={(e) => setWindowWall(e.target.value as WallSide)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="top">North (Top)</option>
                    <option value="bottom">South (Bottom)</option>
                    <option value="left">West (Left)</option>
                    <option value="right">East (Right)</option>
                  </select>
                </div>
              </div>

              {/* Offset indicator */}
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                <span>Door Leaf: <strong>85 cm</strong></span>
                <span>Window: <strong>160 cm</strong></span>
              </div>
            </div>

            {/* 4. Child Age & Layout Focus Goal */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-700/70 hover:border-slate-600 transition-all space-y-2.5">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-emerald-400" />
                <span>Child Profile & Goal</span>
              </div>

              {/* Age Bracket Selector */}
              <div className="grid grid-cols-4 gap-1">
                {(['0-2', '3-5', '6-8', '9-12'] as AgeBracket[]).map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => {
                      setChildAge(age);
                      onAgeChange(age);
                    }}
                    className={`py-1 rounded-lg text-xs font-bold transition-all text-center ${
                      childAge === age
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700/70'
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>

              {/* Layout Focus */}
              <select
                value={layoutGoal}
                onChange={(e) => setLayoutGoal(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="montessori_autonomy">🌿 Montessori Autonomy & Low Reach</option>
                <option value="sensory_calm">🧘 Sensory Calm & Quiet Reading Sanctuary</option>
                <option value="study_focus">📚 Ergonomic Study & Concentration</option>
                <option value="active_movement">🤸 Active Gross Motor Movement & Rug Play</option>
              </select>
            </div>
          </div>

          {/* Bottom Action Row with Live Calculated Area and Big Generate Button */}
          <div className="pt-3 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Live Metrics Pill */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300">
              <div className="px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-700/80 flex items-center gap-2">
                <span className="text-slate-400">Total Floor:</span>
                <strong className="text-amber-400 font-mono text-sm">{areaSqM} m²</strong>
                <span className="text-slate-500 font-mono">({areaSqFt} sq ft)</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-700/80 flex items-center gap-2">
                <span className="text-slate-400">Aspect Ratio:</span>
                <strong className="text-indigo-300 font-mono text-sm">1 : {aspectRatio}</strong>
                <span className="text-[11px] text-slate-400">
                  {Number(aspectRatio) >= 1.4 ? '(Corridor)' : Number(aspectRatio) <= 1.1 ? '(Square)' : '(Rectangle)'}
                </span>
              </div>
            </div>

            {/* Big Shiny Apply Button */}
            <button
              onClick={handleApply}
              disabled={isApplying}
              className={`flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all active:scale-95 group w-full md:w-auto ${
                isApplying ? 'opacity-80 cursor-wait' : ''
              }`}
            >
              {isApplying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Computing Optimal Placement...</span>
                </>
              ) : (
                <>
                  <Home className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
                  <span>Apply Measurements & Generate Layout</span>
                  <ChevronRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
