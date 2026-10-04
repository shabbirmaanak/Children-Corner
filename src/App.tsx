import React, { useState, useMemo, useCallback } from 'react';
import { 
  RoomConfig, 
  Box, 
  AgeBracket,
  UnitType,
  WallSide,
  CurrencyCode,
  CURRENCIES
} from './types/index.ts';
import { 
  computeDoorGeometry, 
  auditRoomCirculation, 
  generateSmartAutoLayout
} from './engine/spatialEngine.ts';
import { 
  Sparkles, 
  Ruler, 
  Wand2, 
  Layers, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  Compass, 
  Wrench, 
  Check, 
  RefreshCw,
  Coins,
  User,
  HelpCircle,
  X,
  BookOpen,
  Hash,
  UserCheck
} from 'lucide-react';
import { FloorplanCanvas } from './components/FloorplanCanvas.tsx';
import { CustomItemModal } from './components/CustomItemModal.tsx';
import { BlueprintModal } from './components/BlueprintModal.tsx';
import { FamilyProfileModal } from './components/FamilyProfileModal.tsx';
import { FURNITURE_CATALOG } from './data/furnitureCatalog.ts';
import { computeZoneAllocations } from './engine/spatialEngine.ts';

const DEFAULT_ROOM_CONFIG: RoomConfig = {
  name: "Child's Room",
  childName: '',
  itsId: '',
  mauze: '',
  jamiat: '',
  hofIts: '',
  hofName: '',
  ageBracket: '0-2',
  exactAgeYears: 1.5,
  widthCm: 360,
  lengthCm: 420,
  doorWall: 'bottom',
  doorOffsetCm: 40,
  doorLeafWidthCm: 85,
  windowWall: 'top',
  windowOffsetCm: 80,
  windowWidthCm: 160,
  ceilingHeightCm: 260,
  colorScheme: 'warm_neutral',
  layoutGoal: 'montessori_autonomy'
};

