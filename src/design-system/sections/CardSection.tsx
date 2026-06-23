import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
  Copyable,
} from '../components/DocPrimitives';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../app/components/ui/Card';
import { Button } from '../../app/components/ui/Button';

const CODE = `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Account balance</CardTitle>
    <CardDescription>Updated just now</CardDescription>
  </CardHeader>
  <CardContent>₱ 124,500.00</CardContent>
  <CardFooter>
    <Button size="sm">View statement</Button>
  </CardFooter>
</Card>`;

export function CardSection() {
  return (
    <Section
      id="card"
      title="Card"
      intro="The standard surface that groups related content: white, rounded-xl, hairline border, subtle shadow. Composed from header / title / description / content / footer parts."
    >
      <ImplementationMeta id="card" note="Parts are thin wrappers over div/h3/p — compose them; don't restyle the surface per page." />

      <Subsection title="Anatomy" description="Header (title + description), content, and an optional footer for actions.">
        <PreviewBox>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Account balance</CardTitle>
              <CardDescription>Updated just now</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums text-gray-900">₱ 124,500.00</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">View statement</Button>
            </CardFooter>
          </Card>
        </PreviewBox>
      </Subsection>

      <Subsection title="Content-only" description="Cards don't require a header — drop straight into CardContent for simple panels.">
        <PreviewBox className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-900">Simple panel</p>
              <p className="mt-1 text-sm text-gray-600">Default padding is p-6.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-900">Another panel</p>
              <p className="mt-1 text-sm text-gray-600">Same surface, consistent radius and shadow.</p>
            </CardContent>
          </Card>
        </PreviewBox>
      </Subsection>

      <Subsection title="Tokens">
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <span>Radius: <Copyable value="rounded-xl" /></span>
          <span>Border: <Copyable value="border-gray-200" /></span>
          <span>Shadow: <Copyable value="shadow-sm" /></span>
          <span>Padding: <Copyable value="p-6" /></span>
        </div>
      </Subsection>

      <AccessibilityNotes
        items={[
          'A Card is a presentational container — it adds no roles or focus behavior of its own.',
          'CardTitle renders an <h3>; keep the heading order sensible within the page outline.',
          'Interactive content inside a card (buttons, links) keeps its own semantics and focus ring.',
        ]}
      />

      <Subsection title="Usage">
        <DoDont
          dos={['Use CardHeader/Title/Description for titled cards.', 'Keep one consistent padding (p-6) across cards on a page.', 'Put actions in CardFooter.']}
          donts={['Don’t change the radius or border per card.', 'Don’t nest cards inside cards for layout.', 'Don’t use a card purely for spacing — use a plain div.']}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>
    </Section>
  );
}
