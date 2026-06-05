// Code Connect mapping: links the coded <Card> family to the GGX-SHADCN Figma "Card".
// Publish with: npx figma connect publish  (requires a Figma auth token)
// Excluded from the app build via tsconfig.app.json ("src/**/*.figma.tsx").
import figma from '@figma/code-connect';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';

figma.connect(
  Card,
  'https://www.figma.com/design/9zwtAL4RU3Y8WVRJAsSulX/?node-id=3321-344',
  {
    example: () => (
      <Card>
        <CardHeader>
          <CardTitle>Card title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>Card content</CardContent>
      </Card>
    ),
  },
);
