import React, { useState, useMemo, useCallback } from 'react';
import { 
  RoomConfig, 
  Box, 
  AgeBracket,
  UnitType,
  WallSide,
  DoorType,
  CurrencyCode,
  CURRENCIES
} from './types/index.ts';
import { 
  computeDoorGeometry, 
  auditRoomCirculation, 
  generateSmartAutoLayout
} from './engine/spatialEngine.ts';
import { 
  Home, 
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
  UserCheck, 
  Sun 
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
  hasDoor: true,
  doorType: 'inward',
  doorWall: 'bottom',
  doorOffsetCm: 40,
  doorLeafWidthCm: 85,
  hasWindow: true,
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
  const [hasDoor, setHasDoor] = useState<boolean>(roomConfig.hasDoor ?? true);
  const [doorType, setDoorType] = useState<DoorType>(roomConfig.doorType ?? 'inward');
  const [doorWall, setDoorWall] = useState<WallSide>(roomConfig.doorWall);
  const [doorOffset, setDoorOffset] = useState<number>(roomConfig.doorOffsetCm);
  const [doorLeafWidth, setDoorLeafWidth] = useState<number>(roomConfig.doorLeafWidthCm ?? 85);
  const [hasWindow, setHasWindow] = useState<boolean>(roomConfig.hasWindow ?? true);
  const [windowWall, setWindowWall] = useState<WallSide>(roomConfig.windowWall);
  const [windowOffset, setWindowOffset] = useState<number>(roomConfig.windowOffsetCm);
  const [windowWidth, setWindowWidth] = useState<number>(roomConfig.windowWidthCm ?? 160);
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
      roomConfig.lengthCm,
      roomConfig.hasDoor,
      roomConfig.doorType
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
      hasDoor,
      doorType,
      doorWall,
      doorOffsetCm: doorOffset,
      doorLeafWidthCm: doorLeafWidth,
      hasWindow,
      windowWall,
      windowOffsetCm: windowOffset,
      windowWidthCm: windowWidth
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
    <div className="h-screen w-screen bg-[#FAF7F2] text-stone-800 flex flex-col font-sans overflow-hidden select-none">
      {/* 1. Sleek Luminous AI Studio Header Bar */}
      <header className="h-14 bg-white/90 border-b border-stone-200/80 px-4 flex items-center justify-between shrink-0 z-30 backdrop-blur-xl shadow-xs">
        {/* Brand & Child's Name Inline Editor */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-mint-500 via-azure-500 to-coral-500 flex items-center justify-center text-white shadow-md shadow-coral-500/25 ring-1 ring-white/60">
            <Home className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-extrabold tracking-tight text-stone-900 font-display hidden sm:inline">
              Children's Corner
            </h1>
            <span className="text-stone-400 hidden sm:inline">•</span>

            {/* Editable Child Name Badge */}
            {isEditingChildName ? (
              <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-0.5 border border-mint-500 shadow-sm">
                <input
                  type="text"
                  autoFocus
                  value={tempChildName}
                  onChange={(e) => setTempChildName(e.target.value)}
                  onBlur={handleSaveChildName}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveChildName()}
                  className="bg-transparent text-xs font-bold text-stone-900 outline-none w-28"
                  placeholder="Enter Name..."
                />
                <button onClick={handleSaveChildName} className="text-mint-600">
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempChildName(roomConfig.childName);
                  setIsEditingChildName(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200/80 text-xs font-bold text-stone-700 transition-colors group shadow-xs"
                title="Click to rename child"
              >
                <User className="w-3 h-3 text-mint-600" />
                <span>{roomConfig.childName ? `${roomConfig.childName}'s Room` : '+ Add Child Name'}</span>
                <span className="text-[10px] text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
              </button>
            )}

            {/* ITS52 Badge */}
            <button
              onClick={() => setIsFamilyProfileOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-coral-50 hover:bg-coral-100/80 border border-coral-200/80 text-[11px] font-mono font-bold text-coral-700 transition-colors shadow-xs"
              title="Click to edit ITS52, Mauze, Jamiat, and HOF"
            >
              <Hash className="w-3 h-3 text-coral-500" />
              <span>{roomConfig.itsId ? `ITS: ${roomConfig.itsId}` : '+ Add ITS52'}</span>
            </button>
          </div>
        </div>

        {/* Center: Quick Age Switcher */}
        <div className="flex items-center bg-stone-100/90 rounded-2xl p-1 border border-stone-200/80 text-xs shadow-xs">
          {(['0-2', '3-5', '6-8', '9-12'] as AgeBracket[]).map((age) => (
            <button
              key={age}
              onClick={() => handleAgeChange(age)}
              className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                roomConfig.ageBracket === age
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/60 font-extrabold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {age} yrs
            </button>
          ))}
        </div>

        {/* Right Actions: Currency Selector + Family Profile + Blueprint */}
        <div className="flex items-center gap-2">
          {/* Currency Dropdown Panel */}
          <div className="flex items-center bg-stone-100 rounded-xl px-2 py-1 border border-stone-200 text-xs font-bold text-stone-700 shadow-xs">
            <Coins className="w-3.5 h-3.5 text-sunshine-600 mr-1.5 shrink-0" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="bg-transparent text-xs font-bold text-stone-800 outline-none cursor-pointer"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code} className="bg-white text-stone-900">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Family & ITS Registration Button */}
          <button
            onClick={() => setIsFamilyProfileOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 transition-all shadow-xs"
            title="Manage ITS52, Mauze, Jamiat and HOF Registration"
          >
            <UserCheck className="w-3.5 h-3.5 text-azure-500" />
            <span>Family & ITS</span>
          </button>

          {/* Spatial Audit Score Badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${
            criticalViolationCount > 0
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : warningCount > 0
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-mint-50 border-mint-200 text-mint-700'
          }`}>
            {criticalViolationCount > 0 ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-mint-600" />
            )}
            <span>{auditResult.score}% Audit</span>
          </div>

          {/* Quick Auto-Generate Button */}
          <button
            onClick={handleAutoGenerate}
            title="Auto-generate layout from architectural rules"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-coral-500 to-sunshine-500 hover:from-coral-400 hover:to-sunshine-400 text-white font-black text-xs shadow-md shadow-coral-500/25 active:scale-95 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Auto-Layout</span>
          </button>

          {/* Blueprint Export */}
          <button
            onClick={() => setIsBlueprintOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-azure-600 hover:bg-azure-500 text-white font-bold text-xs shadow-md shadow-azure-600/25 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Blueprint</span>
          </button>
        </div>
      </header>

      {/* 2. Main Studio Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Studio Sidebar */}
        <aside className="w-80 lg:w-96 bg-white/85 backdrop-blur-2xl border-r border-stone-200/80 flex flex-col shrink-0 z-20 shadow-xl shadow-stone-200/30">
          {/* Studio Navigation Tabs */}
          <div className="flex items-center p-2 border-b border-stone-200/80 bg-stone-50/70 gap-1 text-xs">
            <button
              onClick={() => setActiveLeftTab('measure')}
              className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeLeftTab === 'measure'
                  ? 'bg-mint-500 text-white shadow-md shadow-mint-500/25'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/60'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Space</span>
            </button>

            <button
              onClick={() => setActiveLeftTab('ai')}
              className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeLeftTab === 'ai'
                  ? 'bg-gradient-to-r from-coral-500 to-sunshine-500 text-white shadow-md shadow-coral-500/25'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/60'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>AI Stylist</span>
            </button>

            <button
              onClick={() => setActiveLeftTab('catalog')}
              className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeLeftTab === 'catalog'
                  ? 'bg-azure-500 text-white shadow-md shadow-azure-500/25'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/60'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </button>

            <button
              onClick={() => setActiveLeftTab('zones')}
              className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeLeftTab === 'zones'
                  ? 'bg-stone-800 text-white shadow-md shadow-stone-800/25'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/60'
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
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Room Dimensions</h3>
                  <p className="text-[11px] text-stone-500">Specify perimeter width, length & anchors</p>
                </div>

                {/* Unit Switcher */}
                <div className="flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-200 text-[10px]">
                  {(['m', 'ft', 'cm'] as UnitType[]).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnit(u)}
                      className={`px-2 py-0.5 rounded-lg font-bold ${
                        unit === u ? 'bg-mint-500 text-white shadow-xs' : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      {u.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Family Registration Summary Card */}
              <div className="p-3.5 rounded-2xl bg-coral-50/70 border border-coral-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-coral-800 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-coral-600" />
                    <span>Family & ITS52 Details</span>
                  </div>
                  <button
                    onClick={() => setIsFamilyProfileOpen(true)}
                    className="text-[10px] font-bold text-coral-600 hover:text-coral-800 underline"
                  >
                    {roomConfig.itsId || roomConfig.childName ? 'Edit Details' : '+ Add Details'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-stone-500 block text-[10px]">Name:</span>
                    <strong className="text-stone-800">{roomConfig.childName || 'Not set'}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">ITS52:</span>
                    <strong className="text-coral-700 font-mono">{roomConfig.itsId || 'Not set'}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Mauze:</span>
                    <strong className="text-stone-800">{roomConfig.mauze || 'Not set'}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">HOF ITS:</span>
                    <strong className="text-mint-700 font-mono">{roomConfig.hofIts || 'Not set'}</strong>
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
                    className={`py-1.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
                      widthInput === preset.w && lengthInput === preset.l
                        ? 'bg-azure-50 border-azure-400 text-azure-700 ring-1 ring-azure-400 shadow-xs'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Room Width & Length Inputs */}
              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-2xl bg-white border border-stone-200 space-y-2 shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-700">Room Width</span>
                    <span className="font-mono text-azure-600 font-bold">{widthInput} cm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step={unit === 'm' ? '0.1' : unit === 'ft' ? '0.5' : '10'}
                      value={cmToUnit(widthInput)}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      className="w-24 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-900 font-mono focus:border-azure-500 focus:bg-white focus:outline-none"
                    />
                    <input
                      type="range"
                      min="200"
                      max="700"
                      step="10"
                      value={widthInput}
                      onChange={(e) => setWidthInput(Number(e.target.value))}
                      className="flex-1 accent-azure-500 h-1.5 bg-stone-100 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-stone-200 space-y-2 shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-700">Room Length</span>
                    <span className="font-mono text-azure-600 font-bold">{lengthInput} cm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step={unit === 'm' ? '0.1' : unit === 'ft' ? '0.5' : '10'}
                      value={cmToUnit(lengthInput)}
                      onChange={(e) => handleLengthChange(e.target.value)}
                      className="w-24 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-900 font-mono focus:border-azure-500 focus:bg-white focus:outline-none"
                    />
                    <input
                      type="range"
                      min="200"
                      max="800"
                      step="10"
                      value={lengthInput}
                      onChange={(e) => setLengthInput(Number(e.target.value))}
                      className="flex-1 accent-azure-500 h-1.5 bg-stone-100 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Wall Anchors (Door & Window Configuration) */}
              <div className="space-y-3">
                {/* 1. Door & Entryway Configuration */}
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-mint-50 text-mint-600 border border-mint-200/60 flex items-center justify-center shrink-0">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-800">Door & Entry Arc</div>
                        <div className="text-[10px] text-stone-400">Clearance arc collision detection</div>
                      </div>
                    </div>

                    {/* Intuitive iOS-Style Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={hasDoor}
                      onClick={() => setHasDoor(!hasDoor)}
                      className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-mint-500/30 ${
                        hasDoor ? 'bg-mint-500' : 'bg-stone-300'
                      }`}
                      title={hasDoor ? "Click to remove door" : "Click to add door"}
                    >
                      <span className="sr-only">Toggle door</span>
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          hasDoor ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {hasDoor ? (
                    <div className="space-y-2.5 pt-1 border-t border-stone-100">
                      {/* Door Type Selection */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-500 block font-semibold uppercase">Door Swing / Entryway Type</label>
                        <select
                          value={doorType}
                          onChange={(e) => setDoorType(e.target.value as DoorType)}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-mint-500 font-medium"
                        >
                          <option value="inward">Inward Swing Door (Standard Arc)</option>
                          <option value="outward">Outward Swing Door (Exterior Sweep)</option>
                          <option value="sliding">Sliding / Pocket Door (Zero Inward Sweep)</option>
                          <option value="open_arch">Open Archway / Passage (No Door Leaf)</option>
                        </select>
                      </div>

                      {/* Door Wall Placement */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-stone-500 block mb-1 font-semibold uppercase">Door Wall</label>
                          <select
                            value={doorWall}
                            onChange={(e) => setDoorWall(e.target.value as WallSide)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-mint-500"
                          >
                            <option value="bottom">South (Bottom)</option>
                            <option value="top">North (Top)</option>
                            <option value="left">West (Left)</option>
                            <option value="right">East (Right)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-stone-500 block mb-1 font-semibold uppercase">Door Leaf / Arc (cm)</label>
                          <input
                            type="number"
                            min="60"
                            max="120"
                            step="5"
                            value={doorLeafWidth}
                            onChange={(e) => setDoorLeafWidth(Math.max(50, Math.min(130, Number(e.target.value))))}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2 py-1.5 text-xs font-mono text-stone-800 focus:outline-none focus:border-mint-500"
                          />
                        </div>
                      </div>

                      {/* Door Leaf Width Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-stone-500">
                          <span>Door Arc Radius / Opening Width:</span>
                          <strong className="text-sunshine-700 font-mono">{doorLeafWidth} cm</strong>
                        </div>
                        <input
                          type="range"
                          min="60"
                          max="120"
                          step="5"
                          value={doorLeafWidth}
                          onChange={(e) => setDoorLeafWidth(Number(e.target.value))}
                          className="w-full accent-sunshine-500 h-1.5 bg-stone-100 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Door Offset from Corner Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-stone-500">
                          <span>Position Offset from Corner:</span>
                          <strong className="text-azure-600 font-mono">{doorOffset} cm</strong>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max={Math.max(20, (doorWall === 'left' || doorWall === 'right' ? lengthInput : widthInput) - doorLeafWidth - 10)}
                          step="5"
                          value={doorOffset}
                          onChange={(e) => setDoorOffset(Number(e.target.value))}
                          className="w-full accent-azure-500 h-1.5 bg-stone-100 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-400">🚪</span>
                        <span>No door in this room (door arc collisions disabled)</span>
                      </div>
                      <span className="text-[10px] font-bold text-stone-400 font-mono uppercase">Disabled</span>
                    </div>
                  )}
                </div>

                {/* 2. Window & Natural Light Configuration */}
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-sunshine-50 text-sunshine-600 border border-sunshine-200/60 flex items-center justify-center shrink-0">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-800">Window & Daylight</div>
                        <div className="text-[10px] text-stone-400">Natural light & sill clearance</div>
                      </div>
                    </div>

                    {/* Intuitive iOS-Style Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={hasWindow}
                      onClick={() => setHasWindow(!hasWindow)}
                      className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-azure-500/30 ${
                        hasWindow ? 'bg-azure-500' : 'bg-stone-300'
                      }`}
                      title={hasWindow ? "Click to remove window" : "Click to add window"}
                    >
                      <span className="sr-only">Toggle window</span>
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          hasWindow ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {hasWindow ? (
                    <div className="space-y-2.5 pt-1 border-t border-stone-100">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-stone-500 block mb-1 font-semibold uppercase">Window Wall</label>
                          <select
                            value={windowWall}
                            onChange={(e) => setWindowWall(e.target.value as WallSide)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-azure-500"
                          >
                            <option value="top">North (Top)</option>
                            <option value="bottom">South (Bottom)</option>
                            <option value="left">West (Left)</option>
                            <option value="right">East (Right)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-stone-500 block mb-1 font-semibold uppercase">Width (cm)</label>
                          <input
                            type="number"
                            min="60"
                            max="300"
                            step="10"
                            value={windowWidth}
                            onChange={(e) => setWindowWidth(Math.max(40, Math.min(350, Number(e.target.value))))}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2 py-1.5 text-xs font-mono text-stone-800 focus:outline-none focus:border-azure-500"
                          />
                        </div>
                      </div>

                      {/* Window Position Offset Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-stone-500">
                          <span>Window Position Offset:</span>
                          <strong className="text-azure-600 font-mono">{windowOffset} cm</strong>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max={Math.max(20, (windowWall === 'left' || windowWall === 'right' ? lengthInput : widthInput) - windowWidth - 10)}
                          step="10"
                          value={windowOffset}
                          onChange={(e) => setWindowOffset(Number(e.target.value))}
                          className="w-full accent-azure-500 h-1.5 bg-stone-100 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-400">🪟</span>
                        <span>No window in this room</span>
                      </div>
                      <span className="text-[10px] font-bold text-stone-400 font-mono uppercase">Disabled</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Big Apply Button */}
              <button
                onClick={handleApplyMeasurements}
                disabled={isApplying}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-coral-500 via-coral-400 to-sunshine-500 hover:from-coral-600 hover:to-sunshine-600 text-white font-black text-xs shadow-lg shadow-coral-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isApplying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Home className="w-4 h-4" />
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
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-coral-500" />
                    <span>AI Room Stylist</span>
                  </h3>
                  <p className="text-[11px] text-stone-500">Natural language layout generator</p>
                </div>

                {/* AI Explanation Modal Trigger */}
                <button
                  onClick={() => setIsAiExplainerOpen(true)}
                  className="px-2.5 py-1 rounded-xl bg-azure-50 border border-azure-200 text-[10px] text-azure-700 font-bold hover:bg-azure-100 transition-colors flex items-center gap-1 shadow-xs"
                >
                  <HelpCircle className="w-3 h-3 text-azure-600" />
                  <span>How AI Works</span>
                </button>
              </div>

              <form onSubmit={handleAiPromptSubmit} className="space-y-2">
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. 'Montessori room for a 3-year-old with low shelves, cozy reading teepee and soft floor mat'..."
                  className="w-full bg-white border border-stone-200 rounded-2xl p-3 text-xs text-stone-800 focus:outline-none focus:border-coral-500 resize-none placeholder:text-stone-400 shadow-xs"
                />

                <button
                  type="submit"
                  disabled={isAiGenerating || !aiPrompt.trim()}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-coral-500 to-sunshine-500 hover:from-coral-600 hover:to-sunshine-600 text-white font-bold text-xs shadow-md shadow-coral-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>{isAiGenerating ? 'Generating Layout...' : 'Prompt to Layout'}</span>
                </button>
              </form>

              {aiSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-mint-50 border border-mint-200 text-mint-800 text-xs flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-mint-600 shrink-0" />
                  <span>{aiSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-stone-200">
                <span className="text-[10px] font-bold text-stone-500 uppercase">Quick Preset Inspirations:</span>
                <div className="space-y-1.5">
                  {aiPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAiPrompt(preset.text)}
                      className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-coral-50/50 border border-stone-200 hover:border-coral-300 text-xs text-stone-700 transition-all shadow-xs"
                    >
                      <div className="font-semibold text-stone-900">{preset.label}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5 truncate">{preset.text}</div>
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
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Ergonomic Catalog ({curr.code})</h3>
                <button
                  onClick={() => setIsCustomItemOpen(true)}
                  className="px-2.5 py-1 rounded-xl bg-azure-50 border border-azure-200 text-[11px] text-azure-700 hover:bg-azure-500 hover:text-white font-bold flex items-center gap-1 transition-all shadow-xs"
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
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-azure-500 shadow-xs"
              />

              {/* Zone Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                {['all', 'active', 'calm', 'focus', 'storage'].map((z) => (
                  <button
                    key={z}
                    onClick={() => setCatalogZone(z)}
                    className={`px-2.5 py-1 rounded-xl capitalize font-medium shrink-0 transition-all ${
                      catalogZone === z ? 'bg-azure-500 text-white shadow-xs' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
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
                    className="p-3 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 flex flex-col justify-between gap-2 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="text-xs font-bold text-stone-800">{item.name}</div>
                        <div className="text-[10px] text-stone-500">{item.dimensionsText} • <strong className="text-mint-700">{formatPrice(item.priceEst)}</strong></div>
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full mt-1 ${
                        item.zone === 'active' ? 'bg-sunshine-400' :
                        item.zone === 'calm' ? 'bg-mint-400' :
                        item.zone === 'focus' ? 'bg-azure-400' : 'bg-coral-400'
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
                      className="w-full py-1.5 rounded-xl bg-stone-100 hover:bg-azure-500 text-stone-700 hover:text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1"
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
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Zone Matrix ({roomConfig.ageBracket} yrs)</h3>
                <p className="text-[11px] text-stone-500">Developmental micro-zone percentage ratios</p>
              </div>

              <div className="space-y-2.5">
                {allocations.map((alloc) => (
                  <div key={alloc.zone} className="p-3 rounded-2xl bg-white border border-stone-200 space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-800">{alloc.label}</span>
                      <span className="font-bold font-mono" style={{ color: alloc.color }}>
                        {alloc.targetPercent}% ({alloc.targetAreaSqM} m²)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${alloc.targetPercent}%`, backgroundColor: alloc.color }} />
                    </div>
                    <p className="text-[10px] text-stone-500 leading-relaxed">{alloc.description}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-2xl bg-white border border-stone-200 space-y-1.5 text-xs shadow-xs">
                <div className="font-bold text-stone-800">Circadian Lighting Specs:</div>
                <div className="text-[11px] text-stone-600 space-y-0.5">
                  <div>• Ambient Room: <strong className="text-sunshine-700">2700K Warm Linen</strong></div>
                  <div>• Study Workstation: <strong className="text-azure-700">4000K Neutral High-CRI</strong></div>
                  <div>• Reading Nook: <strong className="text-coral-700">2200K Soft Amber</strong></div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Center: Full-Height Interactive Canvas */}
        <main className="flex-1 h-full relative bg-[#FAF7F2] flex flex-col overflow-hidden">
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
        <aside className="w-72 lg:w-80 bg-white/85 backdrop-blur-2xl border-l border-stone-200/80 flex flex-col shrink-0 z-20 overflow-y-auto p-4 space-y-4 shadow-xl shadow-stone-200/30">
          {/* Spatial Audit Header */}
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Spatial & Safety Audit</h3>
              <p className="text-[10px] text-stone-500">75cm Corridors & Door Sweeps</p>
            </div>
            <div className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
              auditResult.score >= 90 ? 'bg-mint-50 border-mint-200 text-mint-700' :
              auditResult.score >= 70 ? 'bg-amber-50 border-amber-200 text-amber-700' :
              'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              {auditResult.score}% Compliant
            </div>
          </div>

          {/* Auto Fix Button if any violations exist */}
          {auditResult.violations.length > 0 && (
            <button
              onClick={handleAutoFix}
              className="w-full py-2 px-3 rounded-2xl bg-azure-600 hover:bg-azure-500 text-white font-bold text-xs shadow-md shadow-azure-600/25 transition-all flex items-center justify-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Auto-Resolve ({auditResult.violations.length} Issues)</span>
            </button>
          )}

          {/* Violations List */}
          <div className="space-y-2">
            {auditResult.violations.length === 0 ? (
              <div className="p-4 rounded-2xl bg-mint-50/70 border border-mint-200 text-center space-y-1 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-mint-600 mx-auto" />
                <div className="text-xs font-bold text-mint-800">Perfect Architectural Flow</div>
                <div className="text-[10px] text-mint-700/80">Door sweep and ≥75cm walking corridors are fully clear.</div>
              </div>
            ) : (
              auditResult.violations.map((v) => (
                <div
                  key={v.id}
                  className={`p-3 rounded-2xl border text-xs space-y-1 shadow-xs ${
                    v.severity === 'CRITICAL'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{v.title}</span>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/80 border border-stone-200">
                      {v.severity}
                    </span>
                  </div>
                  <p className="text-[10px] opacity-90 leading-tight">{v.description}</p>
                </div>
              ))
            )}
          </div>

          {/* Furniture Footprint & Cost Card in Selected Currency */}
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-2 text-xs shadow-xs">
            <div className="font-bold text-stone-800 flex items-center justify-between">
              <span>Layout Inventory</span>
              <span className="text-coral-600 font-mono font-bold">{furniture.length} items</span>
            </div>
            <div className="flex justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200">
              <span>Procurement ({curr.code}):</span>
              <strong className="text-mint-700 font-mono text-sm">{formatPrice(totalCostUSD)}</strong>
            </div>
          </div>
        </aside>
      </div>

      {/* AI Stylist Explanation Modal */}
      {isAiExplainerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-coral-500 to-sunshine-500 text-white flex items-center justify-center shadow-md shadow-coral-500/20">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-display">How the AI Stylist Operates</h3>
                  <p className="text-xs text-stone-500">Underlying developmental science & algorithmic pipeline</p>
                </div>
              </div>
              <button onClick={() => setIsAiExplainerOpen(false)} className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-stone-700">
              <div className="p-4 rounded-2xl bg-mint-50/60 border border-mint-200 space-y-2">
                <h4 className="font-bold text-mint-800 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-mint-600" />
                  <span>1. Child Developmental Milestone Parsing</span>
                </h4>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  When you input natural prompts (e.g. <em>"Montessori room for a 2-year-old with climbing mat"</em>), the engine extracts child developmental keywords and maps them to anthropometric growth stages (Montessori autonomy, Piaget pre-operational symbolic play, or Primary study habits).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-sunshine-50/60 border border-sunshine-200 space-y-2">
                <h4 className="font-bold text-sunshine-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sunshine-600" />
                  <span>2. 4-Zone Area Weighting Engine</span>
                </h4>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Automatically calculates square-meter footprint ratios for <strong>Active Play</strong>, <strong>Calm / Sensory Nook</strong>, <strong>Focus / Tabletop</strong>, and <strong>Sleep & Storage</strong> based on developmental age guardrails.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-azure-50/60 border border-azure-200 space-y-2">
                <h4 className="font-bold text-azure-800 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-azure-600" />
                  <span>3. Wall-Anchor Priority & Window Light Alignment</span>
                </h4>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Anchors the <strong>Calm/Sleep Zone</strong> opposite to the door for visual serenity upon entering, places the <strong>Focus Workstation</strong> perpendicular to window natural light to eliminate screen glare, and aligns <strong>Low Storage</strong> along the continuous wall.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-coral-50/60 border border-coral-200 space-y-2">
                <h4 className="font-bold text-coral-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-coral-600" />
                  <span>4. 75cm Minkowski Clearance & Arc Sweep Safety</span>
                </h4>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Guarantees that every generated piece maintains a minimum <strong>75 cm clear circulation corridor</strong> and verifies that the door swing sector is 100% unobstructed for emergency egress and toddler safety.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setIsAiExplainerOpen(false)}
                className="px-5 py-2 rounded-2xl bg-gradient-to-r from-coral-500 to-sunshine-500 text-white font-bold text-xs shadow-md shadow-coral-500/20"
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
