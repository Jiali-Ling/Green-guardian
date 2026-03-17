# Green Guardian

A progressive web application (PWA) for wildlife observation and environmental monitoring. Built with React 19, this app demonstrates modern web technologies including AI-powered species recognition, real-time GPS tracking, and basic offline support for cached resources.

Live Demo: https://green-guardian-rose.vercel.app/
Install as App: Supports "Add to Home Screen" on mobile devices

---

## Course Requirements Checklist

### Progressive Web App (PWA)
- Service Worker: Custom `service-worker.js` in `public/`
- Web App Manifest: Custom `manifest.json` in `public/` with app icons and standalone display
- Service Worker Registration: Manually registered in `src/main.jsx`
- Installability: Supports "Add to Home Screen" on compatible mobile browsers
- Offline Support: Basic offline support for cached static assets and previously loaded resources

### Device APIs Integration
- Camera API: `navigator.mediaDevices.getUserMedia()` for wildlife photography
- Webcam Capture: `react-webcam` for popup-based capture flow in observation detail
- Geolocation API: `navigator.geolocation` for GPS coordinates with accuracy tracking
- DeviceOrientation API: Compass and AR navigation features
- LocalStorage: Fallback/compatibility persistence for key app state
- IndexedDB (Dexie): Structured local database for observations and user cache

### Modern Technologies
- Framework: React 19.2.0 with Hooks and functional components
- Build Tool: Vite 7.3.1 with Hot Module Replacement (HMR)
- AI/ML: TensorFlow.js 4.22.0 + MobileNet for on-device species recognition
- Mapping: Leaflet 1.9.4 + React-Leaflet 5.0.0 for interactive maps
- Icons: Lucide React for consistent vector icons
- Animations: Framer Motion for smooth transitions

