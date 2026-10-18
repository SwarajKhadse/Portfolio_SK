# Portfolio light-blue v4 — airport journey / camera + landing gear

## Install

1. Back up the project's current `src/` folder.
2. Replace it with this package's `src/` folder.
3. Keep the root files and `public/` folder from the existing project.
4. Confirm `public/models/aircraft3.glb` exists. The originally uploaded V1 project included this file. It is used as the landing-gear model so the original `public/models/aircraft.glb` remains untouched.
5. Run the project using its existing Vite setup.

## Changes

- Hero composition: larger aircraft, positioned left of the story copy, saturated blue livery, a clear `ideas take flight` headline, and a working “follow the route” CTA.
- Aircraft: uses `public/models/aircraft3.glb` and adds six torus tyres, hubs, landing struts and braces in code. Tyres roll with journey progress.
- Camera: aircraft-relative camera framing changes across the journey: close low taxi shot, wide U-turn, elevated angle 5 route shot, runway alignment, rear-follow takeoff and wider in-flight follow.
- Ground guidance: a blue route line follows the aircraft's ground path.
- Cursor: custom cursor component and its CSS are removed; the browser's default cursor is used.
- Visual language: light surfaces, saturated blue, restrained coral, lowercase visual copy, clean spacing.
- Existing `public/models/aircraft.glb` is not modified.

## Validation

All JSX/JS files passed a TypeScript syntax transpile check, local relative imports resolved, and all CSS files parsed. A complete browser/Vite run was not possible from the uploaded archive because it did not contain `package.json` or Vite configuration.
