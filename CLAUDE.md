# CLAUDE.md
# Project: Hometown Play Mats (Custom Street Play Mats)
# Role: Senior Frontend Architect / Product Manager

## Tech Stack (Strict)
- **Frontend:** React + Vite
- **Styling:** TailwindCSS
- **Map Engine:** Mapbox GL JS (NOT Google Maps)
- **Language:** JavaScript (JSX)
- **Package Manager:** npm

## Core Product Rules (The "Vibe")
1.  **The "Hot Wheels" Rule:** All roads must be styled with wide vectors (min-width: 20px on screen) to ensure physical toy cars fit.
2.  **No Labels:** We are building a *toy*, not a GPS. Hide all text labels (street names, POIs) by default.
3.  **High Contrast:** Use "Cartoon" colors (Vibrant Green #4CAF50 grass, Dark Grey #333 roads, Yellow #FFEB3B center lines).
4.  **Rotation is Key:** The user *must* be able to rotate the map canvas so their street aligns with the mat's edge.

## Architecture Guidelines
- **Component Isolation:** One component per file.
- **Environment Variables:** Never hardcode the Mapbox API key. Use `import.meta.env.VITE_MAPBOX_TOKEN`.
- **State Management:** Keep map state (zoom, center, pitch) in a top-level hook or context so we can export it later.

## Development Workflow
- **Step 1:** Explain the plan in 3 bullet points.
- **Step 2:** Write the code.
- **Step 3:** Suggest a verification step (e.g., "Check if the map renders at localhost:5173").