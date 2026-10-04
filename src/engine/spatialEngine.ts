import { Box, Door, Point, Violation, DistanceLine, AgeBracket, RoomConfig, ZoneAllocation, WallSide } from '../types/index.ts';

// Normalize angle into [0, 2pi)
export function normalizeAngle(rad: number): number {
  let angle = rad % (2 * Math.PI);
  return angle < 0 ? angle + 2 * Math.PI : angle;
}

// Check if an angle lies within the directed sweep [start, end]
export function isAngleInSector(angle: number, start: number, end: number): boolean {
  const normA = normalizeAngle(angle);
  const normS = normalizeAngle(start);
  const normE = normalizeAngle(end);

  if (normS <= normE) {
    return normA >= normS && normA <= normE;
  }
  // Sector spans across 0 / 2pi boundary
  return normA >= normS || normA <= normE;
}

// Get effective oriented bounding box in room coordinate space
export function getOrientedBox(box: Box): { xMin: number; xMax: number; yMin: number; yMax: number; w: number; h: number } {
  const isRotated = box.rotation === 90 || box.rotation === 270;
  const w = isRotated ? box.height : box.width;
  const h = isRotated ? box.width : box.height;
  return {
    xMin: box.x,
    xMax: box.x + w,
    yMin: box.y,
    yMax: box.y + h,
    w,
    h
  };
}

/**
 * 1. Validate Door Swing against an AABB / Oriented Furniture piece
 */
export function checkDoorSwingCollision(door: Door, box: Box): boolean {
  // Rugs are flat floor coverings, so door swing over rugs is generally acceptable unless thick mat
  if (box.category === 'rug') return false;

  const ob = getOrientedBox(box);
  const xMin = ob.xMin;
  const xMax = ob.xMax;
  const yMin = ob.yMin;
  const yMax = ob.yMax;

  // 1. If hinge itself is inside the box -> Immediate collision
  if (door.hinge.x >= xMin && door.hinge.x <= xMax &&
      door.hinge.y >= yMin && door.hinge.y <= yMax) {
    return true;
  }

  // 2. Closest point on AABB to hinge point
  const clampedX = Math.max(xMin, Math.min(door.hinge.x, xMax));
  const clampedY = Math.max(yMin, Math.min(door.hinge.y, yMax));

  const dx = clampedX - door.hinge.x;
  const dy = clampedY - door.hinge.y;
  const distSq = dx * dx + dy * dy;

  // Outside outer radius -> No collision possible
  if (distSq > door.leafWidth * door.leafWidth) {
    return false;
  }

  // 3. Angular test on closest point
  const angleToClosest = Math.atan2(dy, dx);
  if (isAngleInSector(angleToClosest, door.startAngle, door.endAngle)) {
    return true;
  }

  // 4. Boundary test: check the 4 corners of the AABB
  const corners: Point[] = [
    { x: xMin, y: yMin },
    { x: xMax, y: yMin },
    { x: xMax, y: yMax },
    { x: xMin, y: yMax }
  ];

  for (const corner of corners) {
    const cdx = corner.x - door.hinge.x;
    const cdy = corner.y - door.hinge.y;
    if (cdx * cdx + cdy * cdy <= door.leafWidth * door.leafWidth) {
      if (isAngleInSector(Math.atan2(cdy, cdx), door.startAngle, door.endAngle)) {
        return true;
      }
    }
  }

  // 5. Line segment tests for edges of the box intersecting sector arc / radial rays
  return false;
}

/**
 * 2. Calculate Cartesian distance and closest connection points between two disjoint boxes
 */
export function calculateBoxDistanceWithPoints(a: Box, b: Box): {
  distance: number;
  p1: Point;
  p2: Point;
} {
  const obA = getOrientedBox(a);
  const obB = getOrientedBox(b);

  const left = obB.xMin - obA.xMax;
  const right = obA.xMin - obB.xMax;
  const top = obB.yMin - obA.yMax;
  const bottom = obA.yMin - obB.yMax;

  const deltaX = Math.max(0, left, right);
  const deltaY = Math.max(0, top, bottom);

  const distance = Math.hypot(deltaX, deltaY);

  // Compute closest connection points between the two rectangles
  let p1x: number;
  let p2x: number;

  if (obA.xMax < obB.xMin) {
    p1x = obA.xMax;
    p2x = obB.xMin;
  } else if (obB.xMax < obA.xMin) {
    p1x = obA.xMin;
    p2x = obB.xMax;
  } else {
    // Overlapping in X
    const overlapMinX = Math.max(obA.xMin, obB.xMin);
    const overlapMaxX = Math.min(obA.xMax, obB.xMax);
    const midX = (overlapMinX + overlapMaxX) / 2;
    p1x = midX;
    p2x = midX;
  }

  let p1y: number;
  let p2y: number;

  if (obA.yMax < obB.yMin) {
    p1y = obA.yMax;
    p2y = obB.yMin;
  } else if (obB.yMax < obA.yMin) {
    p1y = obA.yMin;
    p2y = obB.yMax;
  } else {
    // Overlapping in Y
    const overlapMinY = Math.max(obA.yMin, obB.yMin);
    const overlapMaxY = Math.min(obA.yMax, obB.yMax);
    const midY = (overlapMinY + overlapMaxY) / 2;
    p1y = midY;
    p2y = midY;
  }

  return {
    distance,
    p1: { x: p1x, y: p1y },
    p2: { x: p2x, y: p2y }
  };
}

