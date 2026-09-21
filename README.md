# PPT Player Game

> **High-energy, 100% browser-based presentation & game-show scoreboard.**  
> Completely free, zero external APIs, zero paid services, and zero network dependencies. Runs entirely inside your browser.

![License](https://img.shields.io/badge/License-MIT-green.svg)
![Mode](https://img.shields.io/badge/Architecture-100%25%20Client--Side-blue.svg)
![Audio](https://img.shields.io/badge/Audio-Web%20Audio%20API-orange.svg)
![PowerPoint](https://img.shields.io/badge/PowerPoint-.pptx%20Native%20Parsing-red.svg)
![Theme](https://img.shields.io/badge/Theme-Dark%20Mode%20Default-black.svg)

---

## ⚡ Highlights

- **100% Free & Browser-Native**: Operates completely offline without external APIs, tokens, third-party backend servers, or trackers.
- **Native PowerPoint Support (.pptx)**: Drag and drop or upload any Microsoft PowerPoint presentation. Renders slides directly in the browser with full typography, shapes, and media fidelity powered by `@aiden0z/pptx-renderer` and `jszip`.
- **Dual Match Modes**:
  - **Teams Mode**: 2 to 4 Teams (Team A, Team B, Team C, Team D) with quick keyboard triggers (`A`, `B`, `C`, `D`).
  - **Members Mode**: 2 to 20 individual contestants with customizable player names, color badges, and randomized expressive emoji avatars.
- **Synthesized Audio Engine**: Pleasant harmonic chimes, slide transition whooshes, match resets, and victory fanfares generated purely in real-time via the browser's native **Web Audio API** — zero external MP3/WAV files required.
- **Instant Hotkey Scoring**: Award points instantly during live gameplay using number keys (`1`–`4`), letter keys (`A`–`D`), or quick micro-buttons on screen.
- **Interactive Slide Navigator**: Bottom progress bar with live hover previews, plus a full slide drawer (`Layers` button or `S`) to jump to any slide instantly.
- **Grand Winner Celebration**: Press `W` to open the winner podium, displaying first-place champions, runner-up standings, match point totals, and multi-stage confetti cracker cannons.
- **Production-Ready & Accessible**: Fully accessible (WCAG AA compliant, ARIA live regions for screen readers, keyboard navigable, visible focus rings, minimum 44px touch targets).

---

## 🎮 Keyboard Shortcuts Cheatsheet

Control the entire match without lifting your hands from the keyboard:

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| **`1`** or **`A`** | **+10 Points (Player/Team 1)** | Awards 10 points to Cyan / Team A with pleasant audio chime |
| **`2`** or **`B`** | **+10 Points (Player/Team 2)** | Awards 10 points to Rose / Team B with pleasant audio chime |
| **`3`** or **`C`** | **+10 Points (Player/Team 3)** | Awards 10 points to Amber / Team C |
| **`4`** or **`D`** | **+10 Points (Player/Team 4)** | Awards 10 points to Emerald / Team D |
| **`→`** or **`Space`** or **`PageDown`** | **Next Slide** | Advances presentation stage to the next slide |
| **`←`** or **`Backspace`** or **`PageUp`** | **Previous Slide** | Goes back to the preceding slide |
| **`W`** | **Declare Winner** | Opens winner celebration podium with victory fanfare and confetti crackers |
| **`T`** | **Teams / Members Setup** | Configures match mode, participant count, names, and emoji avatars |
| **`R`** | **Reset Scores** | Resets all scores back to 0 with undo notification |
| **`F`** | **Toggle Fullscreen** | Switches stage between standard and immersive theater fullscreen |
| **`M`** | **Mute / Unmute Sound** | Toggles synthesized Web Audio sound effects on/off |
| **`?`** | **Help / Shortcuts** | Opens keyboard shortcuts cheat sheet modal |
| **`Esc`** | **Close / Exit** | Closes any open modal, dialog, or drawer |

---

## 🛠️ Architecture & Tech Stack

```
ppt-player-game/
├── public/
│   ├── favicon.svg             # High-contrast vector SVG favicon
│   └── ...
├── src/
│   ├── components/
│   │   ├── TopHeader.tsx       # Capsule header (deck selector, theme, audio, fullscreen)
│   │   ├── SlideViewer.tsx     # Presentation stage with PPTX rendering & answer reveals
│   │   ├── BottomScoreBar.tsx  # Dynamic dock with participant pods & score controls
│   │   ├── ScoreJumpOverlay.tsx# Floating score animation rising up the stage
│   │   ├── WinnerModal.tsx     # Winner podium, celebration statistics & confetti cannons
│   │   ├── TeamSetupModal.tsx  # Modal to configure 2-4 teams or 2-20 individual members
│   │   ├── ThumbnailsDrawer.tsx# Slide drawer with thumbnail previews
│   │   ├── SlideThumbnailPreview.tsx # Thumbnail renderer for slides
│   │   └── ShortcutsModal.tsx  # Keyboard shortcuts reference dialog
│   ├── data/
│   │   └── defaultDecks.ts     # Built-in high-energy trivia and quiz decks
│   ├── utils/
│   │   ├── audio.ts            # Web Audio API real-time synthesizer (zero audio downloads)
│   │   ├── db.ts               # IndexedDB storage for offline PPTX file retention
│   │   ├── pptxEngine.ts       # PPTX generation, conversion & viewer manager
│   │   ├── pptxParser.ts       # JSZip & XML parser for custom PPTX slides
│   │   └── storage.ts          # LocalStorage persistence (scores, theme, history)
│   ├── App.tsx                 # Root coordinator & state container
│   ├── types.ts                # TypeScript domain models & interfaces
│   ├── main.tsx                # React DOM entry point
│   └── index.css               # Tailwind CSS styles & high-contrast tokens
├── index.html                  # HTML entry point with metadata & SEO tags
├── metadata.json               # Application capabilities & permissions manifest
├── package.json                # Project dependencies and build scripts
└── vite.config.ts              # Vite configuration
```

### Key Libraries Used:
- **React 19** + **TypeScript**: Strict type-safe UI components and reactive state.
- **Tailwind CSS v4**: Utility-first responsive design matching the clean, high-contrast arcade aesthetic.
- **Motion (`motion/react`)**: Smooth physics-based enter/exit transitions for dialogs and toasts.
- **@aiden0z/pptx-renderer**: Client-side parsing and canvas/DOM rendering of Microsoft PowerPoint files.
- **canvas-confetti**: Hardware-accelerated canvas confetti cannons for the winner podium.
- **IndexedDB**: Persistent local presentation storage without sending user files to any cloud or remote servers.
- **Web Audio API**: Synthesized procedural chimes and fanfare with zero audio asset overhead.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Modern web browser (Chrome, Edge, Safari, Firefox)

### Installation & Local Run

1. **Clone or download the project files**:
   ```bash
   git clone <repo-url>
   cd ppt-player-game
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```
   The optimized static distribution will be generated in `dist/`. You can serve `dist/` directly with any static file server (Nginx, GitHub Pages, Vercel, Netlify, Cloudflare Pages) with zero configuration.

---

## 🔒 Privacy & Offline Guarantee

- **No Remote Telemetry**: Your presentations, questions, team rosters, and scores are never transmitted across the network.
- **Local Sandbox**: All PowerPoint parsing is executed within your browser thread using WebAssembly, JSZip, and local HTML5 Canvas.
- **Local Persistence**: PPTX files uploaded during your session are stored in your device's browser **IndexedDB**, surviving page reloads without requiring re-uploading.
- **Clear Data Anytime**: Use the **Reset** button or clear site data in your browser settings to wipe all local cache instantly.

---

## ♿ Accessibility & Best Practices

- **WCAG AA Compliance**: High contrast ratios across all text elements in both Dark and Light modes.
- **Screen Reader Announcements**: Live region (`aria-live="polite"`) delivers non-intrusive updates when points are scored or rounds change.
- **Full Keyboard Operability**: Every feature can be triggered via keyboard without requiring mouse interaction.
- **Skip Links & Focus Trapping**: Modals trap focus and close cleanly on `Escape`.
- **Responsive Layouts**: Designed to look great on tablets, laptops, widescreen monitors, and overhead theater projectors.

---

## 📄 License

MIT License — Free to use, modify, and present anywhere!
