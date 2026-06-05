// Code Connect mapping: links the coded <Button> to the GGX-SHADCN Figma "Buttons" set.
// Publish with: npx figma connect publish  (requires a Figma auth token)
// Excluded from the app build via tsconfig.app.json ("src/**/*.figma.tsx").
import figma from '@figma/code-connect';
import { Button } from './Button';

figma.connect(
  Button,
  'https://www.figma.com/design/9zwtAL4RU3Y8WVRJAsSulX/?node-id=3321-130',
  {
    props: {
      // Code variants map 1:1 to the overlapping Figma "Variant" options.
      // (Figma extras — Rounded/icon/loading/with icon/trailing icon — have no
      //  code prop equivalent and are intentionally not mapped.)
      variant: figma.enum('Variant', {
        default: 'default',
        secondary: 'secondary',
        outline: 'outline',
        ghost: 'ghost',
        link: 'link',
        destructive: 'destructive',
      }),
      size: figma.enum('Size', {
        default: 'default',
        sm: 'sm',
        lg: 'lg',
      }),
    },
    example: ({ variant, size }) => (
      <Button variant={variant} size={size}>
        Button
      </Button>
    ),
  },
);
