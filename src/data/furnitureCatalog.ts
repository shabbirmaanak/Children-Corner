import { Box, AgeBracket, DevelopmentalMilestone } from '../types/index.ts';

export interface CatalogItem extends Omit<Box, 'id' | 'x' | 'y'> {
  catalogId: string;
  minAge: AgeBracket;
  maxAge: AgeBracket;
  description: string;
  imageThumbnail?: string;
  dimensionsText: string;
  certification: string;
}

export const FURNITURE_CATALOG: CatalogItem[] = [
  // --- SLEEP & COMFORT ---
  {
    catalogId: 'cat-bed-montessori',
    name: 'Montessori Low Floor Bed Frame',
    category: 'bed',
    zone: 'storage',
    width: 165,
    height: 95,
    rotation: 0,
    minAge: '0-2',
    maxAge: '3-5',
    shelfHeightCm: 25,
    color: '#f97316',
    priceEst: 210,
    retailer: 'Sprout Kids / IKEA Sniglar',
    lightingKelvin: 2700,
    description: 'Floor-level solid birch frame enabling infant/toddler to get in and out independently with zero fall hazard.',
    dimensionsText: '165 × 95 × 25 cm',
    certification: 'Greenguard Gold & FSC Certified Birch',
    safetyNotes: 'Place away from blind cords and electrical outlets.'
  },
  {
    catalogId: 'cat-bed-toddler-convertible',
    name: 'Convertible Low Toddler Bed',
    category: 'bed',
    zone: 'storage',
    width: 155,
    height: 85,
    rotation: 0,
    minAge: '3-5',
    maxAge: '6-8',
    shelfHeightCm: 35,
    color: '#f97316',
    priceEst: 249,
    retailer: 'Oeuf / IKEA Sundvik',
    lightingKelvin: 2700,
    description: 'Low-slung bed with removable toddler safety side rail and smooth rounded corners.',
    dimensionsText: '155 × 85 × 35 cm',
    certification: 'ASTM F1821 Certified Child Safe',
    safetyNotes: 'Rounded corners, non-toxic water-based finish.'
  },
  {
    catalogId: 'cat-bed-twin-storage',
    name: 'Twin Bed with Underbed Storage Drawers',
    category: 'bed',
    zone: 'storage',
    width: 205,
    height: 105,
    rotation: 0,
    minAge: '6-8',
    maxAge: '9-12',
    shelfHeightCm: 50,
    color: '#f97316',
    priceEst: 349,
    retailer: 'IKEA Nordli / Pottery Barn Kids',
    lightingKelvin: 2700,
    description: 'Full single twin bed with 3 soft-closing lower drawers for accessible toy or bed linen storage.',
    dimensionsText: '205 × 105 × 50 cm',
    certification: 'CPSC & ASTM Safety Tested',
    safetyNotes: 'Integrated soft-close drawer dampeners to prevent finger pinching.'
  },

  // --- CALM & SENSORY NOOK ---
  {
    catalogId: 'cat-nook-teepee',
    name: 'Organic Canvas Reading Teepee & Bolster',
    category: 'nook',
    zone: 'calm',
    width: 95,
    height: 95,
    rotation: 0,
    minAge: '0-2',
    maxAge: '6-8',
    color: '#6366f1',
    priceEst: 95,
    retailer: 'Crate & Kids / Teamson',
    lightingKelvin: 2700,
    description: 'Cozy retreat tent creating a safe acoustic micro-haven for emotional regulation and calm reading.',
    dimensionsText: '95 × 95 × 130 cm',
    certification: 'GOTS Certified Organic Unbleached Cotton',
    safetyNotes: 'Secure wooden poles with non-slip silicone feet.'
  },
  {
    catalogId: 'cat-nook-crashpad',
    name: 'Sensory Crash Pad & Floor Cushion',
    category: 'nook',
    zone: 'calm',
    width: 110,
    height: 80,
    rotation: 0,
    minAge: '0-2',
    maxAge: '9-12',
    color: '#6366f1',
    priceEst: 110,
    retailer: 'Wesco Sensory / Foamnasium',
    lightingKelvin: 2700,
    description: 'High-density sensory foam pad for proprioceptive decompression and relaxing story time.',
    dimensionsText: '110 × 80 × 20 cm',
    certification: 'CertiPUR-US Foam & Wipe-Clean Vinyl',
    safetyNotes: 'Flame-retardant free, heavy-duty double stitching.'
  },
  {
    catalogId: 'cat-nook-beanbag',
    name: 'Ergonomic Acoustic Beanbag Chair',
    category: 'nook',
    zone: 'calm',
    width: 85,
    height: 85,
    rotation: 0,
    minAge: '6-8',
    maxAge: '9-12',
    color: '#6366f1',
    priceEst: 125,
    retailer: 'Fatboy Junior / Big Joe',
    lightingKelvin: 2700,
    description: 'Conforming supportive beanbag with water-resistant, tactile corduroy cover.',
    dimensionsText: '85 × 85 × 65 cm',
    certification: 'OEKO-TEX Standard 100',
    safetyNotes: 'Child-proof lock zipper.'
  },

  // --- FOCUS & TABLETOP ---
  {
    catalogId: 'cat-desk-flisat',
    name: 'Toddler Sensory Craft Table + 2 Stools',
    category: 'desk',
    zone: 'focus',
    width: 90,
    height: 60,
    rotation: 0,
    minAge: '3-5',
    maxAge: '3-5',
    shelfHeightCm: 48,
    color: '#10b981',
    priceEst: 89,
    retailer: 'IKEA Flisat',
    lightingKelvin: 4000,
    description: 'Dual sensory bin lids with recessed craft trays, optimized for standing or toddler stool seating (48cm top).',
    dimensionsText: '90 × 60 × 48 cm',
    certification: 'FSC Solid Pine',
    safetyNotes: 'Removable bin covers with rounded fingertip cutouts.'
  },
  {
    catalogId: 'cat-desk-adjustable',
    name: 'Height-Adjustable Primary Study Desk',
    category: 'desk',
    zone: 'focus',
    width: 110,
    height: 65,
    rotation: 0,
    minAge: '6-8',
    maxAge: '9-12',
    shelfHeightCm: 62,
    color: '#10b981',
    priceEst: 185,
    retailer: 'IKEA Pahl / Moll Champion',
    lightingKelvin: 4000,
    description: 'Grows with child with 3 height settings (59cm, 66cm, 72cm) and cable management tray.',
    dimensionsText: '110 × 65 × 59–72 cm',
    certification: 'BIFMA / EN 1729 Ergonomic Standard',
    safetyNotes: 'Anti-tilt desk frame, cable management conduit.'
  },
  {
    catalogId: 'cat-desk-teen',
    name: 'Ergonomic Workstation with Book Hanger',
    category: 'desk',
    zone: 'focus',
    width: 125,
    height: 65,
    rotation: 0,
    minAge: '9-12',
    maxAge: '9-12',
    shelfHeightCm: 75,
    color: '#10b981',
    priceEst: 275,
    retailer: 'Autonomous SmartDesk Junior',
    lightingKelvin: 4000,
    description: 'Electric sit-to-stand junior desk supporting alternating postural dynamics for focused homework.',
    dimensionsText: '125 × 65 × 60–100 cm',
    certification: 'UL 962 & ANSI/BIFMA Compliant',
    safetyNotes: 'Anti-collision gyro sensor during motor adjustment.'
  },

  // --- ACCESSIBLE STORAGE & SHELVING ---
  {
    catalogId: 'cat-shelf-low-rotation',
    name: 'Montessori Low 2-Tier Shelf (Max 60cm)',
    category: 'shelf',
    zone: 'storage',
    width: 120,
    height: 30,
    rotation: 0,
    minAge: '0-2',
    maxAge: '3-5',
    shelfHeightCm: 55,
    depthCm: 28,
    color: '#f97316',
    priceEst: 115,
    retailer: 'Sprout Kids / Woodjoy',
    lightingKelvin: 3000,
    description: 'Strict 28cm shelf depth to prevent item hoarding; keeps 6–8 curated developmental toys accessible.',
    dimensionsText: '120 × 30 × 55 cm',
    certification: 'TSCA Title VI Formaldehyde Free',
    safetyNotes: 'Anchoring brackets included. Tip-resistant wide base.'
  },
  {
    catalogId: 'cat-shelf-cubby-trofast',
    name: '3-Tier Accessible Cubby Storage Unit',
    category: 'shelf',
    zone: 'storage',
    width: 135,
    height: 35,
    rotation: 0,
    minAge: '3-5',
    maxAge: '6-8',
    shelfHeightCm: 88,
    depthCm: 32,
    color: '#f97316',
    priceEst: 140,
    retailer: 'IKEA Trofast',
    lightingKelvin: 3000,
    description: 'Slidable lightweight bins at child eye level, allowing easy self-cleanup and visual categorization.',
    dimensionsText: '135 × 35 × 88 cm',
    certification: 'EN 71-3 Safe Paint Finish',
    safetyNotes: 'Wall anchor strapping required.'
  },
  {
    catalogId: 'cat-shelf-bookcase-forward',
    name: 'Front-Facing Book Ledge & Lower Cubbies',
    category: 'shelf',
    zone: 'storage',
    width: 90,
    height: 30,
    rotation: 0,
    minAge: '0-2',
    maxAge: '6-8',
    shelfHeightCm: 85,
    depthCm: 26,
    color: '#f97316',
    priceEst: 95,
    retailer: 'Tidy Books / KidKraft',
    lightingKelvin: 3000,
    description: 'Displays book covers forward to stimulate pre-literacy interest rather than intimidating book spines.',
    dimensionsText: '90 × 30 × 85 cm',
    certification: 'BS EN 14749 Domestic Storage',
    safetyNotes: 'Slim depth prevents tipping; wall-fixed.'
  },
  {
    catalogId: 'cat-wardrobe-montessori',
    name: 'Open Montessori Wardrobe & Dress-Up Bar',
    category: 'wardrobe',
    zone: 'storage',
    width: 80,
    height: 40,
    rotation: 0,
    minAge: '3-5',
    maxAge: '6-8',
    shelfHeightCm: 105,
    depthCm: 38,
    color: '#f97316',
    priceEst: 130,
    retailer: 'Guidecraft / Piccalio',
    lightingKelvin: 3000,
    description: 'Low clothes rail and 2 shoe cubbies designed so toddlers can select tomorrow’s outfit independently.',
    dimensionsText: '80 × 40 × 105 cm',
    certification: 'Greenguard Gold Certified',
    safetyNotes: 'Rounded dowel rail, bottom heavy anti-sway base.'
  },

  // --- ACTIVE PLAY RUGS & FLOOR MATS ---
  {
    catalogId: 'cat-rug-organic-circle',
    name: 'Circular Natural Wool Play Rug (Ø 150cm)',
    category: 'rug',
    zone: 'active',
    width: 150,
    height: 150,
    rotation: 0,
    minAge: '0-2',
    maxAge: '9-12',
    color: '#f59e0b',
    priceEst: 165,
    retailer: 'Lorena Canals / Pottery Barn Kids',
    description: '100% natural organic cotton washable rug providing thermal protection and tactile floor comfort.',
    dimensionsText: '150 × 150 cm (Circular)',
    certification: 'OEKO-TEX & Non-Slip Backing',
    safetyNotes: 'Includes non-slip rubber underlay pad.'
  },
  {
    catalogId: 'cat-rug-geometric-large',
    name: 'Acoustic Sound-Dampening Play Rug (160x230)',
    category: 'rug',
    zone: 'active',
    width: 230,
    height: 160,
    rotation: 0,
    minAge: '3-5',
    maxAge: '9-12',
    color: '#f59e0b',
    priceEst: 195,
    retailer: 'Ruggable Machine Washable',
    description: 'Low-pile non-shedding rug designed to define the active play territory and absorb impact noise.',
    dimensionsText: '230 × 160 cm',
    certification: 'CRI Green Label Plus',
    safetyNotes: 'Stain resistant, pet and liquid repellent.'
  }
];