export function calculateAABBDistance(a: Box, b: Box): number {
  return calculateBoxDistanceWithPoints(a, b).distance;
}

/**
 * 3. Master Room Spatial & Ergonomic Audit
 */
export function auditRoomCirculation(
  doors: Door[],
  furniture: Box[],
  roomConfig: RoomConfig,
  requiredClearanceCm = 75
): {
  violations: Violation[];
  distanceLines: DistanceLine[];
  score: number;
} {
  const violations: Violation[] = [];
  const distanceLines: DistanceLine[] = [];

  // Ergonomic Shelf Height Caps by Age Bracket
  const maxShelfHeightMap: Record<AgeBracket, number> = {
    '0-2': 60,
    '3-5': 90,
    '6-8': 130,
    '9-12': 160
  };
  const maxAllowedShelfHeight = maxShelfHeightMap[roomConfig.ageBracket];

  // Pass 1: Door Sweeps (CRITICAL)
  for (const door of doors) {
    for (const item of furniture) {
      if (checkDoorSwingCollision(door, item)) {
        violations.push({
          id: `door-blocked-${door.id}-${item.id}`,
          type: 'DOOR_BLOCKED',
          severity: 'CRITICAL',
          title: `Entry Door Obstructed`,
          description: `Door swing radius (${door.leafWidth} cm) collides with "${item.name}". Door must open completely unhindered for fire safety and daily circulation.`,
          involvedIds: [door.id, item.id],
          suggestedFix: `Shift "${item.name}" at least ${door.leafWidth + 15} cm away from the door hinge wall corner.`
        });
      }
    }
  }

  // Pass 2: Out of bounds check & Wall collisions
  for (const item of furniture) {
    const ob = getOrientedBox(item);
    if (ob.xMin < 0 || ob.yMin < 0 || ob.xMax > roomConfig.widthCm || ob.yMax > roomConfig.lengthCm) {
      violations.push({
        id: `out-of-bounds-${item.id}`,
        type: 'OUT_OF_BOUNDS',
        severity: 'CRITICAL',
        title: `Item Outside Room Boundary`,
        description: `"${item.name}" extends beyond the room perimeter walls.`,
        involvedIds: [item.id],
        suggestedFix: `Drag "${item.name}" inside the room boundaries.`
      });
    }
  }

  // Pass 3: Inter-furniture Circulation Corridors (O(N^2) pairwise)
  // Ignore rug-to-furniture clearance since rugs lie on the floor
  const solidFurniture = furniture.filter(f => f.category !== 'rug' && f.category !== 'play_mat');

  for (let i = 0; i < solidFurniture.length; i++) {
    for (let j = i + 1; j < solidFurniture.length; j++) {
      const itemA = solidFurniture[i];
      const itemB = solidFurniture[j];
      const { distance, p1, p2 } = calculateBoxDistanceWithPoints(itemA, itemB);

      // Only draw distance visual lines if items are reasonably close (under 130 cm)
      if (distance < 130) {
        distanceLines.push({
          itemAId: itemA.id,
          itemBId: itemB.id,
          itemAName: itemA.name,
          itemBName: itemB.name,
          p1,
          p2,
          distanceCm: Math.round(distance),
          isViolation: distance < requiredClearanceCm
        });
      }

      if (distance < requiredClearanceCm) {
        // Check if they are actually overlapping or just tight
        const isOverlapping = distance === 0;
        violations.push({
          id: `corridor-${itemA.id}-${itemB.id}`,
          type: 'CORRIDOR_TOO_NARROW',
          severity: isOverlapping ? 'CRITICAL' : 'WARNING',
          title: isOverlapping ? `Furniture Overlap Detected` : `Tight Corridor Bottleneck`,
          description: isOverlapping 
            ? `"${itemA.name}" and "${itemB.name}" physically overlap on the floor.`
            : `Walkway between "${itemA.name}" and "${itemB.name}" is ${Math.round(distance)} cm (under ${requiredClearanceCm} cm minimum child-clearance).`,
          involvedIds: [itemA.id, itemB.id],
          suggestedFix: `Increase gap between "${itemA.name}" and "${itemB.name}" to at least 75 cm to prevent toddler bumping and permit adult access.`
        });
      }
    }
  }

  // Pass 4: Shelf Height & Reachability Ergonomics
  for (const item of furniture) {
    if (item.shelfHeightCm && item.shelfHeightCm > maxAllowedShelfHeight) {
      violations.push({
        id: `shelf-height-${item.id}`,
        type: 'SHELF_TOO_HIGH',
        severity: 'WARNING',
        title: `Shelf Exceeds Child Ergonomic Reach`,
        description: `"${item.name}" top shelf (${item.shelfHeightCm} cm) exceeds recommended height (${maxAllowedShelfHeight} cm) for age ${roomConfig.ageBracket}. Leads to climbing hazards or inaccessible materials.`,
        involvedIds: [item.id],
        suggestedFix: `Use low-tier storage capped at ${maxAllowedShelfHeight} cm, or reserve upper levels solely for parent-managed item rotation.`
      });
    }

    // Shelf Depth check (25cm - 30cm recommended)
    if (item.category === 'shelf' && item.depthCm && item.depthCm > 35) {
      violations.push({
        id: `shelf-depth-${item.id}`,
        type: 'SHELF_TOO_HIGH',
        severity: 'INFO',
        title: `Deep Shelf May Cause Clutter`,
        description: `"${item.name}" depth is ${item.depthCm} cm. Montessori ergonomic standard is 25–30 cm to prevent double-row item hoarding and foster visual calm.`,
        involvedIds: [item.id],
        suggestedFix: `Choose forward-facing display or 28cm book ledges.`
      });
    }
  }

  // Calculate overall safety & ergonomic score (0 to 100)
  let score = 100;
  for (const v of violations) {
    if (v.severity === 'CRITICAL') score -= 25;
    else if (v.severity === 'WARNING') score -= 10;
    else if (v.severity === 'INFO') score -= 4;
  }
  score = Math.max(0, Math.min(100, score));

  return { violations, distanceLines, score };
}

