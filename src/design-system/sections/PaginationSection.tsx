import { useState } from 'react';
import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { Pagination } from '../../app/components/ui/Pagination';

const CODE = `import { Pagination } from '@/app/components/ui/Pagination';

<Pagination
  summary={\`Showing \${shown} of \${total} transactions\`}
  onPrevious={prev}
  onNext={next}
  previousDisabled={page === 1}
  nextDisabled={page === lastPage}
/>`;

export function PaginationSection() {
  const total = 142;
  const pageSize = 20;
  const [page, setPage] = useState(1);
  const lastPage = Math.ceil(total / pageSize);
  const shown = Math.min(page * pageSize, total);
  const from = (page - 1) * pageSize + 1;

  return (
    <Section
      id="pagination"
      title="Pagination"
      intro="A list footer with a summary on the left and Previous / Next on the right. Extracted from the Transactions list footer."
    >
      <ImplementationMeta id="pagination" note="Stateless — the caller owns the page state and disables Previous/Next at the bounds." />

      <Subsection title="Live implementation" description="Interactive: Previous/Next move the demo page.">
        <PreviewBox>
          <Pagination
            summary={`Showing ${from}–${shown} of ${total} transactions`}
            onPrevious={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(lastPage, p + 1))}
            previousDisabled={page === 1}
            nextDisabled={page === lastPage}
          />
        </PreviewBox>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={['Show a clear "Showing X–Y of Z" summary.', 'Disable Previous/Next at the bounds.', 'Keep it at the bottom of the list.']}
          donts={['Don’t hide the total count.', 'Don’t leave both buttons enabled past the bounds.', 'Don’t use for very small lists that fit on one page.']}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'Wrapped in <nav aria-label="Pagination"> so assistive tech can find it.',
          'Previous/Next are real buttons; disable them at the first/last page.',
          'Keep a visible summary so users know where they are in the list.',
        ]}
      />


    </Section>
  );
}