### User Experience
- Responsive Design: Mobile-first with breakpoints for tablet/desktop
- Dark Theme: Modern deep green (#3d5a3d) background with high contrast
- Accessibility: WCAG AA compliant color contrast ratios
- Touch Optimized: Large tap targets and gesture support
- Loading States: Skeleton screens and progress indicators

### Observation CRUD
- Create: Add observations from Scan (camera capture + AI prediction)
- Read: View observations in Feed, Map, and Profile
- Update: Edit your own observation species/description in the detail modal
- Delete: Delete your own observations from Feed/Profile

---

## Features

### Home Page
Scrolling landing page introducing app features with:
- Animated hero section with background image
- Statistics showcase (10K+ species, 50K+ users)
- Feature grid highlighting AI, GPS, Community, Conservation
- Step-by-step usage guide
- Conservation impact metrics

### AI Species Recognition
- Capture wildlife photos using device camera
- TensorFlow.js processes images locally (no server required)
- MobileNet model provides species predictions with confidence scores
- Works offline once model is loaded (~20MB)
- Fallback to manual entry if AI unavailable

### Interactive Map
- Leaflet map shows all observation locations
- Custom markers for different species
- Click markers to view observation details
- Real-time GPS positioning with blue location marker
- Zoom and pan with touch gestures

### Community Feed
- Grid layout of wildlife observations from all users
- Search bar for filtering by species name
- Filter toggle: "All Observations" / "My Observations"
- Like and comment on observations
- Nested comment system with replies
- Edit your own observations (species/description)
- Delete your own observations

### User Profile
- Personal statistics (observations, species, locations visited)
- Achievement badges with animated icons
- Recent observation history
- Editable profile (name, bio, avatar)

---

## Tech Stack

### Core
- React 19.2.0: UI framework with hooks
- Vite 7.3.1: Fast build tool with HMR
- TensorFlow.js 4.22.0: Machine learning framework
- MobileNet 2.1.1: Pre-trained image classification

### Mapping & Location
- Leaflet 1.9.4: Interactive maps
- React-Leaflet 5.0.0: React wrapper for Leaflet

### PWA & Storage
- Web App Manifest: Custom `manifest.json`
- Service Worker: Custom `service-worker.js`
- LocalStorage API: Compatibility fallback + UI preference persistence
- Dexie 4.x + IndexedDB: Primary structured local persistence layer
- dexie-react-hooks 4.x: Live query hook support for React components

### UI & Animation
- Lucide React 0.468.0: Icon library (100+ icons)
- Framer Motion 12.35.1: Animation library
- reactjs-popup 2.x: Modal popups for take-photo/view-photo workflow
- react-webcam 7.x: Camera preview and screenshot capture in popup

---

## PWA Setup

- Custom `manifest.json` is stored in `public/`
- Custom `service-worker.js` is stored in `public/`
- Service worker is manually registered in `src/main.jsx`
- The deployed app can be installed on supported mobile browsers using "Add to Home Screen"


## Installation & Usage

### Development Setup
```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure
```
green-guardian/
├── src/
│   ├── components/            # React components (11 files)
│   │   ├── HomePage.jsx           # Landing page with app intro
│   │   ├── BottomNav.jsx          # 5-tab navigation bar
│   │   ├── SpeciesScanner.jsx     # Camera + AI recognition
│   │   ├── CommunityFeed.jsx      # Observation grid feed
│   │   ├── MapViewModern.jsx      # Leaflet map integration
│   │   ├── UserProfile.jsx        # User stats & achievements
│   │   ├── SpeciesDetailModal.jsx # Observation detail view
│   │   ├── CommentSection.jsx     # Nested comment system
│   │   ├── BottomSheetModal.jsx   # Map marker details
│   │   ├── NavigationPanel.jsx    # AR navigation UI
│   │   └── ARCameraView.jsx       # AR compass overlay
│   ├── hooks/                 # Custom React hooks (3 files)
│   │   ├── useSpeciesRecognition.js # TensorFlow.js wrapper
│   │   ├── usePersistedState.js     # LocalStorage hook
│   │   └── useGeolocation.js        # GPS tracking hook
│   ├── styles/                # Component CSS files (12 files)
│   ├── utils/                 # Utility functions
│   │   └── helpers.js             # ID generation, formatters
│   ├── data/                  # Data files
│   │   └── sampleObservations.js  # Sample wildlife data
│   ├── db.jsx                 # Dexie schema + addPhoto/GetPhotoSrc helpers
│   ├── App.jsx                # Main app logic & routing
│   ├── App.css                # Global styles & variables
│   └── main.jsx               # React DOM entry point
├── public/
│   ├── images/wildlife/           # Sample observation photos
│   ├── icons/                     # PWA icons
│   ├── manifest.json              # Web app manifest
│   └── service-worker.js          # Custom service worker
├── vite.config.js             # Vite + PWA configuration
└── package.json               # Dependencies
```

---

## Usage Guide

### Navigation
The app has 5 main tabs in the bottom navigation:
- Home: Introduction and app features
- Feed: Community observations grid
- Scan: Camera for capturing wildlife
- Map: Interactive observation map
- Profile: User statistics and settings

### Taking Observations
1. Tap the Scan tab (camera icon)
2. Grant camera permissions when prompted
3. Point camera at wildlife and tap capture button
4. Wait for AI to analyze (first load downloads ~20MB model)
5. Review species prediction and confidence score
6. Add location notes or description
7. Tap Identify Species (or Save Photo fallback) to save the observation
8. After save, the app returns to Feed and opens the saved observation detail so you can edit immediately

### Exploring the Map
1. Tap the Map tab
2. View colored markers for different observations
3. Tap any marker to see observation details
4. Use zoom controls or pinch gestures
5. Blue marker shows your current GPS location
6. Sidebar lists all observations in current map view

### Community Interaction
1. Browse observations in the Feed tab
2. Use search bar to find specific species
3. Toggle filter: "All Observations" or "My Observations"
4. Tap any card to view full details
5. Like observations with heart button
6. Add comments and reply to others
7. Edit your own observations (species/description)
8. Open popup-based Take Photo / View Photo actions in observation detail
9. Delete your own observations (trash icon)

---

## PWA Installation

### Mobile Devices
1. Open the app in Chrome/Safari
2. Tap browser menu (⋮ or Share button)
3. Select "Add to Home Screen"
4. App icon appears on home screen
5. Launch like a native app (no browser UI)

### Desktop
1. Look for install icon in browser address bar
2. Click to install
3. App opens in standalone window

### Offline Usage
- Service worker caches all pages and assets
- Take photos and observations offline
- Locally stored data remains available after connection is restored
- AI model persists once downloaded
- View previously loaded observations

---

## Device API Requirements

### Camera Access
- Desktop: HTTPS required (localhost works for dev)
- Mobile: HTTPS required on iOS Safari
- Grant permission when browser prompts
- Use rear camera (environment facing) by default

### GPS Location
- Grant permission for precise location
- Works in background when app is active
- Accuracy varies (typically 5-50 meters)
- Fallback to default location if denied

### Browser Compatibility
- Chrome/Edge 90+ (Recommended)
- Safari 15+ (iOS 15+)
- Firefox 88+

---

## Real Device Verification Checklist

- Open the deployed Vercel link on a real phone
- Camera permission can be granted and camera opens successfully
- Geolocation permission can be granted and coordinates are stored
- "Add to Home Screen" / installation option is available
- Installed app icon can launch the app
- Edit observation workflow works (edit species/description and save)

---

## Design System

### Color Palette
```css
/* Primary Colors */
--bg: #3d5a3d;          /* Deep forest green background */
--bg-soft: #4a6350;     /* Medium green */
--bg-dark: #2d4a2d;     /* Darkest green */

/* Text Colors */
--text: #ffffff;         /* White for dark backgrounds */
--text-dark: #1a3a1a;   /* Dark for light panels */

/* Accent Colors */
--primary: #7fb800;      /* Bright lime green */
--secondary: #81b29a;    /* Sage green */
--muted: #a3c9a3;        /* Light muted green */

/* Panel/Card */
--panel: #ffffff;        /* White cards on dark bg */
```

### Typography
- UI Font: System font stack (optimized per OS)
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)
- Contrast: WCAG AA compliant (white on #3d5a3d = 8.67:1)

### Animations
- Timing: cubic-bezier(0.4, 0, 0.2, 1) universally
- Hover: translateY(-2px to -8px) with shadow increase
- Active: scale(0.95-0.98) for press feedback
- Entry: fadeIn, fadeInUp, slideInDown, bounceIn
- Scroll: Parallax effects and staggered animations

---

## File Size & Performance

### Initial Load
- HTML/CSS/JS: ~500KB (gzipped)
- Icons: Inline SVG (no external requests)
- Images: Lazy loaded on scroll

### AI Model
- MobileNet v1 (alpha 0.25): ~20MB
- Downloads on first camera use
- Cached by browser storage/service worker after first load
- Fallback: manual species entry if model fails

### Optimization
- Code splitting per route
- Image compression (JPEG 95% quality)
- Service worker caches everything after first visit
- No external API calls (fully local)

---

## Development Notes

### State Management
- React hooks (useState, useEffect, useMemo)
- Dexie (IndexedDB) for structured persistent observation/user data
- LocalStorage as compatibility fallback and preference storage
- No Redux/external state library needed

### Dexie Lab Week 07 Alignment (Step 1-7)
- Step 1 (Imports): `src/db.jsx` imports `dexie` and `dexie-react-hooks` (`useLiveQuery`)
- Step 2 (Database instance): creates a Dexie database instance for the app
- Step 3 (Table schema): includes a `photos` table with primary key `id` (image data is not indexed)
- Step 4/5 (Async photo write): `addPhoto(id, imgSrc)` uses `async` + `try/catch` to store photo data (base64/data URL) keyed by observation id and returns id/null
- Photos synchronization: the app also rebuilds `photos` from current observation photo fields to keep IndexedDB data visible/consistent in DevTools
- Step 6 (Live read hook): `GetPhotoSrc(id)` reads from `photos` using `useLiveQuery` and returns `img[0].imgSrc` when available
- Step 7 (Exports): helper functions are exported together at the bottom of `src/db.jsx` (e.g., `export { addPhoto, GetPhotoSrc, ... }`)

### UI Adaptation Alignment (Todo.jsx-style)
- Observation detail component imports and uses: `Popup` (`reactjs-popup`), popup CSS, `Webcam` (`react-webcam`), and `{ addPhoto, GetPhotoSrc }` from `db.jsx`
- Uses a `viewTemplate`-style JSX variable pattern before returning (structure aligned with tutorial style)
- Uses `Popup trigger={...} modal` for both "Take Photo" and "View Photo" interactions
- The modal includes map and SMS sharing links for location context
- Take Photo popup writes to Dexie through `addPhoto`
- View Photo popup reads from Dexie via `GetPhotoSrc`

### Styling Approach
- Component-scoped CSS files
- CSS custom properties for theming
- No CSS-in-JS or Tailwind
- Mobile-first breakpoints (768px, 1024px)

### Data Flow
```
App.jsx (parent)
  ├─ observations (state)
  ├─ userLocation (state)
  ├─ currentView (state)
  └─ passes down via props/callbacks
      ├─ CommunityFeed: displays observations
      ├─ MapViewModern: maps observations
      ├─ SpeciesScanner: adds new observations
      └─ UserProfile: filters user's observations
```

---

## Known Limitations

1. AI Accuracy: MobileNet trained on ImageNet (general objects), not specialized wildlife database. Predictions may be generic.
2. Offline Support: Core static assets and previously cached resources remain available offline
3. HTTPS Required: Camera/GPS APIs require secure context.
4. Browser Support: Safari < 15 may have limited functionality.
5. Storage Limits: Browser may clear cache if storage runs low.

---

## Future Enhancements (Not Implemented)

- Backend API for cross-device sync
- User authentication (currently local-only)
- Cloud image storage (currently browser cache)
- Real-time collaboration features
- Push notifications
- Advanced filters (date range, location radius)
- Export observations as CSV/JSON

---

## Academic Context

Course: Dynamic Web Technologies  
Institution: The University of The West of Scotland
Year: 2025-2026  
Purpose: Educational project demonstrating PWA development

### Assignment Requirements Met
- Progressive Web App with Service Worker  
- Web App Manifest for installation  
- Basic offline support for cached assets/resources  
- Device API integration (Camera, GPS, Orientation)  
- Modern JavaScript framework (React 19)  
- Responsive mobile-first design  
- Local data persistence (Dexie/IndexedDB + LocalStorage fallback)  
- Third-party library integration (TensorFlow.js, Leaflet)  
- Clean code structure with components  
- Professional UI/UX design

---

## Credits & Attribution

### Open Source Libraries
- TensorFlow.js: Apache 2.0 License
- MobileNet: Apache 2.0 License
- Leaflet: BSD-2-Clause License
- React: MIT License
- Lucide Icons: ISC License
- Framer Motion: MIT License

### Design Inspiration
- Modern travel and nature apps
- iOS/Android native design patterns
- Material Design 3 principles

### Sample Data
- Wildlife images sourced from public domain/Creative Commons
- Observer names and descriptions are fictional for demonstration

---

## License

This project is for educational purposes only as part of university coursework.  
Not intended for commercial use or public distribution.

Copyright © 2026 [Your Name]  
All Rights Reserved

---

## Developer

Name: Jiali Ling 
Student ID: B01812585@studentmail.uws.ac.uk  
Email: B01812585@studentmail.uws.ac.uk 
GitHub: https://github.com/Jiali-Ling/Green-guardian.git

---

## Acknowledgments

Special thanks to:
- Course instructors for project guidance
- TensorFlow.js team for ML documentation
- Leaflet community for mapping examples
- React community for development tools

---

Last Updated: March 2026  
Version: 1.0.0  
Status: Completed