export const App: React.FC = () => {
  const [roomConfig, setRoomConfig] = useState<RoomConfig>(DEFAULT_ROOM_CONFIG);
  const [furniture, setFurniture] = useState<Box[]>(() => generateSmartAutoLayout(DEFAULT_ROOM_CONFIG));
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Currency Selection State
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  // Left Studio Panel Active Tab
  const [activeLeftTab, setActiveLeftTab] = useState<'measure' | 'ai' | 'catalog' | 'zones'>('measure');

  // Modals
  const [isCustomItemOpen, setIsCustomItemOpen] = useState(false);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [isAiExplainerOpen, setIsAiExplainerOpen] = useState(false);
  const [isFamilyProfileOpen, setIsFamilyProfileOpen] = useState(false);

  // Inline child name editing
  const [isEditingChildName, setIsEditingChildName] = useState(false);
  const [tempChildName, setTempChildName] = useState(roomConfig.childName);

  // Measurement bar local state
  const [unit, setUnit] = useState<UnitType>('m');
  const [widthInput, setWidthInput] = useState<number>(roomConfig.widthCm);
  const [lengthInput, setLengthInput] = useState<number>(roomConfig.lengthCm);
  const [doorWall, setDoorWall] = useState<WallSide>(roomConfig.doorWall);
  const [doorOffset, setDoorOffset] = useState<number>(roomConfig.doorOffsetCm);
  const [windowWall, setWindowWall] = useState<WallSide>(roomConfig.windowWall);
  const [windowOffset, setWindowOffset] = useState<number>(roomConfig.windowOffsetCm);
  const [isApplying, setIsApplying] = useState(false);

  // AI Prompt Bar State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);

  // Catalog search & filter
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogZone, setCatalogZone] = useState<string>('all');

  const curr = CURRENCIES[currency];

  // Helper to format price in selected currency
  const formatPrice = (usdAmount?: number): string => {
    if (usdAmount === undefined || usdAmount === null) return '—';
    const converted = Math.round(usdAmount * curr.rateFromUSD);
    return `${curr.symbol}${converted.toLocaleString()}`;
  };

  // Compute Door Geometry
  const door = useMemo(() => {
    return computeDoorGeometry(
      roomConfig.doorWall,
      roomConfig.doorOffsetCm,
      roomConfig.doorLeafWidthCm,
      roomConfig.widthCm,
      roomConfig.lengthCm
    );
  }, [roomConfig]);

  // Master Spatial & Ergonomic Audit
  const auditResult = useMemo(() => {
    return auditRoomCirculation([door], furniture, roomConfig, 75);
  }, [door, furniture, roomConfig]);

  const criticalViolationCount = auditResult.violations.filter(v => v.severity === 'CRITICAL').length;
  const warningCount = auditResult.violations.filter(v => v.severity === 'WARNING').length;

  const areaSqM = ((roomConfig.widthCm * roomConfig.lengthCm) / 10000).toFixed(1);
  const totalCostUSD = furniture.reduce((sum, item) => sum + (item.priceEst || 0), 0);
  const allocations = computeZoneAllocations(roomConfig.ageBracket, roomConfig.widthCm, roomConfig.lengthCm);

  // Unit conversion helper
  const cmToUnit = (cm: number): string => {
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

  // Apply measurements and generate layout
  const handleApplyMeasurements = () => {
    setIsApplying(true);
    const updated: RoomConfig = {
      ...roomConfig,
      widthCm: widthInput,
      lengthCm: lengthInput,
      doorWall,
      doorOffsetCm: doorOffset,
      windowWall,
      windowOffsetCm: windowOffset
    };
    setRoomConfig(updated);
    const items = generateSmartAutoLayout(updated);
    setFurniture(items);
    setSelectedItemId(null);
    setTimeout(() => setIsApplying(false), 400);
  };

  // Save Child's Name
  const handleSaveChildName = () => {
    setRoomConfig(prev => ({ ...prev, childName: tempChildName.trim() }));
    setIsEditingChildName(false);
  };

  // Auto-generate deterministic layout
  const handleAutoGenerate = useCallback(() => {
    const newItems = generateSmartAutoLayout(roomConfig);
    setFurniture(newItems);
    setSelectedItemId(null);
  }, [roomConfig]);

  // Handle Age Change
  const handleAgeChange = useCallback((newAge: AgeBracket) => {
    const updatedConfig = { ...roomConfig, ageBracket: newAge };
    setRoomConfig(updatedConfig);
    const newItems = generateSmartAutoLayout(updatedConfig);
    setFurniture(newItems);
    setSelectedItemId(null);
  }, [roomConfig]);

  // Auto-Fix Bottlenecks
  const handleAutoFix = useCallback(() => {
    const corrected = generateSmartAutoLayout(roomConfig);
    setFurniture(corrected);
  }, [roomConfig]);

  // Add Item
  const handleAddItem = useCallback((newItem: Box) => {
    setFurniture(prev => [...prev, newItem]);
    setSelectedItemId(newItem.id);
  }, []);

  // AI Prompt Submit
  const handleAiPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);

    const text = aiPrompt.toLowerCase();
    let targetAge: AgeBracket = roomConfig.ageBracket;
    let targetScheme = roomConfig.colorScheme;
    let newWidth = roomConfig.widthCm;
    let newLength = roomConfig.lengthCm;

    if (text.includes('toddler') || text.includes('baby') || text.includes('1') || text.includes('2') || text.includes('infant')) {
      targetAge = '0-2';
      targetScheme = 'warm_neutral';
    } else if (text.includes('preschool') || text.includes('3') || text.includes('4') || text.includes('5')) {
      targetAge = '3-5';
      targetScheme = 'earthy_sage';
    } else if (text.includes('homework') || text.includes('lego') || text.includes('6') || text.includes('7') || text.includes('8') || text.includes('primary')) {
      targetAge = '6-8';
      targetScheme = 'calm_indigo';
      newWidth = Math.max(380, newWidth);
    } else if (text.includes('teen') || text.includes('tween') || text.includes('9') || text.includes('10') || text.includes('11') || text.includes('12')) {
      targetAge = '9-12';
      targetScheme = 'soft_terracotta';
      newWidth = Math.max(400, newWidth);
      newLength = Math.max(450, newLength);
    }

    setTimeout(() => {
      const updated: RoomConfig = {
        ...roomConfig,
        name: `AI: ${aiPrompt.slice(0, 24)}...`,
        ageBracket: targetAge,
        widthCm: newWidth,
        lengthCm: newLength,
        colorScheme: targetScheme
      };
      setRoomConfig(updated);
      setWidthInput(newWidth);
      setLengthInput(newLength);
      const items = generateSmartAutoLayout(updated);
      setFurniture(items);
      setIsAiGenerating(false);
      setAiSuccessMsg(`Synthesized layout for ${targetAge} yrs`);
      setTimeout(() => setAiSuccessMsg(null), 3000);
    }, 500);
  };

  const aiPresets = [
    { label: '🌿 Montessori Toddler Nursery', text: 'Montessori room for a 1.5-year-old with low floor bed, low shelf & crawl mat' },
    { label: '🎨 Preschool Art & Craft Studio', text: 'Preschool craft room for a 4-year-old with sensory table, teepee & dress up cubbies' },
    { label: '🧩 Primary Lego & Study Suite', text: 'Primary student room for 7-year-old with adjustable desk, Lego play area & beanbag' },
    { label: '🎧 Tween Ergonomic Lounge', text: 'Tween bedroom for 10-year-old with sit-stand desk, lounge armchair & storage' }
  ];

  const filteredCatalog = FURNITURE_CATALOG.filter(item => {
    if (catalogZone !== 'all' && item.zone !== catalogZone) return false;
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* 1. Sleek Compact Studio Header Bar */}
      <header className="h-14 bg-slate-900/95 border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 z-30 backdrop-blur">
        {/* Brand & Child's Name Inline Editor */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
            <Sparkles className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-extrabold tracking-tight text-white font-display hidden sm:inline">
              Children's Corner
            </h1>
            <span className="text-slate-600 hidden sm:inline">•</span>

            {/* Editable Child Name Badge */}
            {isEditingChildName ? (
              <div className="flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-0.5 border border-indigo-500">
                <input
                  type="text"
                  autoFocus
                  value={tempChildName}
                  onChange={(e) => setTempChildName(e.target.value)}
                  onBlur={handleSaveChildName}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveChildName()}
                  className="bg-transparent text-xs font-bold text-white outline-none w-28"
                  placeholder="Enter Name..."
                />
                <button onClick={handleSaveChildName} className="text-emerald-400">
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempChildName(roomConfig.childName);
                  setIsEditingChildName(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-bold text-slate-200 transition-colors group"
                title="Click to rename child"
              >
                <User className="w-3 h-3 text-indigo-400" />
                <span>{roomConfig.childName ? `${roomConfig.childName}'s Room` : '+ Add Child Name'}</span>
                <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
              </button>
            )}

            {/* ITS52 Badge */}
            <button
              onClick={() => setIsFamilyProfileOpen(true)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-500/40 text-[11px] font-mono font-bold text-indigo-300 transition-colors"
              title="Click to edit ITS52, Mauze, Jamiat, and HOF"
            >
              <Hash className="w-3 h-3 text-amber-400" />
              <span>{roomConfig.itsId ? `ITS: ${roomConfig.itsId}` : '+ Add ITS52'}</span>
            </button>
          </div>
        </div>

        {/* Center: Quick Age Switcher */}
        <div className="flex items-center bg-slate-800/90 rounded-xl p-0.5 border border-slate-700/80 text-xs">
          {(['0-2', '3-5', '6-8', '9-12'] as AgeBracket[]).map((age) => (
            <button
              key={age}
              onClick={() => handleAgeChange(age)}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                roomConfig.ageBracket === age
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {age} yrs
            </button>
          ))}
        </div>

        {/* Right Actions: Currency Selector + Family Profile + Blueprint */}
        <div className="flex items-center gap-2">
          {/* Currency Dropdown Panel */}
          <div className="flex items-center bg-slate-800/90 rounded-xl px-2 py-1 border border-slate-700/70 text-xs font-bold text-slate-200">
            <Coins className="w-3.5 h-3.5 text-amber-400 mr-1.5 shrink-0" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Family & ITS Registration Button */}
          <button
            onClick={() => setIsFamilyProfileOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all"
            title="Manage ITS52, Mauze, Jamiat and HOF Registration"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Family & ITS</span>
          </button>

          {/* Spatial Audit Score Badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${
            criticalViolationCount > 0
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              : warningCount > 0
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
          }`}>
            {criticalViolationCount > 0 ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{auditResult.score}% Audit</span>
          </div>

          {/* Quick Auto-Generate Button */}
          <button
            onClick={handleAutoGenerate}
            title="Auto-generate layout from architectural rules"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Auto-Layout</span>
          </button>

          {/* Blueprint Export */}
          <button
            onClick={() => setIsBlueprintOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Blueprint</span>
          </button>
        </div>
      </header>

      {/* 2. Main Studio Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Studio Sidebar */}
        <aside className="w-80 lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-20 shadow-xl">
          {/* Studio Navigation Tabs */}
          <div className="flex items-center p-1.5 border-b border-slate-800 bg-slate-900/90 gap-1 text-xs">
            <button
              onClick={() => setActiveLeftTab('measure')}
              className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeLeftTab === 'measure'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Space</span>
            </button>

            <button
              onClick={() => setActiveLeftTab('ai')}
              className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeLeftTab === 'ai'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Stylist</span>
            </button>

            <button
              onClick={() => setActiveLeftTab('catalog')}
              className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeLeftTab === 'catalog'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </button>

            <button
              onClick={() => setActiveLeftTab('zones')}
              className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeLeftTab === 'zones'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Zones</span>
            </button>
          </div>

          {/* Tab 1: Space Measurement & Family Info Configurator */}
          {activeLeftTab === 'measure' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Room Dimensions</h3>
                  <p className="text-[11px] text-slate-400">Specify perimeter width, length & anchors</p>
                </div>

                {/* Unit Switcher */}
                <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-[10px]">
                  {(['m', 'ft', 'cm'] as UnitType[]).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnit(u)}
                      className={`px-2 py-0.5 rounded font-bold ${
                        unit === u ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {u.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Family Registration Summary Card */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Family & ITS52 Details</span>
                  </div>
                  <button
                    onClick={() => setIsFamilyProfileOpen(true)}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-200 underline"
                  >
                    {roomConfig.itsId || roomConfig.childName ? 'Edit Details' : '+ Add Details'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Name:</span>
                    <strong className="text-slate-200">{roomConfig.childName || 'Not set'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ITS52:</span>
                    <strong className="text-amber-400 font-mono">{roomConfig.itsId || 'Not set'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Mauze:</span>
                    <strong className="text-slate-200">{roomConfig.mauze || 'Not set'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">HOF ITS:</span>
                    <strong className="text-emerald-400 font-mono">{roomConfig.hofIts || 'Not set'}</strong>
                  </div>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { label: '3.2 × 3.6m', w: 320, l: 360 },
                  { label: '3.6 × 4.2m', w: 360, l: 420 },
                  { label: '4.0 × 4.8m', w: 400, l: 480 },
                  { label: '3.0 × 5.2m', w: 300, l: 520 },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setWidthInput(preset.w);
                      setLengthInput(preset.l);
                    }}
                    className={`py-1.5 px-2 rounded-xl border text-xs font-medium transition-all ${
                      widthInput === preset.w && lengthInput === preset.l
                        ? 'bg-indigo-950/70 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500'
                        : 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Room Width & Length Inputs */}
              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">Room Width</span>
                    <span className="font-mono text-indigo-400 font-bold">{widthInput} cm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step={unit === 'm' ? '0.1' : unit === 'ft' ? '0.5' : '10'}
                      value={cmToUnit(widthInput)}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white font-mono focus:border-indigo-500 focus:outline-none"
                    />
                    <input
                      type="range"
                      min="200"
                      max="700"
                      step="10"
                      value={widthInput}
                      onChange={(e) => setWidthInput(Number(e.target.value))}
                      className="flex-1 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">Room Length</span>
                    <span className="font-mono text-indigo-400 font-bold">{lengthInput} cm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step={unit === 'm' ? '0.1' : unit === 'ft' ? '0.5' : '10'}
                      value={cmToUnit(lengthInput)}
                      onChange={(e) => handleLengthChange(e.target.value)}
                      className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white font-mono focus:border-indigo-500 focus:outline-none"
                    />
                    <input
                      type="range"
                      min="200"
                      max="800"
                      step="10"
                      value={lengthInput}
                      onChange={(e) => setLengthInput(Number(e.target.value))}
                      className="flex-1 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Wall Anchors (Door & Window) */}
              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>Wall Anchors</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Door Wall</span>
                    <select
                      value={doorWall}
                      onChange={(e) => setDoorWall(e.target.value as WallSide)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
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
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                    >
                      <option value="top">North (Top)</option>
                      <option value="bottom">South (Bottom)</option>
                      <option value="left">West (Left)</option>
                      <option value="right">East (Right)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Big Apply Button */}
              <button
                onClick={handleApplyMeasurements}
                disabled={isApplying}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isApplying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Apply & Generate Layout</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tab 2: AI Stylist & Prompts + "How AI Works" Explainer */}
          {activeLeftTab === 'ai' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>AI Room Stylist</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Natural language layout generator</p>
                </div>

                {/* AI Explanation Modal Trigger */}
                <button
                  onClick={() => setIsAiExplainerOpen(true)}
                  className="px-2 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-[10px] text-indigo-300 font-bold hover:bg-indigo-900/60 transition-colors flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3 text-indigo-400" />
                  <span>How AI Works</span>
                </button>
              </div>

              <form onSubmit={handleAiPromptSubmit} className="space-y-2">
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. 'Montessori room for a 3-year-old with low shelves, cozy reading teepee and soft floor mat'..."
                  className="w-full bg-slate-850 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none placeholder:text-slate-500"
                />

                <button
                  type="submit"
                  disabled={isAiGenerating || !aiPrompt.trim()}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isAiGenerating ? 'Generating Layout...' : 'Prompt to Layout'}</span>
                </button>
              </form>

              {aiSuccessMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{aiSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Quick Preset Inspirations:</span>
                <div className="space-y-1.5">
                  {aiPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAiPrompt(preset.text)}
                      className="w-full text-left p-2 rounded-lg bg-slate-850 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/50 text-xs text-slate-300 transition-all"
                    >
                      <div className="font-semibold text-slate-200">{preset.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">{preset.text}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Furniture Catalog & Custom Item */}
          {activeLeftTab === 'catalog' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ergonomic Catalog ({curr.code})</h3>
                <button
                  onClick={() => setIsCustomItemOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-[11px] text-indigo-300 hover:bg-indigo-600 hover:text-white font-bold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Custom Item</span>
                </button>
              </div>

              {/* Search & Filter */}
              <input
                type="text"
                placeholder="Search catalog items..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />

              {/* Zone Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                {['all', 'active', 'calm', 'focus', 'storage'].map((z) => (
                  <button
                    key={z}
                    onClick={() => setCatalogZone(z)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-medium shrink-0 transition-all ${
                      catalogZone === z ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {z}
                  </button>
                ))}
              </div>

              {/* Item Cards */}
              <div className="space-y-2 pt-1">
                {filteredCatalog.map((item) => (
                  <div
                    key={item.catalogId}
                    className="p-3 rounded-xl bg-slate-850 border border-slate-800 hover:border-slate-700 flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="text-xs font-bold text-slate-200">{item.name}</div>
                        <div className="text-[10px] text-slate-400">{item.dimensionsText} • <strong className="text-emerald-400">{formatPrice(item.priceEst)}</strong></div>
                      </div>
                      <span className={`w-2 h-2 rounded-full mt-1 ${
                        item.zone === 'active' ? 'bg-amber-400' :
                        item.zone === 'calm' ? 'bg-indigo-400' :
                        item.zone === 'focus' ? 'bg-emerald-400' : 'bg-orange-400'
                      }`} />
                    </div>

                    <button
                      onClick={() => handleAddItem({
                        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                        name: item.name,
                        category: item.category,
                        zone: item.zone,
                        x: Math.round((roomConfig.widthCm - item.width) / 2),
                        y: Math.round((roomConfig.lengthCm - item.height) / 2),
                        width: item.width,
                        height: item.height,
                        rotation: 0,
                        shelfHeightCm: item.shelfHeightCm,
                        priceEst: item.priceEst,
                        safetyNotes: item.safetyNotes
                      })}
                      className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Place in Room</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Zoning & Milestone Checklists */}
          {activeLeftTab === 'zones' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Zone Matrix ({roomConfig.ageBracket} yrs)</h3>
                <p className="text-[11px] text-slate-400">Developmental micro-zone percentage ratios</p>
              </div>

              <div className="space-y-2.5">
                {allocations.map((alloc) => (
                  <div key={alloc.zone} className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{alloc.label}</span>
                      <span className="font-bold font-mono" style={{ color: alloc.color }}>
                        {alloc.targetPercent}% ({alloc.targetAreaSqM} m²)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${alloc.targetPercent}%`, backgroundColor: alloc.color }} />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{alloc.description}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1.5 text-xs">
                <div className="font-bold text-slate-200">Circadian Lighting Specs:</div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div>• Ambient Room: <strong className="text-amber-300">2700K Warm</strong></div>
                  <div>• Study Workstation: <strong className="text-emerald-300">4000K Neutral High-CRI</strong></div>
                  <div>• Reading Nook: <strong className="text-indigo-300">2200K Amber</strong></div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Center: Full-Height Interactive Canvas */}
        <main className="flex-1 h-full relative bg-slate-950 flex flex-col overflow-hidden">
          <FloorplanCanvas
            roomConfig={roomConfig}
            furniture={furniture}
            onUpdateFurniture={setFurniture}
            violations={auditResult.violations}
            distanceLines={auditResult.distanceLines}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
            onUpdateRoomConfig={setRoomConfig}
          />
        </main>

        {/* Right Studio Inspector (Live Spatial Audit, Safety & Cost) */}
        <aside className="w-72 lg:w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-20 overflow-y-auto p-4 space-y-4">
          {/* Spatial Audit Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Spatial & Safety Audit</h3>
              <p className="text-[10px] text-slate-400">75cm Corridors & Door Sweeps</p>
            </div>
            <div className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
              auditResult.score >= 90 ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' :
              auditResult.score >= 70 ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' :
              'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              {auditResult.score}% Compliant
            </div>
          </div>

          {/* Auto Fix Button if any violations exist */}
          {auditResult.violations.length > 0 && (
            <button
              onClick={handleAutoFix}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Auto-Resolve ({auditResult.violations.length} Issues)</span>
            </button>
          )}

          {/* Violations List */}
          <div className="space-y-2">
            {auditResult.violations.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-1">
                <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto" />
                <div className="text-xs font-bold text-emerald-300">Perfect Architectural Flow</div>
                <div className="text-[10px] text-emerald-400/80">Door sweep and ≥75cm walking corridors are fully clear.</div>
              </div>
            ) : (
              auditResult.violations.map((v) => (
                <div
                  key={v.id}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    v.severity === 'CRITICAL'
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                      : 'bg-amber-950/25 border-amber-500/30 text-amber-200'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{v.title}</span>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/40">
                      {v.severity}
                    </span>
                  </div>
                  <p className="text-[10px] opacity-90 leading-tight">{v.description}</p>
                </div>
              ))
            )}
          </div>

          {/* Furniture Footprint & Cost Card in Selected Currency */}
          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-slate-200 flex items-center justify-between">
              <span>Layout Inventory</span>
              <span className="text-amber-400 font-mono font-bold">{furniture.length} items</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              <span>Procurement ({curr.code}):</span>
              <strong className="text-emerald-400 font-mono text-sm">{formatPrice(totalCostUSD)}</strong>
            </div>
          </div>
        </aside>
      </div>

      {/* AI Stylist Explanation Modal */}
      {isAiExplainerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">How the AI Stylist Operates</h3>
                  <p className="text-xs text-slate-400">Underlying developmental science & algorithmic pipeline</p>
                </div>
              </div>
              <button onClick={() => setIsAiExplainerOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-2">
                <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>1. Child Developmental Milestone Parsing</span>
                </h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  When you input natural prompts (e.g. <em>"Montessori room for a 2-year-old with climbing mat"</em>), the engine extracts child developmental keywords and maps them to anthropometric growth stages (Montessori autonomy, Piaget pre-operational symbolic play, or Primary study habits).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-2">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>2. 4-Zone Area Weighting Engine</span>
                </h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Automatically calculates square-meter footprint ratios for <strong>Active Play</strong>, <strong>Calm / Sensory Nook</strong>, <strong>Focus / Tabletop</strong>, and <strong>Sleep & Storage</strong> based on developmental age guardrails.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-2">
                <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>3. Wall-Anchor Priority & Window Light Alignment</span>
                </h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Anchors the <strong>Calm/Sleep Zone</strong> opposite to the door for visual serenity upon entering, places the <strong>Focus Workstation</strong> perpendicular to window natural light to eliminate screen glare, and aligns <strong>Low Storage</strong> along the continuous wall.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-2">
                <h4 className="font-bold text-sky-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>4. 75cm Minkowski Clearance & Arc Sweep Safety</span>
                </h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Guarantees that every generated piece maintains a minimum <strong>75 cm clear circulation corridor</strong> and verifies that the door swing sector is 100% unobstructed for emergency egress and toddler safety.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsAiExplainerOpen(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Family & ITS Profile Modal */}
      <FamilyProfileModal
        isOpen={isFamilyProfileOpen}
        onClose={() => setIsFamilyProfileOpen(false)}
        roomConfig={roomConfig}
        onSaveProfile={(updated) => {
          setRoomConfig(prev => ({ ...prev, ...updated }));
        }}
      />

      {/* Custom Item Modal */}
      <CustomItemModal
        isOpen={isCustomItemOpen}
        onClose={() => setIsCustomItemOpen(false)}
        roomConfig={roomConfig}
        currency={currency}
        onAddCustomItem={handleAddItem}
      />

      {/* Blueprint Modal */}
      <BlueprintModal
        isOpen={isBlueprintOpen}
        onClose={() => setIsBlueprintOpen(false)}
        roomConfig={roomConfig}
        furniture={furniture}
        auditScore={auditResult.score}
        currency={currency}
      />
    </div>
  );
};
