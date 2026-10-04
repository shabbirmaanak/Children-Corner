import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  RotateCw, 
  Trash2, 
  Copy, 
  Layers, 
  Eye, 
  Grid, 
  ShieldAlert, 
  Sparkles,
  Sun,
  DoorClosed,
  Ruler
} from 'lucide-react';
import { 
  Box, 
  Door, 
  RoomConfig, 
  Violation, 
  DistanceLine, 
  Point,
  WallSide 
} from '../types/index.ts';
import { 
  checkDoorSwingCollision, 
  getOrientedBox, 
  computeDoorGeometry 
} from '../engine/spatialEngine.ts';

interface FloorplanCanvasProps {
  roomConfig: RoomConfig;
  furniture: Box[];
  onUpdateFurniture: (items: Box[]) => void;
  violations: Violation[];
  distanceLines: DistanceLine[];
  onSelectItem?: (item: Box | null) => void;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  onUpdateRoomConfig?: (cfg: RoomConfig) => void;
}

export const FloorplanCanvas: React.FC<FloorplanCanvasProps> = ({
  roomConfig,
  furniture,
  onUpdateFurniture,
  violations,
  distanceLines,
  selectedItemId,
  setSelectedItemId,
  onUpdateRoomConfig
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewport transformation state
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });

  // Interaction options
  const [showAuras, setShowAuras] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showZones, setShowZones] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);

  // Dragging state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // Wall Anchor Dragging (Door or Window)
  const [draggingAnchor, setDraggingAnchor] = useState<'door' | 'window' | null>(null);

  // Compute door geometry
  const door: Door = computeDoorGeometry(
    roomConfig.doorWall,
    roomConfig.doorOffsetCm,
    roomConfig.doorLeafWidthCm,
    roomConfig.widthCm,
    roomConfig.lengthCm,
    roomConfig.hasDoor,
    roomConfig.doorType
  );

  // Helper: Convert Room Coordinates (cm) to Canvas Screen Pixels
  const roomToScreen = useCallback((rx: number, ry: number, scale: number, originX: number, originY: number): Point => {
    return {
      x: originX + rx * scale,
      y: originY + ry * scale
    };
  }, []);

  // Helper: Convert Canvas Screen Pixels to Room Coordinates (cm)
  const screenToRoom = useCallback((sx: number, sy: number, scale: number, originX: number, originY: number): Point => {
    return {
      x: (sx - originX) / scale,
      y: (sy - originY) / scale
    };
  }, []);

  // Auto-fit room inside canvas on mount or room size change
  const fitView = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    const margin = 70;
    const availW = clientWidth - margin * 2;
    const availH = clientHeight - margin * 2;

    const scaleW = availW / roomConfig.widthCm;
    const scaleH = availH / roomConfig.lengthCm;
    const autoScale = Math.min(scaleW, scaleH, 1.55);

    setZoom(autoScale);
    setPanOffset({
      x: (clientWidth - roomConfig.widthCm * autoScale) / 2,
      y: (clientHeight - roomConfig.lengthCm * autoScale) / 2
    });
  }, [roomConfig.widthCm, roomConfig.lengthCm]);

  useEffect(() => {
    fitView();
  }, [fitView]);

  const selectedItem = furniture.find(f => f.id === selectedItemId) || null;
  const isDoorColliding = furniture.some(item => checkDoorSwingCollision(door, item));

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const originX = panOffset.x;
    const originY = panOffset.y;
    const scale = zoom;

    // 1. Draw Architectural Floor Grid (50cm minor, 100cm major)
    ctx.save();
    const gridMinor = 50 * scale;
    const gridMajor = 100 * scale;

    ctx.strokeStyle = 'rgba(51, 65, 85, 0.2)';
    ctx.lineWidth = 1;
    for (let x = originX % gridMinor; x < width; x += gridMinor) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = originY % gridMinor; y < height; y += gridMinor) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Major grid lines
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
    for (let x = originX % gridMajor; x < width; x += gridMajor) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = originY % gridMajor; y < height; y += gridMajor) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Draw Room Floor & Micro-Zone Underlays
    const roomScreenW = roomConfig.widthCm * scale;
    const roomScreenH = roomConfig.lengthCm * scale;

    // Room Floor Background
    ctx.save();
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 24;
    ctx.fillRect(originX, originY, roomScreenW, roomScreenH);
    ctx.shadowColor = 'transparent';

    // Warm flooring wood plank texture lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    const plankWidth = 22 * scale;
    for (let py = originY; py <= originY + roomScreenH; py += plankWidth) {
      ctx.beginPath();
      ctx.moveTo(originX, py);
      ctx.lineTo(originX + roomScreenW, py);
      ctx.stroke();
    }

    // Micro-Zone Halos / Underlays
    if (showZones) {
      // Active Play Rug Area Halo
      const rugHaloPad = 60 * scale;
      if (roomScreenW > rugHaloPad * 2 && roomScreenH > rugHaloPad * 2) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.03)';
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.roundRect(
          originX + rugHaloPad,
          originY + rugHaloPad,
          roomScreenW - rugHaloPad * 2,
          roomScreenH - rugHaloPad * 2,
          16
        );
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    ctx.restore();

    // 3. Draw Door Swept Area / Entryway Visuals
    if (door.hasDoor && door.swingType !== 'none') {
      ctx.save();
      const doorHingeScreen = roomToScreen(door.hinge.x, door.hinge.y, scale, originX, originY);
      const doorRadiusScreen = door.leafWidth * scale;

      if (door.swingType === 'inward') {
        // Standard Inward 90-degree Sector
        ctx.beginPath();
        ctx.moveTo(doorHingeScreen.x, doorHingeScreen.y);
        ctx.arc(
          doorHingeScreen.x,
          doorHingeScreen.y,
          doorRadiusScreen,
          door.startAngle,
          door.endAngle,
          false
        );
        ctx.closePath();

        if (isDoorColliding) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.35)'; // Crimson warning
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 4]);
        } else {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.15)'; // Safe blue
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
        }
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);

        // Door Leaf Line
        const doorLeafEndX = doorHingeScreen.x + Math.cos(door.startAngle) * doorRadiusScreen;
        const doorLeafEndY = doorHingeScreen.y + Math.sin(door.startAngle) * doorRadiusScreen;
        ctx.strokeStyle = isDoorColliding ? '#f87171' : '#60a5fa';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(doorHingeScreen.x, doorHingeScreen.y);
        ctx.lineTo(doorLeafEndX, doorLeafEndY);
        ctx.stroke();

        // Door Hinge Pivot Dot
        ctx.fillStyle = isDoorColliding ? '#ef4444' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(doorHingeScreen.x, doorHingeScreen.y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Arc Radius Dimension Line & Callout
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillStyle = isDoorColliding ? '#fca5a5' : '#93c5fd';
        ctx.fillText(
          isDoorColliding ? '⚠️ CRITICAL: DOOR BLOCKED' : `Inward Arc (${door.leafWidth}cm)`,
          doorHingeScreen.x + (door.wall === 'right' ? -140 : 15),
          doorHingeScreen.y + (door.wall === 'bottom' ? -15 : 20)
        );
      } else if (door.swingType === 'outward') {
        // Outward Swing (draws outward arc outside interior)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(doorHingeScreen.x, doorHingeScreen.y, doorRadiusScreen, door.startAngle + Math.PI, door.endAngle + Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);

        // Door Leaf Line opening outward
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(doorHingeScreen.x, doorHingeScreen.y);
        ctx.lineTo(
          doorHingeScreen.x + (door.wall === 'bottom' ? 0 : door.wall === 'top' ? 0 : door.wall === 'left' ? -doorRadiusScreen : doorRadiusScreen),
          doorHingeScreen.y + (door.wall === 'bottom' ? doorRadiusScreen : door.wall === 'top' ? -doorRadiusScreen : 0)
        );
        ctx.stroke();

        // Label
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillStyle = '#7dd3fc';
        ctx.fillText(
          `Outward Door (${door.leafWidth}cm)`,
          doorHingeScreen.x + (door.wall === 'right' ? -120 : 15),
          doorHingeScreen.y + (door.wall === 'bottom' ? 20 : -10)
        );
      } else if (door.swingType === 'sliding') {
        // Sliding / Pocket Door Track
        const trackLen = doorRadiusScreen;
        ctx.fillStyle = '#6366f1';
        ctx.strokeStyle = '#a5b4fc';
        ctx.lineWidth = 3;
        
        let trackX = doorHingeScreen.x;
        let trackY = doorHingeScreen.y;
        let trackW = door.wall === 'top' || door.wall === 'bottom' ? trackLen : 10;
        let trackH = door.wall === 'left' || door.wall === 'right' ? trackLen : 10;

        ctx.fillRect(trackX, trackY, trackW, trackH);
        ctx.strokeRect(trackX, trackY, trackW, trackH);

        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillStyle = '#c7d2fe';
        ctx.fillText(
          `Sliding Track ⇋ (${door.leafWidth}cm)`,
          trackX + (door.wall === 'right' ? -140 : 10),
          trackY + (door.wall === 'bottom' ? -10 : 20)
        );
      } else if (door.swingType === 'open_arch') {
        // Open Archway / Passage Gap
        const archLen = doorRadiusScreen;
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.setLineDash([2, 4]);

        let archX = doorHingeScreen.x;
        let archY = doorHingeScreen.y;
        let archW = door.wall === 'top' || door.wall === 'bottom' ? archLen : 12;
        let archH = door.wall === 'left' || door.wall === 'right' ? archLen : 12;

        ctx.strokeRect(archX, archY, archW, archH);
        ctx.setLineDash([]);

        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(
          `Open Arch (${door.leafWidth}cm)`,
          archX + (door.wall === 'right' ? -120 : 10),
          archY + (door.wall === 'bottom' ? -10 : 20)
        );
      }
      ctx.restore();
    }

    // 4. Draw Window on Wall with Warm Sunlight Glow (if enabled)
    if (roomConfig.hasWindow !== false) {
      ctx.save();
      let winX = 0, winY = 0, winW = 0, winH = 0;
      const winWidthScreen = (roomConfig.windowWidthCm || 160) * scale;
      const winOffsetScreen = (roomConfig.windowOffsetCm || 80) * scale;
      const wallThick = 12;

      if (roomConfig.windowWall === 'top') {
        winX = originX + winOffsetScreen;
        winY = originY - wallThick / 2;
        winW = winWidthScreen;
        winH = wallThick;
      } else if (roomConfig.windowWall === 'bottom') {
        winX = originX + winOffsetScreen;
        winY = originY + roomScreenH - wallThick / 2;
        winW = winWidthScreen;
        winH = wallThick;
      } else if (roomConfig.windowWall === 'left') {
        winX = originX - wallThick / 2;
        winY = originY + winOffsetScreen;
        winW = wallThick;
        winH = winWidthScreen;
      } else { // right
        winX = originX + roomScreenW - wallThick / 2;
        winY = originY + winOffsetScreen;
        winW = wallThick;
        winH = winWidthScreen;
      }

      // Natural light sunbeam gradient
      const sunGrad = ctx.createLinearGradient(
        winX,
        winY,
        roomConfig.windowWall === 'left' ? winX + 110 * scale : (roomConfig.windowWall === 'right' ? winX - 110 * scale : winX),
        roomConfig.windowWall === 'top' ? winY + 110 * scale : (roomConfig.windowWall === 'bottom' ? winY - 110 * scale : winY)
      );
      sunGrad.addColorStop(0, 'rgba(251, 191, 36, 0.28)'); // warm amber light
      sunGrad.addColorStop(1, 'rgba(251, 191, 36, 0.0)');
      ctx.fillStyle = sunGrad;
      if (roomConfig.windowWall === 'top') ctx.fillRect(winX, originY, winW, 110 * scale);
      else if (roomConfig.windowWall === 'bottom') ctx.fillRect(winX, originY + roomScreenH - 110 * scale, winW, 110 * scale);
      else if (roomConfig.windowWall === 'left') ctx.fillRect(originX, winY, 110 * scale, winH);
      else ctx.fillRect(originX + roomScreenW - 110 * scale, winY, 110 * scale, winH);

      // Window Glass Frame
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(winX, winY, winW, winH);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.strokeRect(winX, winY, winW, winH);

      // Window text label
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillStyle = '#bae6fd';
      ctx.textAlign = 'center';
      ctx.fillText(`Window (${roomConfig.windowWidthCm || 160}cm)`, winX + winW / 2, winY + (roomConfig.windowWall === 'top' ? -8 : winH + 14));
      ctx.restore();
    }

    // 5. Draw Furniture Items (Rugs first as base layers)
    const sortedFurniture = [...furniture].sort((a, b) => {
      if (a.category === 'rug' && b.category !== 'rug') return -1;
      if (a.category !== 'rug' && b.category === 'rug') return 1;
      return 0;
    });

    sortedFurniture.forEach((item) => {
      const ob = getOrientedBox(item);
      const screenPos = roomToScreen(ob.xMin, ob.yMin, scale, originX, originY);
      const itemScreenW = ob.w * scale;
      const itemScreenH = ob.h * scale;
      const isSelected = item.id === selectedItemId;
      const isHovered = item.id === hoveredItemId;
      const isDragging = item.id === draggingId;

      const itemViolations = violations.filter(v => v.involvedIds.includes(item.id));
      const hasCritical = itemViolations.some(v => v.severity === 'CRITICAL');
      const hasWarning = itemViolations.some(v => v.severity === 'WARNING');

      // 5A. Draw Minkowski Clearance Aura (37.5 cm)
      if ((showAuras || isDragging || isSelected || isHovered) && item.category !== 'rug') {
        const auraMargin = 37.5 * scale;
        ctx.save();
        ctx.strokeStyle = hasCritical 
          ? 'rgba(239, 68, 68, 0.5)' 
          : hasWarning 
          ? 'rgba(245, 158, 11, 0.45)' 
          : 'rgba(99, 102, 241, 0.28)';
        ctx.fillStyle = hasCritical 
          ? 'rgba(239, 68, 68, 0.08)' 
          : hasWarning 
          ? 'rgba(245, 158, 11, 0.06)' 
          : 'rgba(99, 102, 241, 0.04)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        const auraX = screenPos.x - auraMargin;
        const auraY = screenPos.y - auraMargin;
        const auraW = itemScreenW + auraMargin * 2;
        const auraH = itemScreenH + auraMargin * 2;

        ctx.beginPath();
        ctx.roundRect(auraX, auraY, auraW, auraH, 14);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // 5B. Draw Detailed Furniture Visuals
      ctx.save();
      const zoneStyles: Record<string, { bg: string; border: string; text: string; header: string }> = {
        active: { bg: '#fef3c7', border: '#f59e0b', text: '#78350f', header: '#f59e0b' },
        calm: { bg: '#e0e7ff', border: '#6366f1', text: '#312e81', header: '#6366f1' },
        focus: { bg: '#dcfce7', border: '#10b981', text: '#064e3b', header: '#10b981' },
        storage: { bg: '#ffedd5', border: '#f97316', text: '#7c2d12', header: '#f97316' }
      };

      const style = zoneStyles[item.zone] || { bg: '#334155', border: '#64748b', text: '#f8fafc', header: '#64748b' };

      if (item.category === 'rug') {
        // Decorative Rug with woven texture and edge stitches
        ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.roundRect(screenPos.x, screenPos.y, itemScreenW, itemScreenH, 18);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);

        // Inner geometric pattern
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenPos.x + 8, screenPos.y + 8, itemScreenW - 16, itemScreenH - 16);

        // Center Rug Title
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = '#d97706';
        ctx.textAlign = 'center';
        ctx.fillText(item.name, screenPos.x + itemScreenW / 2, screenPos.y + itemScreenH / 2 - 4);
        ctx.font = '500 9px Inter, sans-serif';
        ctx.fillStyle = '#b45309';
        ctx.fillText(`Active Play Zone • ${item.width}×${item.height} cm`, screenPos.x + itemScreenW / 2, screenPos.y + itemScreenH / 2 + 12);
      } else {
        // Solid Furniture with Shadows and Category-Specific Vector Graphics
        ctx.shadowColor = isSelected ? 'rgba(99, 102, 241, 0.55)' : 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = isSelected ? 16 : 8;
        ctx.shadowOffsetY = 4;

        // Base rounded body
        ctx.fillStyle = style.bg;
        ctx.beginPath();
        ctx.roundRect(screenPos.x, screenPos.y, itemScreenW, itemScreenH, 8);
        ctx.fill();

        ctx.shadowColor = 'transparent';

        // Border outline
        ctx.lineWidth = isSelected ? 3 : (hasCritical ? 2.5 : 1.5);
        ctx.strokeStyle = isSelected 
          ? '#4f46e5' 
          : hasCritical 
          ? '#ef4444' 
          : hasWarning 
          ? '#f59e0b' 
          : style.border;
        ctx.stroke();

        // Top Zone Color Bar
        ctx.fillStyle = style.header;
        ctx.beginPath();
        ctx.roundRect(screenPos.x, screenPos.y, itemScreenW, 5, [8, 8, 0, 0]);
        ctx.fill();

        // Specific category visual embellishments
        if (item.category === 'bed') {
          // Draw pillow
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.lineWidth = 1;
          const pillowW = Math.min(itemScreenW - 16, 40 * scale);
          const pillowH = Math.min(itemScreenH - 16, 22 * scale);
          ctx.beginPath();
          ctx.roundRect(screenPos.x + 8, screenPos.y + 8, pillowW, pillowH, 4);
          ctx.fill();
          ctx.stroke();
        } else if (item.category === 'desk') {
          // Draw laptop/pad outline
          ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
          const padW = Math.min(itemScreenW - 20, 30 * scale);
          const padH = Math.min(itemScreenH - 20, 20 * scale);
          ctx.fillRect(screenPos.x + (itemScreenW - padW) / 2, screenPos.y + (itemScreenH - padH) / 2, padW, padH);
        } else if (item.category === 'shelf') {
          // Draw shelf vertical dividers
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
          ctx.lineWidth = 1;
          const numDividers = 3;
          for (let d = 1; d < numDividers; d++) {
            const divX = screenPos.x + (itemScreenW / numDividers) * d;
            ctx.beginPath();
            ctx.moveTo(divX, screenPos.y + 6);
            ctx.lineTo(divX, screenPos.y + itemScreenH - 6);
            ctx.stroke();
          }
        }

        // Title and Dimensions
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = style.text;
        
        const titleFontSize = Math.max(9, Math.min(12, 11 * (scale / 1.2)));
        ctx.font = `700 ${titleFontSize}px Inter, sans-serif`;

        let displayName = item.name;
        if (displayName.length > 20 && itemScreenW < 130) {
          displayName = displayName.substring(0, 18) + '...';
        }

        ctx.fillText(
          displayName, 
          screenPos.x + itemScreenW / 2, 
          screenPos.y + itemScreenH / 2 - (itemScreenH > 42 ? 6 : 0)
        );

        if (itemScreenH > 42) {
          ctx.font = `600 ${Math.max(8, titleFontSize - 2)}px Inter, sans-serif`;
          ctx.fillStyle = hasCritical ? '#dc2626' : style.text;
          ctx.fillText(
            `${ob.w} × ${ob.h} cm ${item.shelfHeightCm ? `• Cap:${item.shelfHeightCm}cm` : ''}`, 
            screenPos.x + itemScreenW / 2, 
            screenPos.y + itemScreenH / 2 + 9
          );
        }

        // Violation Indicator Badge
        if (hasCritical || hasWarning) {
          ctx.fillStyle = hasCritical ? '#ef4444' : '#f59e0b';
          ctx.beginPath();
          ctx.arc(screenPos.x + itemScreenW - 10, screenPos.y + 10, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = 'bold 10px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('!', screenPos.x + itemScreenW - 10, screenPos.y + 10);
        }
      }

      ctx.restore();
    });

    // 6. Draw Real-Time Circulation Distance Lines
    if (showDimensions) {
      distanceLines.forEach((line) => {
        const s1 = roomToScreen(line.p1.x, line.p1.y, scale, originX, originY);
        const s2 = roomToScreen(line.p2.x, line.p2.y, scale, originX, originY);

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 3]);
        ctx.moveTo(s1.x, s1.y);
        ctx.lineTo(s2.x, s2.y);
        ctx.strokeStyle = line.isViolation ? '#ef4444' : 'rgba(251, 191, 36, 0.8)';
        ctx.lineWidth = line.isViolation ? 2 : 1.5;
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = line.isViolation ? '#ef4444' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(s1.x, s1.y, 3, 0, Math.PI * 2);
        ctx.arc(s2.x, s2.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Measurement pill
        const midX = (s1.x + s2.x) / 2;
        const midY = (s1.y + s2.y) / 2;

        const text = `${line.distanceCm} cm${line.isViolation ? ' ⚠️' : ''}`;
        ctx.font = 'bold 9px Inter, sans-serif';
        const textMetrics = ctx.measureText(text);
        const pillW = textMetrics.width + 12;
        const pillH = 18;

        ctx.fillStyle = line.isViolation ? '#7f1d1d' : '#451a03';
        ctx.strokeStyle = line.isViolation ? '#ef4444' : '#f59e0b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(midX - pillW / 2, midY - pillH / 2, pillW, pillH, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = line.isViolation ? '#fecaca' : '#fde68a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, midX, midY);

        ctx.restore();
      });
    }

    // 7. Architectural Walls with Dimension Numbers
    ctx.save();
    ctx.strokeStyle = '#94a3b8'; // slate-400
    ctx.lineWidth = 6;
    ctx.strokeRect(originX, originY, roomScreenW, roomScreenH);

    // Dimension labels
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    
    // Width callout
    ctx.fillText(`${(roomConfig.widthCm / 100).toFixed(2)} m (${roomConfig.widthCm} cm)`, originX + roomScreenW / 2, originY - 14);
    
    // Wall orientation tag
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`North Wall (Window: ${roomConfig.windowWall}) • South Wall (Door: ${roomConfig.doorWall})`, originX + roomScreenW / 2, originY + roomScreenH + 22);

    // Length callout on left wall
    ctx.save();
    ctx.translate(originX - 16, originY + roomScreenH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`${(roomConfig.lengthCm / 100).toFixed(2)} m (${roomConfig.lengthCm} cm)`, 0, 0);
    ctx.restore();

    ctx.restore();

  }, [
    zoom, 
    panOffset, 
    roomConfig, 
    furniture, 
    violations, 
    distanceLines, 
    selectedItemId, 
    hoveredItemId, 
    draggingId, 
    showAuras, 
    showDimensions, 
    showZones,
    door,
    isDoorColliding,
    roomToScreen
  ]);

  // Handle Mouse Down on Canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const roomPos = screenToRoom(mouseX, mouseY, zoom, panOffset.x, panOffset.y);

    // Check hit on furniture
    const clickedItem = [...furniture].reverse().find(item => {
      const ob = getOrientedBox(item);
      return (
        roomPos.x >= ob.xMin &&
        roomPos.x <= ob.xMax &&
        roomPos.y >= ob.yMin &&
        roomPos.y <= ob.yMax
      );
    });

    if (clickedItem) {
      setSelectedItemId(clickedItem.id);
      setDraggingId(clickedItem.id);
      const ob = getOrientedBox(clickedItem);
      setDragOffset({
        x: roomPos.x - ob.xMin,
        y: roomPos.y - ob.yMin
      });
    } else {
      setSelectedItemId(null);
      setIsPanning(true);
      setPanStart({ x: mouseX - panOffset.x, y: mouseY - panOffset.y });
    }
  };

  // Handle Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isPanning) {
      setPanOffset({
        x: mouseX - panStart.x,
        y: mouseY - panStart.y
      });
      return;
    }

    const roomPos = screenToRoom(mouseX, mouseY, zoom, panOffset.x, panOffset.y);

    if (draggingId) {
      const targetItem = furniture.find(f => f.id === draggingId);
      if (!targetItem) return;

      const ob = getOrientedBox(targetItem);
      let newX = roomPos.x - dragOffset.x;
      let newY = roomPos.y - dragOffset.y;

      if (snapToGrid) {
        newX = Math.round(newX / 10) * 10;
        newY = Math.round(newY / 10) * 10;
      }

      // Wall snapping
      const snapThreshold = 15;
      if (newX < snapThreshold) newX = 10;
      if (newY < snapThreshold) newY = 10;
      if (newX + ob.w > roomConfig.widthCm - snapThreshold) newX = roomConfig.widthCm - ob.w - 10;
      if (newY + ob.h > roomConfig.lengthCm - snapThreshold) newY = roomConfig.lengthCm - ob.h - 10;

      newX = Math.max(0, Math.min(roomConfig.widthCm - ob.w, newX));
      newY = Math.max(0, Math.min(roomConfig.lengthCm - ob.h, newY));

      const updated = furniture.map(f => {
        if (f.id === draggingId) {
          return { ...f, x: newX, y: newY };
        }
        return f;
      });

      onUpdateFurniture(updated);
    } else {
      const hovered = furniture.find(item => {
        const ob = getOrientedBox(item);
        return (
          roomPos.x >= ob.xMin &&
          roomPos.x <= ob.xMax &&
          roomPos.y >= ob.yMin &&
          roomPos.y <= ob.yMax
        );
      });
      setHoveredItemId(hovered ? hovered.id : null);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingId(null);
  };

  const handleRotate = () => {
    if (!selectedItemId) return;
    const updated = furniture.map(f => {
      if (f.id === selectedItemId) {
        const nextRot = ((f.rotation || 0) + 90) % 360;
        return { ...f, rotation: nextRot };
      }
      return f;
    });
    onUpdateFurniture(updated);
  };

  const handleDelete = () => {
    if (!selectedItemId) return;
    const updated = furniture.filter(f => f.id !== selectedItemId);
    onUpdateFurniture(updated);
    setSelectedItemId(null);
  };

  const handleDuplicate = () => {
    if (!selectedItem) return;
    const newItem: Box = {
      ...selectedItem,
      id: `item-${Date.now()}`,
      name: `${selectedItem.name} (Copy)`,
      x: Math.min(roomConfig.widthCm - selectedItem.width, selectedItem.x + 30),
      y: Math.min(roomConfig.lengthCm - selectedItem.height, selectedItem.y + 30)
    };
    onUpdateFurniture([...furniture, newItem]);
    setSelectedItemId(newItem.id);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.max(0.4, Math.min(3.0, zoom * zoomFactor));
    setZoom(newZoom);
  };

  return (
    <div className="relative w-full h-[650px] lg:h-[750px] bg-slate-950 rounded-3xl border border-slate-700/80 overflow-hidden select-none flex flex-col shadow-2xl">
      {/* Top Canvas Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Toggles */}
        <div className="flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-xl pointer-events-auto text-xs">
          <button
            onClick={() => setShowAuras(!showAuras)}
            title="Toggle 75cm Minkowski Clearance Auras"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              showAuras ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">75cm Clearance Auras</span>
          </button>

          <button
            onClick={() => setShowDimensions(!showDimensions)}
            title="Toggle Gap Measurements"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              showDimensions ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gap Dimensions</span>
          </button>

          <button
            onClick={() => setShowZones(!showZones)}
            title="Toggle Micro-Zone Layout Outlines"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              showZones ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Zones</span>
          </button>

          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            title="Toggle 10cm Grid Snapping"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              snapToGrid ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Snap 10cm</span>
          </button>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md p-1 rounded-2xl border border-slate-700/80 shadow-xl pointer-events-auto text-xs">
          <button
            onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="px-2 text-[11px] font-mono text-slate-300 font-bold">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-slate-700 mx-1" />
          <button
            onClick={fitView}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 font-bold"
            title="Fit Room to Canvas"
          >
            <Maximize className="w-4 h-4" />
            <span className="hidden md:inline text-[11px]">Fit</span>
          </button>
        </div>
      </div>

      {/* Interactive Main Canvas */}
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-crosshair relative flex-1"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full block"
        />
      </div>

      {/* Floating Selected Item Action Toolbar */}
      {selectedItem && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-slate-900/95 backdrop-blur-xl px-5 py-3 rounded-2xl border border-indigo-500/60 shadow-2xl shadow-indigo-500/25 text-xs text-white animate-in slide-in-from-bottom-3">
          <div className="flex items-center gap-2 mr-2 border-r border-slate-700 pr-3">
            <span className={`w-3.5 h-3.5 rounded-full ${
              selectedItem.zone === 'active' ? 'bg-amber-400' :
              selectedItem.zone === 'calm' ? 'bg-indigo-400' :
              selectedItem.zone === 'focus' ? 'bg-emerald-400' : 'bg-orange-400'
            }`} />
            <div className="font-bold text-slate-100">{selectedItem.name}</div>
            <span className="text-[11px] text-slate-400 font-mono">
              ({selectedItem.width}×{selectedItem.height} cm • Rot: {selectedItem.rotation || 0}°)
            </span>
          </div>

          <button
            onClick={handleRotate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700 transition-all font-bold"
            title="Rotate 90 Degrees"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Rotate 90°</span>
          </button>

          <button
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all font-bold"
            title="Duplicate Item"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-800/60 transition-all font-bold"
            title="Remove from Room"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Bottom Canvas Status Bar / Legend */}
      <div className="absolute bottom-3 left-4 z-10 hidden sm:flex items-center gap-3 text-[11px] text-slate-400 bg-slate-900/90 backdrop-blur px-3.5 py-1.5 rounded-2xl border border-slate-800 pointer-events-none">
        <span className="font-bold text-slate-200">Zoning:</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" /> Active Play</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50" /> Calm Nook</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" /> Focus Tabletop</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-sm shadow-orange-400/50" /> Sleep / Storage</span>
      </div>
    </div>
  );
};
