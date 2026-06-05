// Sync canonical tokens (tokens/tokens.json) -> Figma design-system variables.
//
// This is the CI / automation path and uses the Figma Variables REST API, which
// is **Enterprise-org gated** for writes. If you are not on an Enterprise plan,
// use the Plugin-API path instead (Claude/Figma MCP `use_figma`, or a small
// in-Figma plugin) — see docs/design_system_rules.md "Token sync".
//
// Required env:
//   FIGMA_TOKEN     - personal access token with file_variables:write scope
//   FIGMA_DS_FILE   - design-system file key (e.g. 9zwtAL4RU3Y8WVRJAsSulX)
//
// What it syncs (extend as needed):
//   radius.px {sm,md,lg,xl} -> FLOAT variables in a "radius" collection
//   (colors/spacing already exist in the DS as tw/* collections; this script
//    focuses on the semantic tokens the code owns and Figma must mirror.)
//
// Run: FIGMA_TOKEN=... FIGMA_DS_FILE=... node scripts/sync-figma-variables.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const TOKEN = process.env.FIGMA_TOKEN;
const FILE = process.env.FIGMA_DS_FILE;
if (!TOKEN || !FILE) {
  console.error('Missing FIGMA_TOKEN and/or FIGMA_DS_FILE env vars.');
  console.error('This script needs an Enterprise-plan token (file_variables:write).');
  console.error('On non-Enterprise plans, sync via the Figma Plugin API instead.');
  process.exit(1);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(resolve(root, 'tokens/tokens.json'), 'utf8'));

const api = (path, init = {}) =>
  fetch(`https://api.figma.com/v1/files/${FILE}/variables${path}`, {
    ...init,
    headers: { 'X-Figma-Token': TOKEN, 'Content-Type': 'application/json', ...(init.headers || {}) },
  }).then(async (r) => {
    const body = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(body)}`);
    return body;
  });

// 1. Read current variables/collections to find or create the "radius" collection.
const local = await api('/local');
const collections = local.meta?.variableCollections ?? {};
let radiusCol = Object.values(collections).find((c) => c.name === 'radius');

const payload = { variableCollections: [], variables: [], variableModeValues: [] };

const COL_TMP = 'col_radius';
if (!radiusCol) {
  payload.variableCollections.push({
    action: 'CREATE', id: COL_TMP, name: 'radius',
    initialModeId: 'mode_default',
  });
}
const colId = radiusCol ? radiusCol.id : COL_TMP;
const modeId = radiusCol ? radiusCol.defaultModeId : 'mode_default';

const existing = Object.values(local.meta?.variables ?? {});
for (const [name, px] of Object.entries(tokens.radius.px)) {
  const found = existing.find((v) => v.name === name && v.variableCollectionId === colId);
  const varTmp = found ? found.id : `var_radius_${name}`;
  if (!found) {
    payload.variables.push({
      action: 'CREATE', id: varTmp, name, variableCollectionId: colId,
      resolvedType: 'FLOAT', scopes: ['CORNER_RADIUS'],
    });
  }
  payload.variableModeValues.push({ variableId: varTmp, modeId, value: px });
}

const res = await api('', { method: 'POST', body: JSON.stringify(payload) });
console.log('✓ Synced radius tokens to Figma:', JSON.stringify(tokens.radius.px));
console.log('  Response:', JSON.stringify(res.meta ?? res));
console.log('  NOTE: publish the library in Figma so consuming files pick up the changes.');
