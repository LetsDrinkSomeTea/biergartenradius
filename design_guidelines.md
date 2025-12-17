# Biergartenradius - Design Guidelines

## Design Approach
**System-Based Approach**: Drawing from Material Design and modern mapping interfaces (Google Maps, Mapbox) for data-rich, utility-focused applications. This is a productivity tool where clarity and efficiency drive the design.

## Core Design Principles
1. **Functional Hierarchy**: Map-first layout with supporting panels for controls and data
2. **Progressive Disclosure**: Show controls and results contextually as user progresses
3. **Spatial Efficiency**: Maximize map visibility while maintaining accessible controls

---

## Layout System

**Primary Structure**: Split-panel layout
- Left sidebar: 360px fixed width for controls and results
- Right panel: Fluid map area (remaining viewport width)
- Mobile: Stack vertically with map taking 50vh minimum

**Spacing System**: Use Tailwind units of 3, 4, 6, and 8 for consistency
- Component padding: p-6
- Section spacing: space-y-4
- Card gaps: gap-4
- Tight spacing: p-3, gap-3

**Container Strategy**:
- Sidebar content: max-w-full with p-6
- Map area: w-full h-screen (sticky positioning)
- Result cards: w-full with internal padding

---

## Typography

**Font Stack**: 
- Primary: Inter or similar geometric sans-serif (Google Fonts CDN)
- Monospace: JetBrains Mono for coordinates

**Hierarchy**:
- App Title: text-2xl font-bold
- Section Headers: text-lg font-semibold
- Body Text: text-base font-normal
- Labels: text-sm font-medium
- Data/Coordinates: text-sm font-mono
- Helper Text: text-xs text-gray-600

---

## Component Library

### Navigation & Header
- Compact top bar (h-16) with app name "Biergartenradius"
- Privacy indicator badge ("100% Client-Seitig")
- Minimal, functional design

### File Upload Zone
- Drag-and-drop area with dashed border
- Large dropzone with icon (use Heroicons: document-arrow-up)
- Accepted formats clearly labeled: "CSV oder TXT"
- List uploaded addresses immediately below with scrollable container (max-h-64)

### Map Controls Panel
Stacked vertical sections in sidebar:

**1. Address Input Section**
- Upload zone at top
- Address list with delete buttons per entry
- "Mittelpunkt berechnen" primary button

**2. Radius Control**
- Range slider (500m - 5000m) with live value display
- Input field for precise entry
- Visual indicator showing radius on map

**3. POI Filter**
- Checkbox group with categories:
  - Biergärten (primary)
  - Restaurants
  - Cafés
  - Parks
  - Bars
- "Alle auswählen/abwählen" toggle

**4. Results List**
- Scrollable container (max-h-96)
- POI cards showing:
  - Name (text-base font-semibold)
  - Category badge
  - Distance from center
  - Walking time estimate
- Click card to highlight on map

### Map Component
- Full-height interactive map using Leaflet.js
- Custom markers:
  - Input addresses: blue pins
  - Calculated midpoint: red star marker (larger)
  - POIs: category-specific icons
- Radius circle visualization around midpoint
- Zoom controls in bottom-right
- Attribution in bottom-left

### Data Display Cards
- Clean card design with subtle borders
- Icon + text pattern for quick scanning
- Hover state: slight elevation
- Include distance metric prominently

### Buttons
**Primary**: "Mittelpunkt berechnen", "POIs suchen"
- Larger touch targets (h-12)
- Full width in mobile

**Secondary**: Export, clear data
- Standard height (h-10)

**Icon Buttons**: Delete address, zoom controls
- Square (w-8 h-8)
- Icon-only with tooltip

### Form Elements
- Range slider: Full width with thumb indicator
- Text inputs: Standard height (h-10), clear borders
- Checkboxes: Larger touch targets (w-5 h-5) with labels

### Export Function
- CSV download button for:
  - All coordinates
  - Found POIs with details
- Positioned at bottom of sidebar

---

## Responsive Behavior

**Desktop (lg:)**: Side-by-side layout, sidebar sticky
**Tablet (md:)**: Narrower sidebar (320px)
**Mobile**: 
- Vertical stack
- Map: 50vh minimum, expandable
- Sidebar: Full width, collapsible sections
- Floating action button to toggle sidebar

---

## Icons
Use **Heroicons** via CDN:
- document-arrow-up (upload)
- map-pin (addresses)
- adjustments-horizontal (filters)
- magnifying-glass (search)
- arrow-down-tray (export)
- trash (delete)
- plus/minus (zoom)

---

## Images
**No hero images needed** - this is a pure utility application. Focus is on the interactive map which serves as the visual centerpiece.

---

## Interaction Patterns
- Immediate feedback on all actions
- Loading states during geocoding with progress indicator
- Toast notifications for errors (failed geocoding, API limits)
- Smooth map transitions when centering on results
- Keyboard navigation support for accessibility