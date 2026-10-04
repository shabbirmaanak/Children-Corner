# Children's Corner — Child-Centric Room Layout Generator & Spatial Engine

A deterministic spatial computation engine and interactive 2D floorplan visualizer designed to translate child developmental milestones, ergonomic anthropometrics, and architectural guardrails into optimal room layouts.

---

## 1. Computational Pipeline Architecture

```
[User Input & Room Config]
    ↓
[Tier 1: Zone Matrix Engine] (Age Bracket determines 4 Micro-Zone % Ratios & m²)
    ↓
[Tier 2: Spatial Fitting & Constraint Engine] (Minkowski Clearances + Door Arc Swept-Area Collisions)
    ↓
[Tier 3: Wall-Anchor Priority Algorithm] (Natural line-of-sight & window orientation anchors)
    ↓
[Tier 4: Recommendation & Blueprint Manifest] (Curated specs, Kelvin lighting & PDF/Printable export)
```

---

## 2. Core Algorithmic & Mathematical Rules

### A. Age-to-Zone Weighting
Usable floor area ($A_{\text{net}} = \text{Length} \times \text{Width} - \text{Door/Window swings}$) is deterministically allocated across 4 micro-zones:

| Age Bracket | Focus / Stage | Active Play Area | Calm / Sensory Nook | Focus / Tabletop | Sleep / Storage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **0 – 2 yrs** | Gross motor, crawling, tactile | **50%** (open floor, mirrors) | **20%** (soft mats) | **0%** | **30%** (low open bins) |
| **3 – 5 yrs** | Symbolic play, autonomy, pre-literacy | **35%** (block/pretend) | **20%** (reading corner) | **15%** (craft table) | **30%** (accessible cubbies) |
| **6 – 8 yrs** | Fine motor, reading, homework habits | **25%** (open lego/craft) | **15%** (quiet nook) | **35%** (desk, task light) | **25%** (shelving, closet) |
| **9 – 12 yrs** | Identity, study focus, social boundary | **15%** (lounge/seating) | **15%** (privacy zone) | **45%** (ergonomic study) | **25%** (vertical storage) |

### B. Mathematical Door Swing Swept-Area Collision ($S$)
- **Hinge Pivot:** $P_0 = (x_0, y_0)$
- **Radius:** Leaf width $R$ (typically 80–90 cm)
- **Angular Range:** Directed sector $[\theta_{\text{start}}, \theta_{\text{end}}]$
- **AABB Distance & Sector Test:**
  $$Q_x^* = \text{clamp}(x_0, x_{\min}, x_{\max}), \quad Q_y^* = \text{clamp}(y_0, y_{\min}, y_{\max})$$
  $$\|Q^* - P_0\|_2 \le R \quad \text{and} \quad \text{atan2}(Q_y^* - y_0, Q_x^* - x_0) \in [\theta_{\text{start}}, \theta_{\text{end}}]$$

### C. Circulation Clearance (The 75 cm Minkowski Rule)
- **Corridor Bottleneck Query:**
  $$\Delta x = \max(0, \max(A_{x\min}, B_{x\min}) - \min(A_{x\max}, B_{x\max}))$$
  $$\Delta y = \max(0, \max(A_{y\min}, B_{y\min}) - \min(A_{y\max}, B_{y\max}))$$
  $$\text{dist}(A, B) = \sqrt{\Delta x^2 + \Delta y^2} \ge 75\text{ cm}$$
- **Minkowski Padding Aura:** Visualized in real time with a $37.5\text{ cm}$ dilated perimeter. Dynamic dashed distance measurement lines connect closest edges.

### D. Wall-Anchor Priority Algorithm
1. **Wall 1 (Opposite Entry Door):** Anchors **Calm / Sleep Zone** for immediate visual calm upon entering.
2. **Natural Light (Window Wall):** Anchors **Focus / Creative Zone** positioned perpendicular to avoid direct screen or eye glare.
3. **Longest Continuous Wall:** Anchors **Low Modular Storage** (forward-facing books, toy rotation).
4. **Central Remaining Floor:** Automatically allocated as the **Active Rug / Play Zone**.

---

## 3. Features
- 📐 **Interactive 2D Floorplan Canvas:** Drag, drop, rotate (90°), duplicate, wall-snap, zoom, and pan.
- 🚨 **Live Spatial Audit Panel:** Real-time safety score (0–100%), Critical door blockage alerts, warning corridors, and one-click "Auto-Resolve".
- 📊 **Developmental Zone Matrix:** Interactive 4-zone allocation chart comparing target developmental percentages against actual placed furniture footprints.
- 💡 **Circadian Lighting & Kelvin Guide:** Guidance for 2700K ambient, 4000K high-CRI study task lighting, and 2200K night sensory lamps.
- 📋 **Curated Shopping & Procurement Manifest:** Itemized dimensions, non-toxic certifications (Greenguard Gold, ASTM, OEKO-TEX), and budget estimate.
- 📄 **1-Page Architectural Blueprint:** Printable / PDF export ready with title block, 2D floorplan rendering, and developmental checklist.

---

## 4. Getting Started

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```