/**
 * 4. Helper to calculate Door Hinge and Swing Angles from Room Wall & Offset
 */
export function computeDoorGeometry(
  wall: 'top' | 'right' | 'bottom' | 'left',
  offsetCm: number,
  leafWidthCm: number,
  roomWidthCm: number,
  roomLengthCm: number
): Door {
  let hinge: Point = { x: 0, y: 0 };
  let startAngle = 0;
  let endAngle = Math.PI / 2;

  switch (wall) {
    case 'top':
      hinge = { x: offsetCm, y: 0 };
      // Opens into room downwards (y > 0): from 0 (right) to PI/2 (down)
      startAngle = 0;
      endAngle = Math.PI / 2;
      break;
    case 'bottom':
      hinge = { x: offsetCm, y: roomLengthCm };
      // Opens into room upwards (y < roomLength): from 3*PI/2 (up) to 2*PI (right)
      startAngle = 3 * Math.PI / 2;
      endAngle = 2 * Math.PI;
      break;
    case 'left':
      hinge = { x: 0, y: offsetCm };
      // Opens into room rightwards (x > 0): from 3*PI/2 (up) to 0 (right) or 0 to PI/2
      startAngle = 0;
      endAngle = Math.PI / 2;
      break;
    case 'right':
      hinge = { x: roomWidthCm, y: offsetCm };
      // Opens into room leftwards: from PI/2 (down) to PI (left)
      startAngle = Math.PI / 2;
      endAngle = Math.PI;
      break;
  }

  return {
    id: 'main-entry-door',
    wall,
    positionOffset: offsetCm,
    leafWidth: leafWidthCm,
    hinge,
    startAngle,
    endAngle,
    swingInward: true
  };
}

/**
 * 5. Compute Zone Allocations by Age Bracket
 */
