export type AgeBracket = '0-2' | '3-5' | '6-8' | '9-12';

export type ZoneType = 'active' | 'calm' | 'focus' | 'storage';

export type WallSide = 'top' | 'right' | 'bottom' | 'left';

export type UnitType = 'cm' | 'm' | 'ft';

export type DoorType = 'inward' | 'outward' | 'sliding' | 'open_arch' | 'none';

export type CurrencyCode = 'INR' | 'USD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rateFromUSD: number;
  label: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', rateFromUSD: 83.5, label: 'INR (₹)' },
  USD: { code: 'USD', symbol: '$', rateFromUSD: 1.0, label: 'USD ($)' }
};

export interface Point {
  x: number; // in cm
  y: number; // in cm
}

export interface Box {
  id: string;
  name: string;
  category: 'bed' | 'desk' | 'chair' | 'storage' | 'shelf' | 'rug' | 'play_mat' | 'nook' | 'wardrobe' | 'bin' | 'custom';
  zone: ZoneType;
  x: number;      // top-left x in cm
  y: number;      // top-left y in cm
  width: number;  // dimension along x in cm (bounding width when rotation = 0)
  height: number; // dimension along y in cm (bounding height when rotation = 0)
  rotation: number; // in degrees (0, 90, 180, 270)
  shelfHeightCm?: number; // actual height of top reachable shelf
  depthCm?: number;
  color?: string;
  iconName?: string;
  priceEst?: number; // in USD base
  retailer?: string;
  lightingKelvin?: number; // e.g. 2700 for calm, 4000 for focus
  safetyNotes?: string;
  isLocked?: boolean;
}

export interface Door {
  id: string;
  wall: WallSide;
  positionOffset: number; // offset along the wall in cm from start
  leafWidth: number;      // door width / radius in cm (typically 80-90cm)
  hinge: Point;           // computed coordinate (x, y)
  startAngle: number;     // radians [0, 2pi)
  endAngle: number;       // radians [0, 2pi)
  swingType: DoorType;    // inward, outward, sliding, open_arch, none
  hasDoor: boolean;       // whether door exists
}

export interface Window {
  id: string;
  wall: WallSide;
  positionOffset: number; // offset in cm from start of wall
  width: number;          // window width in cm
  hasWindow: boolean;
  orientation?: 'North' | 'South' | 'East' | 'West';
}

export interface Obstacle {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'radiator' | 'column' | 'closet_niche';
}

export interface RoomConfig {
  name: string;
  childName: string;
  itsId: string;         // Child / Member ITS52 (8 digits)
  mauze: string;         // Mauze / City / Markaz
  jamiat: string;        // Jamiat / Council
  hofIts: string;        // Head of Family ITS
  hofName: string;       // Head of Family Name
  ageBracket: AgeBracket;
  exactAgeYears: number;
  widthCm: number;       // e.g. 360 cm (3.6m)
  lengthCm: number;      // e.g. 420 cm (4.2m)
  hasDoor: boolean;      // toggle whether room has a physical door
  doorType: DoorType;    // inward, outward, sliding, open_arch, none
  doorWall: WallSide;
  doorOffsetCm: number;
  doorLeafWidthCm: number;
  hasWindow: boolean;
  windowWall: WallSide;
  windowOffsetCm: number;
  windowWidthCm: number;
  ceilingHeightCm: number;
  colorScheme: 'warm_neutral' | 'earthy_sage' | 'soft_terracotta' | 'calm_indigo';
  layoutGoal?: 'montessori_autonomy' | 'sensory_calm' | 'study_focus' | 'active_movement';
}

export interface Violation {
  id: string;
  type: 'DOOR_BLOCKED' | 'CORRIDOR_TOO_NARROW' | 'SHELF_TOO_HIGH' | 'WINDOW_BLOCKED' | 'OUT_OF_BOUNDS' | 'PLAY_PERIMETER_CROWDED';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  involvedIds: string[];
  suggestedFix?: string;
}

export interface DistanceLine {
  itemAId: string;
  itemBId: string;
  itemAName: string;
  itemBName: string;
  p1: Point;
  p2: Point;
  distanceCm: number;
  isViolation: boolean; // < 75cm
}

export interface ZoneAllocation {
  zone: ZoneType;
  label: string;
  color: string;
  bgLight: string;
  targetPercent: number;
  targetAreaSqM: number;
  actualPlacedAreaSqM: number;
  description: string;
  milestoneRationale: string;
}

export interface DevelopmentalMilestone {
  ageBracket: AgeBracket;
  stageTitle: string;
  primaryFocus: string;
  allocations: {
    active: number;
    calm: number;
    focus: number;
    storage: number;
  };
  ergonomicLimits: {
    maxShelfHeightCm: number;
    maxShelfDepthCm: number;
    recommendedDeskHeightCm: number;
    recommendedChairHeightCm: number;
    clearanceCorridorCm: number;
    playPerimeterClearanceCm: number;
  };
  lightingGuidance: {
    ambientKelvin: number;
    taskKelvin: number;
    nightKelvin: number;
    notes: string;
  };
  keyDevelopmentalGoals: string[];
  sensoryColorPalette: {
    name: string;
    hex: string;
    accent: string;
    description: string;
  }[];
}
