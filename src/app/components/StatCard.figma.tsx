// Code Connect mapping: links the coded <StatCard> to the GGX-SHADCN Figma
// "Stat Card" component (rebuilt S30 as a single usage-focused component).
// Publish with: npx figma connect publish  (requires a Figma auth token)
// Excluded from the app build via tsconfig.app.json ("src/**/*.figma.tsx").
import figma from '@figma/code-connect';
import { IconActivity } from '@tabler/icons-react';
import { StatCard } from './StatCard';

figma.connect(
  StatCard,
  'https://www.figma.com/design/9zwtAL4RU3Y8WVRJAsSulX/?node-id=3351-81',
  {
    props: {
      label: figma.string('Label'),
      value: figma.string('Value'),
      // Subtitle is gated by the Figma "Show subtitle" boolean.
      sub: figma.boolean('Show subtitle', {
        true: figma.string('Subtitle'),
        false: undefined,
      }),
    },
    // icon / iconBg / iconColor are per-instance overrides in Figma (color is not
    // a variant); shown here with a representative example.
    example: ({ label, value, sub }) => (
      <StatCard
        label={label}
        value={value}
        sub={sub}
        icon={IconActivity}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
      />
    ),
  },
);