export function computeZoneAllocations(
  ageBracket: AgeBracket,
  roomWidthCm: number,
  roomLengthCm: number
): ZoneAllocation[] {
  const netAreaSqM = (roomWidthCm * roomLengthCm) / 10000;

  const ratios: Record<AgeBracket, { active: number; calm: number; focus: number; storage: number }> = {
    '0-2': { active: 0.50, calm: 0.20, focus: 0.00, storage: 0.30 },
    '3-5': { active: 0.35, calm: 0.20, focus: 0.15, storage: 0.30 },
    '6-8': { active: 0.25, calm: 0.15, focus: 0.35, storage: 0.25 },
    '9-12': { active: 0.15, calm: 0.15, focus: 0.45, storage: 0.25 }
  };

  const currentRatio = ratios[ageBracket];

  return [
    {
      zone: 'active',
      label: 'Active Play Area',
      color: '#f59e0b',
      bgLight: 'rgba(245, 158, 11, 0.12)',
      targetPercent: Math.round(currentRatio.active * 100),
      targetAreaSqM: +(netAreaSqM * currentRatio.active).toFixed(2),
      actualPlacedAreaSqM: 0,
      description: ageBracket === '0-2' ? 'Open floor, soft tumbling mats, low pull-up bar & acrylic mirror' :
                   ageBracket === '3-5' ? 'Block building, open-ended pretend play, dress-up station' :
                   ageBracket === '6-8' ? 'Lego construction zone, dynamic floor movement mat' :
                   'Casual lounge seating, movement zone, social floor pillows',
      milestoneRationale: ageBracket === '0-2' ? 'Crucial for gross motor, crawling, rolling & tactile discovery' :
                          ageBracket === '3-5' ? 'Fosters symbolic imagination, spatial manipulation & autonomy' :
                          'Balances physical release with focused cognitive tasks'
    },
    {
      zone: 'calm',
      label: 'Calm / Sensory Nook',
      color: '#6366f1',
      bgLight: 'rgba(99, 102, 241, 0.12)',
      targetPercent: Math.round(currentRatio.calm * 100),
      targetAreaSqM: +(netAreaSqM * currentRatio.calm).toFixed(2),
      actualPlacedAreaSqM: 0,
      description: ageBracket === '0-2' ? 'Sensory cuddle nest, floor mattress, dimmable 2700K lamp' :
                   ageBracket === '3-5' ? 'Cozy reading teepee, weighted sensory cushion, forward book ledge' :
                   ageBracket === '6-8' ? 'Quiet reading nook, acoustic privacy drape, beanbag' :
                   'Personal decompression retreat, sensory pod chair, audio listening station',
      milestoneRationale: 'Provides emotional regulation & decompression away from high-stimulus zones'
    },
    {
      zone: 'focus',
      label: 'Focus / Tabletop',
      color: '#10b981',
      bgLight: 'rgba(16, 185, 129, 0.12)',
      targetPercent: Math.round(currentRatio.focus * 100),
      targetAreaSqM: +(netAreaSqM * currentRatio.focus).toFixed(2),
      actualPlacedAreaSqM: 0,
      description: ageBracket === '0-2' ? 'None (Focus is integrated into floor manipulation)' :
                   ageBracket === '3-5' ? 'Toddler craft & sensory table (45cm height), dual stools' :
                   ageBracket === '6-8' ? 'Ergonomic study desk (58-64cm height), task lamp (4000K), pencil station' :
                   'Full ergonomic teen workstation, dual-tier shelving, laptop space & study task lighting',
      milestoneRationale: ageBracket === '0-2' ? 'Not applicable for infants' :
                          ageBracket === '3-5' ? 'Pre-literacy, pincer grip practice & collaborative art' :
                          'Homework stamina, posture alignment & deep concentration habits'
    },
    {
      zone: 'storage',
      label: 'Sleep / Storage',
      color: '#f97316',
      bgLight: 'rgba(249, 115, 22, 0.12)',
      targetPercent: Math.round(currentRatio.storage * 100),
      targetAreaSqM: +(netAreaSqM * currentRatio.storage).toFixed(2),
      actualPlacedAreaSqM: 0,
      description: ageBracket === '0-2' ? 'Montessori floor bed (90x160cm) + low 2-tier open bins (<60cm)' :
                   ageBracket === '3-5' ? 'Low toddler bed + accessible cubbies & dressing wardrobe (<90cm)' :
                   ageBracket === '6-8' ? 'Twin bed with under-bed drawers + 3-tier modular shelf (<130cm)' :
                   'Full twin bed + vertical wardrobe, drawer chest & private keepsake locker',
      milestoneRationale: 'Builds self-dressing independence, routine predictability & tidy habits'
    }
  ];
}

/**
 * 6. Wall-Anchor Priority Algorithm (Deterministic Auto Layout Engine)
 * 
 * Rules:
 * Wall 1 (Opposite Entry Door): Anchor the Calm / Sleep Zone (Clear line of sight from door = calm order).
 * Wall with Natural Light (Window Wall): Anchor Focus / Creative Zone (Desk perpendicular to window).
 * Longest Continuous Wall: Anchor Low Modular Storage (toy rotation + forward-facing books).
 * Central Remaining Floor: Automatically allocated as Active Rug Zone.
 */
