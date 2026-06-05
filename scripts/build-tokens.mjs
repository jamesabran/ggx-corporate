// Generates src/styles/theme.css from tokens/tokens.json (the single source of truth).
// Run: node scripts/build-tokens.mjs   (or: npm run tokens)
//
// theme.css is a GENERATED artifact and is committed so the app builds without
// running this script. Re-run it whenever tokens.json changes, then commit both.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(resolve(root, 'tokens/tokens.json'), 'utf8'));
const out = resolve(root, 'src/styles/theme.css');

const { color, scalar, font, radius } = tokens;

const rootLines = [];
// scalars
for (const [k, v] of Object.entries(scalar)) rootLines.push(`  --${k}: ${v};`);
// colors
for (const [k, v] of Object.entries(color)) rootLines.push(`  --${k}: ${v};`);
// radius base
rootLines.push(`  --radius: ${radius.base};`);

const themeLines = [];
themeLines.push(`  --font-sans: ${font.sans};`);
for (const k of Object.keys(color)) themeLines.push(`  --color-${k}: var(--${k});`);
for (const [k, v] of Object.entries(radius.css)) themeLines.push(`  --radius-${k}: ${v};`);

const css = `/* AUTO-GENERATED from tokens/tokens.json by scripts/build-tokens.mjs — do not edit by hand. */
@custom-variant dark (&:is(.dark *));

:root {
${rootLines.join('\n')}
}

@theme inline {
${themeLines.join('\n')}
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  html {
    font-size: var(--font-size);
  }

  body {
    @apply bg-background text-foreground;
    font-family: var(--font-sans);
  }
}
`;

writeFileSync(out, css);
console.log(`✓ Wrote ${out}`);
console.log(`  ${Object.keys(color).length} colors, ${Object.keys(scalar).length} scalars, radius base ${radius.base} (sm${radius.px.sm}/md${radius.px.md}/lg${radius.px.lg}/xl${radius.px.xl})`);
