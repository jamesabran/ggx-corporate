# Design Token Pipeline — single source of truth

Goal: stop hand-reconciling tokens across code, the Figma design-system file, and the
app screens. Tokens are defined **once** and everything else is generated/synced from them.

```
                         tokens/tokens.json   ← single source of truth
                          /                \
        scripts/build-tokens.mjs        scripts/sync-figma-variables.mjs
                  |                                    |
        src/styles/theme.css                 Figma DS variables (9zwtAL4RU3Y8WVRJAsSulX)
        (generated, committed)               (radius/colors/spacing)
                  |                                    |
            the running app                     the App Screens file (ceL7…)
                                                 binds to DS variables
```

## Phase 2 — code is generated from tokens ✅ DONE
- `tokens/tokens.json` holds every theme token (colors, scalars, font, radius scale).
- `npm run tokens` runs `scripts/build-tokens.mjs` → regenerates `src/styles/theme.css`.
- `theme.css` is a **generated artifact, committed** so the app builds without anyone
  running the generator. Re-run `npm run tokens` whenever `tokens.json` changes, then
  commit both. Verified: regenerated output is declaration-for-declaration identical to
  the previous hand-authored file (77/77), and `npm run build` passes.
- Style Dictionary was intentionally **not** adopted — for ~40 tokens a 50-line emitter
  with byte-level control is lower-risk than a build dependency. Swap to Style Dictionary
  if the token set grows substantially.

## Phase 1 — radius scale aligned ✅ DONE (Figma side: pending publish)
- The code radius scale is shadcn `--radius` (base `0.625rem`): **sm6 / md8 / lg10 / xl14**.
- The DS file previously exposed only the *vanilla Tailwind* radius scale (sm/md/lg/xl =
  2/6/8/12) — the source of the mismatch that blocked radius variable binding.
- A new **`radius` variable collection** was created in the DS file matching the code scale,
  scoped to `CORNER_RADIUS`:
  | name | px | key |
  |---|---|---|
  | sm | 6  | `1a54776f189f1ed5adc9c8745f1b5ea47c9cdb15` |
  | md | 8  | `e5bfdcee693e950165806809b47b58eb3700a110` |
  | lg | 10 | `16fcf3eaf4cf17a7fbce0502fce44bdc431ca5d7` |
  | xl | 14 | `96942860a3871a37525c675ed6c1b06b22870eb8` |
- **HAND-OFF (you):** publish the GGX-SHADCN library in Figma so the App Screens file can
  import these variables. After publish, the cornerRadius binding pass over the App Screens
  can run (the colors/spacing passes are already done).

## Phase 3 — sync tokens → Figma
- `scripts/sync-figma-variables.mjs` (`npm run tokens:figma`) is the **CI/automation path**;
  it uses the Figma Variables REST API, which is **Enterprise-org gated for writes**.
  Needs env `FIGMA_TOKEN` (scope `file_variables:write`) + `FIGMA_DS_FILE`.
- On non-Enterprise plans, sync via the **Figma Plugin API** instead (how the `radius`
  collection above was created — works on any plan, no token).

## Phase 4 — Code Connect (Figma component ↔ code component) — prepared, pending publish
- `src/app/components/ui/Button.figma.tsx` and `Card.figma.tsx` map the coded components to
  their GGX-SHADCN Figma components (Button set `3321:130`, Card `3321:344`).
- `figma.config.json` registers them; `@figma/code-connect` is declared in devDependencies.
- Excluded from the app build via `tsconfig.app.json` (`src/**/*.figma.tsx`), so the bundle
  is unaffected.
- **HAND-OFF (you):** `npm i` then `npx figma connect publish` with a Figma auth token.
  Extend the same pattern to Input/Select/Badge/etc. once the two pilots are confirmed.

## Net effect
A token change is now one edit in `tokens.json` → `npm run tokens` (code) + sync (Figma).
No more per-element reconciliation passes; drift becomes a diffable, CI-checkable concern.