export function generateSmartAutoLayout(config: RoomConfig): Box[] {
  const { widthCm, lengthCm, doorWall, windowWall, ageBracket } = config;
  const items: Box[] = [];

  // Determine wall positions
  // Wall 1: Opposite to entry door
  const oppositeWallMap: Record<WallSide, WallSide> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left'
  };
  const sleepWall = oppositeWallMap[doorWall];

  // Helper to place item anchored to a wall
  // 1. Bed / Sleep & Calm Zone
  if (ageBracket === '0-2') {
    // Floor Bed (90 x 160 cm) placed along sleepWall
    if (sleepWall === 'bottom') {
      items.push({
        id: 'bed-1',
        name: 'Montessori Floor Bed (90x160)',
        category: 'bed',
        zone: 'storage',
        x: 30,
        y: lengthCm - 100,
        width: 160,
        height: 90,
        rotation: 0,
        shelfHeightCm: 25,
        color: '#f97316',
        priceEst: 189,
        retailer: 'IKEA / Sprout Kids',
        lightingKelvin: 2700,
        safetyNotes: 'Ultra-low zero-fall risk; promotes independent morning waking.'
      });
      // Soft Sensory Crash Mat / Nook next to bed
      items.push({
        id: 'nook-1',
        name: 'Sensory Reading Mat & Soft Bolsters',
        category: 'nook',
        zone: 'calm',
        x: 210,
        y: lengthCm - 90,
        width: 100,
        height: 80,
        rotation: 0,
        color: '#6366f1',
        priceEst: 75,
        retailer: 'Wesco / Foamnasium',
        lightingKelvin: 2700,
        safetyNotes: 'High-density foam, certified non-toxic OEKO-TEX.'
      });
    } else if (sleepWall === 'top') {
      items.push({
        id: 'bed-1',
        name: 'Montessori Floor Bed (90x160)',
        category: 'bed',
        zone: 'storage',
        x: 30,
        y: 20,
        width: 160,
        height: 90,
        rotation: 0,
        shelfHeightCm: 25,
        color: '#f97316',
        priceEst: 189,
        retailer: 'IKEA / Sprout Kids',
        lightingKelvin: 2700,
        safetyNotes: 'Ultra-low zero-fall risk.'
      });
      items.push({
        id: 'nook-1',
        name: 'Sensory Reading Mat & Soft Bolsters',
        category: 'nook',
        zone: 'calm',
        x: 210,
        y: 20,
        width: 100,
        height: 80,
        rotation: 0,
        color: '#6366f1',
        priceEst: 75,
        retailer: 'Wesco / Foamnasium',
        lightingKelvin: 2700
      });
    } else if (sleepWall === 'right') {
      items.push({
        id: 'bed-1',
        name: 'Montessori Floor Bed (90x160)',
        category: 'bed',
        zone: 'storage',
        x: widthCm - 100,
        y: 30,
        width: 90,
        height: 160,
        rotation: 0,
        shelfHeightCm: 25,
        color: '#f97316',
        priceEst: 189,
        retailer: 'IKEA / Sprout Kids',
        lightingKelvin: 2700
      });
      items.push({
        id: 'nook-1',
        name: 'Sensory Reading Mat & Soft Bolsters',
        category: 'nook',
        zone: 'calm',
        x: widthCm - 90,
        y: 210,
        width: 80,
        height: 100,
        rotation: 0,
        color: '#6366f1',
        priceEst: 75,
        retailer: 'Wesco / Foamnasium',
        lightingKelvin: 2700
      });
    } else { // left
      items.push({
        id: 'bed-1',
        name: 'Montessori Floor Bed (90x160)',
        category: 'bed',
        zone: 'storage',
        x: 20,
        y: 30,
        width: 90,
        height: 160,
        rotation: 0,
        shelfHeightCm: 25,
        color: '#f97316',
        priceEst: 189,
        retailer: 'IKEA / Sprout Kids',
        lightingKelvin: 2700
      });
      items.push({
        id: 'nook-1',
        name: 'Sensory Reading Mat & Soft Bolsters',
        category: 'nook',
        zone: 'calm',
        x: 20,
        y: 210,
        width: 80,
        height: 100,
        rotation: 0,
        color: '#6366f1',
        priceEst: 75,
        retailer: 'Wesco / Foamnasium',
        lightingKelvin: 2700
      });
    }
  } else if (ageBracket === '3-5') {
    // Toddler Bed + Teepee Reading Nook
    const bedX = sleepWall === 'right' ? widthCm - 95 : 30;
    const bedY = sleepWall === 'bottom' ? lengthCm - 150 : (sleepWall === 'top' ? 30 : 30);
    const isVertical = sleepWall === 'left' || sleepWall === 'right';
    
    items.push({
      id: 'bed-1',
      name: 'Low Toddler Bed (80x150)',
      category: 'bed',
      zone: 'storage',
      x: isVertical ? (sleepWall === 'right' ? widthCm - 95 : 20) : 30,
      y: isVertical ? 30 : (sleepWall === 'bottom' ? lengthCm - 95 : 20),
      width: isVertical ? 80 : 150,
      height: isVertical ? 150 : 80,
      rotation: 0,
      shelfHeightCm: 35,
      color: '#f97316',
      priceEst: 199,
      retailer: 'IKEA Sniglar / Oeuf',
      lightingKelvin: 2700,
      safetyNotes: 'Guardrail on wall side; rounded solid birch edges.'
    });

    // Cozy Canopy / Teepee Nook
    items.push({
      id: 'nook-1',
      name: 'Cozy Teepee Reading Nook & Pouf',
      category: 'nook',
      zone: 'calm',
      x: isVertical ? (sleepWall === 'right' ? widthCm - 100 : 20) : Math.min(widthCm - 110, 200),
      y: isVertical ? Math.min(lengthCm - 110, 200) : (sleepWall === 'bottom' ? lengthCm - 100 : 20),
      width: 90,
      height: 90,
      rotation: 0,
      color: '#6366f1',
      priceEst: 89,
      retailer: 'Crate & Kids / Pottery Barn',
      lightingKelvin: 2700
    });
  } else if (ageBracket === '6-8') {
    // Twin Bed (100x200) + Beanbag quiet reading corner
    const isVertical = sleepWall === 'left' || sleepWall === 'right';
    items.push({
      id: 'bed-1',
      name: 'Twin Storage Bed (100x200)',
      category: 'bed',
      zone: 'storage',
      x: isVertical ? (sleepWall === 'right' ? widthCm - 110 : 20) : 30,
      y: isVertical ? 30 : (sleepWall === 'bottom' ? lengthCm - 110 : 20),
      width: isVertical ? 100 : 200,
      height: isVertical ? 200 : 100,
      rotation: 0,
      shelfHeightCm: 50,
      color: '#f97316',
      priceEst: 320,
      retailer: 'IKEA Nordli',
      lightingKelvin: 2700
    });

    items.push({
      id: 'nook-1',
      name: 'Acoustic Beanbag Reading Nook',
      category: 'nook',
      zone: 'calm',
      x: isVertical ? (sleepWall === 'right' ? widthCm - 100 : 20) : Math.min(widthCm - 100, 250),
      y: isVertical ? Math.min(lengthCm - 100, 240) : (sleepWall === 'bottom' ? lengthCm - 90 : 20),
      width: 85,
      height: 85,
      rotation: 0,
      color: '#6366f1',
      priceEst: 110,
      retailer: 'Fatboy / Big Joe',
      lightingKelvin: 2700
    });
  } else {
    // 9-12 yrs: Full Twin/Single Bed + Lounge seating
    const isVertical = sleepWall === 'left' || sleepWall === 'right';
    items.push({
      id: 'bed-1',
      name: 'Tween Studio Bed (100x200)',
      category: 'bed',
      zone: 'storage',
      x: isVertical ? (sleepWall === 'right' ? widthCm - 110 : 20) : 30,
      y: isVertical ? 30 : (sleepWall === 'bottom' ? lengthCm - 110 : 20),
      width: isVertical ? 100 : 200,
      height: isVertical ? 200 : 100,
      rotation: 0,
      shelfHeightCm: 55,
      color: '#f97316',
      priceEst: 380,
      retailer: 'West Elm Kids',
      lightingKelvin: 2700
    });

    items.push({
      id: 'nook-1',
      name: 'Social Lounge Armchair & Pod',
      category: 'nook',
      zone: 'calm',
      x: isVertical ? (sleepWall === 'right' ? widthCm - 100 : 20) : Math.min(widthCm - 100, 250),
      y: isVertical ? Math.min(lengthCm - 100, 240) : (sleepWall === 'bottom' ? lengthCm - 95 : 20),
      width: 90,
      height: 90,
      rotation: 0,
      color: '#6366f1',
      priceEst: 160,
      retailer: 'CB2 Kids',
      lightingKelvin: 2700
    });
  }

  // 2. Wall with Natural Light (Window Wall): Focus / Tabletop Zone
  // Position desk perpendicular to window to avoid glare
  if (ageBracket === '3-5') {
    // Toddler craft table (60x90) + Stool
    if (windowWall === 'top') {
      items.push({
        id: 'desk-1',
        name: 'Toddler Craft Table (60x90)',
        category: 'desk',
        zone: 'focus',
        x: Math.min(widthCm - 110, 180),
        y: 20,
        width: 90,
        height: 60,
        rotation: 0,
        shelfHeightCm: 48,
        color: '#10b981',
        priceEst: 95,
        retailer: 'IKEA Flisat',
        lightingKelvin: 4000,
        safetyNotes: 'Sensory trofast bins insertable underneath.'
      });
    } else if (windowWall === 'bottom') {
      items.push({
        id: 'desk-1',
        name: 'Toddler Craft Table (60x90)',
        category: 'desk',
        zone: 'focus',
        x: Math.min(widthCm - 110, 180),
        y: lengthCm - 80,
        width: 90,
        height: 60,
        rotation: 0,
        shelfHeightCm: 48,
        color: '#10b981',
        priceEst: 95,
        retailer: 'IKEA Flisat',
        lightingKelvin: 4000
      });
    } else if (windowWall === 'left') {
      items.push({
        id: 'desk-1',
        name: 'Toddler Craft Table (60x90)',
        category: 'desk',
        zone: 'focus',
        x: 20,
        y: Math.min(lengthCm - 110, 160),
        width: 60,
        height: 90,
        rotation: 0,
        shelfHeightCm: 48,
        color: '#10b981',
        priceEst: 95,
        retailer: 'IKEA Flisat',
        lightingKelvin: 4000
      });
    } else { // right
      items.push({
        id: 'desk-1',
        name: 'Toddler Craft Table (60x90)',
        category: 'desk',
        zone: 'focus',
        x: widthCm - 80,
        y: Math.min(lengthCm - 110, 160),
        width: 60,
        height: 90,
        rotation: 0,
        shelfHeightCm: 48,
        color: '#10b981',
        priceEst: 95,
        retailer: 'IKEA Flisat',
        lightingKelvin: 4000
      });
    }
  } else if (ageBracket === '6-8') {
    // Primary Student Desk (60x110)
    const isHorizontal = windowWall === 'top' || windowWall === 'bottom';
    items.push({
      id: 'desk-1',
      name: 'Adjustable Study Desk (60x110)',
      category: 'desk',
      zone: 'focus',
      x: isHorizontal ? Math.max(20, Math.min(widthCm - 130, 150)) : (windowWall === 'left' ? 20 : widthCm - 80),
      y: isHorizontal ? (windowWall === 'top' ? 20 : lengthCm - 80) : Math.max(20, Math.min(lengthCm - 130, 150)),
      width: isHorizontal ? 110 : 60,
      height: isHorizontal ? 60 : 110,
      rotation: 0,
      shelfHeightCm: 64,
      color: '#10b981',
      priceEst: 175,
      retailer: 'Moll / IKEA Pahl',
      lightingKelvin: 4000,
      safetyNotes: 'Ergonomic tilt top with anti-pinch dampeners.'
    });
  } else if (ageBracket === '9-12') {
    // Full Student Ergonomic Desk (65x120) + Ergonomic Task Chair
    const isHorizontal = windowWall === 'top' || windowWall === 'bottom';
    items.push({
      id: 'desk-1',
      name: 'Ergonomic Teen Workstation (65x120)',
      category: 'desk',
      zone: 'focus',
      x: isHorizontal ? Math.max(20, Math.min(widthCm - 140, 150)) : (windowWall === 'left' ? 20 : widthCm - 85),
      y: isHorizontal ? (windowWall === 'top' ? 20 : lengthCm - 85) : Math.max(20, Math.min(lengthCm - 140, 150)),
      width: isHorizontal ? 120 : 65,
      height: isHorizontal ? 65 : 120,
      rotation: 0,
      shelfHeightCm: 75,
      color: '#10b981',
      priceEst: 260,
      retailer: 'Autonomous / Fully Kids',
      lightingKelvin: 4000
    });
  }

  // 3. Longest Continuous Wall: Anchor Low Modular Storage & Bookcases
  // Determine available wall not blocked by door or window or bed
  const walls: WallSide[] = ['top', 'bottom', 'left', 'right'];
  const storageWall = walls.find(w => w !== doorWall && w !== windowWall && w !== sleepWall) || (doorWall !== 'left' ? 'left' : 'right');

  const maxShelfHeightByAge: Record<AgeBracket, number> = {
    '0-2': 55,
    '3-5': 85,
    '6-8': 120,
    '9-12': 150
  };

  if (storageWall === 'left') {
    items.push({
      id: 'shelf-1',
      name: ageBracket === '0-2' ? 'Low 2-Tier Toy Rotation Shelf (30x120)' :
            ageBracket === '3-5' ? 'Montessori Accessible Cubby Shelf (30x140)' :
            'Modular 3-Tier Bookcase & Bins (35x140)',
      category: 'shelf',
      zone: 'storage',
      x: 20,
      y: Math.max(20, Math.min(lengthCm - 160, 160)),
      width: 35,
      height: 140,
      rotation: 0,
      shelfHeightCm: maxShelfHeightByAge[ageBracket],
      depthCm: 30,
      color: '#f97316',
      priceEst: 120,
      retailer: 'IKEA Trofast / Kallax',
      lightingKelvin: 3000,
      safetyNotes: 'Mandatory anti-tip wall anchor bracket included.'
    });
  } else if (storageWall === 'right') {
    items.push({
      id: 'shelf-1',
      name: ageBracket === '0-2' ? 'Low 2-Tier Toy Rotation Shelf (30x120)' :
            ageBracket === '3-5' ? 'Montessori Accessible Cubby Shelf (30x140)' :
            'Modular 3-Tier Bookcase & Bins (35x140)',
      category: 'shelf',
      zone: 'storage',
      x: widthCm - 55,
      y: Math.max(20, Math.min(lengthCm - 160, 160)),
      width: 35,
      height: 140,
      rotation: 0,
      shelfHeightCm: maxShelfHeightByAge[ageBracket],
      depthCm: 30,
      color: '#f97316',
      priceEst: 120,
      retailer: 'IKEA Trofast / Kallax',
      lightingKelvin: 3000,
      safetyNotes: 'Mandatory anti-tip wall anchor bracket.'
    });
  } else if (storageWall === 'bottom') {
    items.push({
      id: 'shelf-1',
      name: 'Modular Low Storage Shelf (140x35)',
      category: 'shelf',
      zone: 'storage',
      x: Math.max(20, Math.min(widthCm - 160, 160)),
      y: lengthCm - 55,
      width: 140,
      height: 35,
      rotation: 0,
      shelfHeightCm: maxShelfHeightByAge[ageBracket],
      depthCm: 30,
      color: '#f97316',
      priceEst: 120,
      retailer: 'IKEA Trofast / Kallax',
      lightingKelvin: 3000,
      safetyNotes: 'Mandatory anti-tip wall anchor bracket.'
    });
  } else {
    items.push({
      id: 'shelf-1',
      name: 'Modular Low Storage Shelf (140x35)',
      category: 'shelf',
      zone: 'storage',
      x: Math.max(20, Math.min(widthCm - 160, 160)),
      y: 20,
      width: 140,
      height: 35,
      rotation: 0,
      shelfHeightCm: maxShelfHeightByAge[ageBracket],
      depthCm: 30,
      color: '#f97316',
      priceEst: 120,
      retailer: 'IKEA Trofast / Kallax',
      lightingKelvin: 3000,
      safetyNotes: 'Mandatory anti-tip wall anchor bracket.'
    });
  }

  // 4. Central Remaining Floor: Active Play Rug Zone
  // Dimensions scaled by room dimensions and age allocation
  const rugWidth = Math.min(widthCm - 140, ageBracket === '0-2' ? 180 : (ageBracket === '3-5' ? 160 : 140));
  const rugHeight = Math.min(lengthCm - 140, ageBracket === '0-2' ? 180 : (ageBracket === '3-5' ? 160 : 140));
  const rugCenterX = (widthCm - rugWidth) / 2;
  const rugCenterY = (lengthCm - rugHeight) / 2;

  items.unshift({
    id: 'rug-center',
    name: ageBracket === '0-2' ? 'Non-Toxic Gross Motor Crawling Mat' :
          ageBracket === '3-5' ? 'Organic Cotton Active Play Rug' :
          'Acoustic Geometric Play Rug',
    category: 'rug',
    zone: 'active',
    x: Math.max(20, rugCenterX),
    y: Math.max(20, rugCenterY),
    width: Math.max(100, rugWidth),
    height: Math.max(100, rugHeight),
    rotation: 0,
    color: '#f59e0b',
    priceEst: 145,
    retailer: 'Ruggable / Lorena Canals',
    safetyNotes: 'OEKO-TEX Class 1 / GOTS Certified Organic, machine washable.'
  });

  return items;
}