export const DEVELOPMENTAL_RULES: Record<AgeBracket, DevelopmentalMilestone> = {
  '0-2': {
    ageBracket: '0-2',
    stageTitle: 'Infant / Toddler Discovery Stage (0 – 2 yrs)',
    primaryFocus: 'Gross motor navigation, tactile exploration, crawling perimeter & sleep independence',
    allocations: {
      active: 50,
      calm: 20,
      focus: 0,
      storage: 30
    },
    ergonomicLimits: {
      maxShelfHeightCm: 60,
      maxShelfDepthCm: 30,
      recommendedDeskHeightCm: 0,
      recommendedChairHeightCm: 0,
      clearanceCorridorCm: 75,
      playPerimeterClearanceCm: 90
    },
    lightingGuidance: {
      ambientKelvin: 2700,
      taskKelvin: 3000,
      nightKelvin: 2200,
      notes: 'Diffuse warm lighting without direct overhead glare. Use shatterproof low-mounted wall sconces.'
    },
    keyDevelopmentalGoals: [
      'Unobstructed floor perimeter for rolling, cruising, and independent walking',
      'Montessori floor bed for zero-fall hazard and autonomous morning exploration',
      'Low 2-tier open toy rotation shelf (capped under 60 cm) displaying 6-8 items',
      'Acrylic shatterproof floor mirror with pull-up wooden handrail',
      'No tabletop desk needed; focus tasks are executed via floor manipulation'
    ],
    sensoryColorPalette: [
      { name: 'Warm Oat Neutral', hex: '#F3EFE0', accent: '#D8A48F', description: 'Calming base reducing sensory overload' },
      { name: 'Soft Sage Earth', hex: '#E2E8D5', accent: '#8F9E8B', description: 'Restful natural hue fostering relaxation' },
      { name: 'Muted Honey Gold', hex: '#F8E9C9', accent: '#D99B26', description: 'Stimulates curiosity without hyperactivity' }
    ]
  },
  '3-5': {
    ageBracket: '3-5',
    stageTitle: 'Preschool Autonomy & Symbolic Play Stage (3 – 5 yrs)',
    primaryFocus: 'Pre-literacy, symbolic roleplay, fine-motor crafts & independent self-care routines',
    allocations: {
      active: 35,
      calm: 20,
      focus: 15,
      storage: 30
    },
    ergonomicLimits: {
      maxShelfHeightCm: 90,
      maxShelfDepthCm: 32,
      recommendedDeskHeightCm: 48,
      recommendedChairHeightCm: 26,
      clearanceCorridorCm: 75,
      playPerimeterClearanceCm: 90
    },
    lightingGuidance: {
      ambientKelvin: 3000,
      taskKelvin: 4000,
      nightKelvin: 2400,
      notes: 'Neutral task light at craft station with warm dimmable reading nook fixture.'
    },
    keyDevelopmentalGoals: [
      'Dedicated craft/sensory table (45–50 cm height) for cutting, playdough & drawing',
      'Front-facing book display stimulating spontaneous story selection',
      'Accessible dressing wardrobe with low hanger bar for dressing autonomy',
      'Reading canopy / teepee nook for self-directed emotional decompression',
      'Open floor zone for block construction and imaginative pretend games'
    ],
    sensoryColorPalette: [
      { name: 'Earthy Terracotta', hex: '#F0D5C9', accent: '#C86D51', description: 'Grounding warmth for emotional security' },
      { name: 'Calm Dusty Blue', hex: '#D8E2DC', accent: '#6B8E8F', description: 'Cognitive focus & soothing ambiance' },
      { name: 'Pale Amber Ochre', hex: '#F5E6CA', accent: '#C68B59', description: 'Creative energy for craft tabletop' }
    ]
  },
  '6-8': {
    ageBracket: '6-8',
    stageTitle: 'Primary School / Focus Habit Stage (6 – 8 yrs)',
    primaryFocus: 'Homework stamina, fine-motor dexterity, reading endurance & organized categorization',
    allocations: {
      active: 25,
      calm: 15,
      focus: 35,
      storage: 25
    },
    ergonomicLimits: {
      maxShelfHeightCm: 130,
      maxShelfDepthCm: 35,
      recommendedDeskHeightCm: 62,
      recommendedChairHeightCm: 35,
      clearanceCorridorCm: 75,
      playPerimeterClearanceCm: 90
    },
    lightingGuidance: {
      ambientKelvin: 3500,
      taskKelvin: 4000,
      nightKelvin: 2700,
      notes: 'High-CRI (Ra>90) flicker-free 4000K desk lamp perpendicular to dominant hand to eliminate writing shadow.'
    },
    keyDevelopmentalGoals: [
      'Ergonomic adjustable desk (58–65 cm) aligned perpendicular to window light',
      'Dedicated building zone for complex Lego sets and science experiments',
      'Quiet acoustic reading corner with beanbag and task lamp',
      'Modular vertical storage with labeled bins for school supplies and hobby gear',
      'Twin storage bed with integrated linen drawers'
    ],
    sensoryColorPalette: [
      { name: 'Nordic Forest Green', hex: '#D5E0D5', accent: '#4E6E58', description: 'Enhances reading endurance and visual calm' },
      { name: 'Subtle Slate Indigo', hex: '#DCE2E9', accent: '#4A627A', description: 'Deep study concentration and structure' },
      { name: 'Warm Birch Neutral', hex: '#EDE6D6', accent: '#9C7A4A', description: 'Balanced timeless background' }
    ]
  },
  '9-12': {
    ageBracket: '9-12',
    stageTitle: 'Tween Autonomy & Identity Stage (9 – 12 yrs)',
    primaryFocus: 'Deep cognitive study workstation, social boundary, privacy nook & modular storage',
    allocations: {
      active: 15,
      calm: 15,
      focus: 45,
      storage: 25
    },
    ergonomicLimits: {
      maxShelfHeightCm: 160,
      maxShelfDepthCm: 40,
      recommendedDeskHeightCm: 72,
      recommendedChairHeightCm: 42,
      clearanceCorridorCm: 75,
      playPerimeterClearanceCm: 90
    },
    lightingGuidance: {
      ambientKelvin: 3500,
      taskKelvin: 4000,
      nightKelvin: 2700,
      notes: 'Multizone dimmable smart LED tracks with focused workstation task lighting and accent cove lights.'
    },
    keyDevelopmentalGoals: [
      'Full adult-proportioned ergonomic workstation (70–75 cm) with laptop cable conduit',
      'Private retreat lounge chair / beanbag for reading and friend conversations',
      'Vertical multi-tier shelving with closed cabinetry for personal privacy and hobby equipment',
      'Flexible floor seating area replacing open toy footprint',
      'Defined personal aesthetic expression through modular pinboards and mood lighting'
    ],
    sensoryColorPalette: [
      { name: 'Modern Sage Taupe', hex: '#E3E0D6', accent: '#5F6B58', description: 'Sophisticated and calming tween aesthetic' },
      { name: 'Deep Denim Navy', hex: '#D5DDE5', accent: '#2F4858', description: 'Executive focus and maturity' },
      { name: 'Warm Charcoal Minimal', hex: '#E5E4E2', accent: '#3E424B', description: 'Crisp contemporary architecture feel' }
    ]
  }
};
