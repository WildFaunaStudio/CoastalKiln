# Coastal Kiln - Progress File

**Last Updated:** 2026-02-07

## Project Overview
A pottery companion app for tracking pieces, glazes, and sustainable clay reclaim. Built with React + Vite, styled with Tailwind CSS, with Supabase backend.

## Current Status
App is fully functional in **offline/localStorage mode** and in **Chrome Incognito**. Regular Chrome may have browser extension conflicts causing Supabase AbortErrors - clear browser cache/extensions to fix.

---

## Completed Features

### Core App
- [x] Authentication (Supabase Auth) - sign in, sign up, password reset
- [x] Offline mode with localStorage fallback
- [x] PWA support (manifest.json, service worker, installable on mobile)
- [x] Custom loading screen with loading.gif
- [x] Custom login screen with pottery characters illustration

### Pieces (Projects)
- [x] Create pieces with name, clay body, photo
- [x] **Stage selection at creation** (wedging, throwing, trimming, drying, bisque, glazing, firing, complete)
- [x] **Glaze assignment** - select from saved glazes via checkboxes
- [x] **Custom glaze input** - type any glaze name directly
- [x] Progress pieces through stages
- [x] Add photos at each stage
- [x] Add notes per stage
- [x] Photo upload to Supabase Storage

### Glaze Garden
- [x] Create glazes with name, firing type, recipe
- [x] Add test tile photos
- [x] View glaze details and tiles

### Sustainable Studio
- [x] Clay Reclaim tracking (batches, weight, status)
- [x] Studio Tips with categories (clay_reclaim, diy_tools, plaster_bats, other)
- [x] **Tips view toggle** - Grouped by category OR flat list (All)

### Guilds
- [x] Create/join guilds with invite codes
- [x] Guild posts (discussion)
- [x] **Guild resource uploads** - PDF files or URL links
- [x] Member lists

### UI/Design
- [x] Custom color palette:
  - Background: #F0EEE8
  - Pieces: #BC978A
  - Glaze Garden: #6D72C3
  - Clay Reclaim: #FF8C42
  - Studio Tips: #4A5240
  - My Guilds: #06A77D
  - Discover: #07C592
- [x] Only active nav buttons are colored, others white
- [x] Icon style: unselected = colored circle/white icon, selected = white circle/colored icon
- [x] Camera capture enabled on photo inputs for mobile

---

## File Structure

```
src/
├── App.jsx              # Main app component
├── main.jsx             # Entry point
├── index.css            # Tailwind styles
├── contexts/
│   └── AuthContext.jsx  # Auth state management
├── lib/
│   ├── supabase.js      # Supabase client config
│   └── api/
│       ├── auth.js      # Auth API calls
│       ├── profiles.js  # Profile API calls
│       ├── projects.js  # Projects/pieces API
│       ├── glazes.js    # Glazes API
│       └── guilds.js    # Guild resource uploads
├── pages/
│   └── AuthScreen.jsx   # Login/signup screen
└── utils/
    ├── constants.js     # App constants (tip categories, etc.)
    └── storage.js       # localStorage wrapper

public/
├── manifest.json        # PWA manifest
├── service-worker.js    # PWA service worker
├── CoastalKilnLogo.png  # App logo
├── loading.gif          # Loading animation
├── login-image.png      # Login screen illustration
└── icons/               # PWA icons
```

---

## Known Issues

### Supabase AbortError in Regular Chrome
- **Symptom:** "AbortError: signal is aborted without reason" on all Supabase calls
- **Cause:** Browser extension interference (ad blockers, privacy extensions)
- **Fix:**
  1. Clear browser cache/site data for localhost
  2. Disable extensions, OR
  3. Use Chrome Incognito (works perfectly)
- **Workaround:** App works fully in offline/localStorage mode

---

## Technical Notes

### Supabase Configuration
- Version: @supabase/supabase-js@2.21.0 (stable)
- Auth: Email/password with implicit flow
- Storage buckets: project-photos, glaze-tiles, guild-resources

### Form State (App.jsx)
```javascript
const [form, setForm] = useState({
  // Pieces
  title: '', clay: '', photo: null, photoFile: null,
  pieceStage: 'wedging', pieceGlazes: [], customGlaze: '',

  // Glazes
  name: '', type: '', recipe: '',

  // Reclaim
  weight: '', source: '', batchNotes: '',

  // Tips
  tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [],

  // Guilds
  guildName: '', guildLocation: '', guildDesc: '', inviteCode: '',
  guildPost: '', resourceTitle: '', resourceType: 'PDF', resourceUrl: '', resourceFile: null,

  // Settings
  feedback: ''
});
```

### Piece Data Structure
```javascript
{
  id: string,
  title: string,
  clay: string,
  stage: 'wedging' | 'throwing' | 'trimming' | 'drying' | 'bisque' | 'glazing' | 'firing' | 'complete',
  date: string,
  photos: [{ id, url, storage_path? }],
  notes: { [stage]: string },
  glazeIds: string[],      // IDs of saved glazes
  customGlaze: string      // Free-text glaze name
}
```

---

## Deployment

### Vercel
- Deploy: `npx vercel --prod --yes`
- Environment variables needed:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY

### Local Development
```bash
npm run dev  # Runs at http://localhost:3000/
```

---

## Next Steps (Potential)
- [ ] Edit existing pieces (change stage, glazes, etc.)
- [ ] Delete pieces
- [ ] Glaze editing
- [ ] Search/filter pieces
- [ ] Export data
- [ ] Sync localStorage to Supabase when coming online
