import { useState } from 'react';
import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  SpecTable,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { LocationCascadeFields } from '../../app/components/LocationCascadeFields';
import { LocationCascadeCells } from '../../app/components/LocationCascadeCells';

const CODE_FIELDS = `import { LocationCascadeFields } from '@/app/components/LocationCascadeFields';

const [province, setProvince] = useState('');
const [city, setCity]         = useState('');
const [barangay, setBarangay] = useState('');

<LocationCascadeFields
  province={province}
  city={city}
  barangay={barangay}
  onChange={(p, c, b) => { setProvince(p); setCity(c); setBarangay(b); }}
  errors={{ province: !province && submitted }}
/>`;

const CODE_CELLS = `import { LocationCascadeCells } from '@/app/components/LocationCascadeCells';

// Used inside a <tr> — renders three <td> elements.
<LocationCascadeCells
  province={row.province}
  city={row.city}
  barangay={row.barangay}
  onChange={(p, c, b) => updateRow(rowIndex, p, c, b)}
  compact
  errors={{ province: !row.province }}
/>`;

export function LocationCascadeSection() {
  const [fProvince, setFProvince] = useState('');
  const [fCity, setFCity]         = useState('');
  const [fBarangay, setFBarangay] = useState('');

  const [cProvince, setCProvince] = useState('');
  const [cCity, setCCity]         = useState('');
  const [cBarangay, setCBarangay] = useState('');

  return (
    <Section
      id="location-cascade"
      title="Location Cascade"
      intro="Province → City / Municipality → Barangay cascade. Two variants: LocationCascadeFields for form layouts, LocationCascadeCells for editable table rows. Both use the GGX locations API and fall back to plain text inputs when the API is unreachable."
    >
      <ImplementationMeta
        id="location-cascade"
        note="LocationCascadeFields renders a React fragment of three labeled divs. LocationCascadeCells renders three <td> elements. Each variant lives in its own file."
      />

      <Subsection
        title="Form variant — LocationCascadeFields"
        description="Cascade rendered as three labeled form fields. Used in buyer checkout and address forms. Selects populate from the locations API; changing province resets city and barangay."
      >
        <PreviewBox>
          <div className="grid gap-3 sm:grid-cols-3 max-w-xl">
            <LocationCascadeFields
              province={fProvince}
              city={fCity}
              barangay={fBarangay}
              onChange={(p, c, b) => { setFProvince(p); setFCity(c); setFBarangay(b); }}
            />
          </div>
        </PreviewBox>
      </Subsection>

      <Subsection
        title="Table cell variant — LocationCascadeCells"
        description="Same cascade logic rendered as three <td> cells for editable bulk-upload rows and the in-app spreadsheet grid."
      >
        <PreviewBox className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Province</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">City / Municipality</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Barangay</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <LocationCascadeCells
                  province={cProvince}
                  city={cCity}
                  barangay={cBarangay}
                  onChange={(p, c, b) => { setCProvince(p); setCCity(c); setCBarangay(b); }}
                />
              </tr>
            </tbody>
          </table>
        </PreviewBox>
      </Subsection>

      <Subsection title="Props reference">
        <SpecTable
          columns={['Prop', 'Type', 'Description']}
          rows={[
            ['province', 'string', 'Controlled province value.'],
            ['city', 'string', 'Controlled city value.'],
            ['barangay', 'string', 'Controlled barangay value.'],
            ['onChange', '(p, c, b) => void', 'Called on any change; parent resets downstream values.'],
            ['errors?', '{ province?, city?, barangay? }', 'Red border on flagged fields.'],
            ['compact?', 'boolean (Cells only)', 'Tighter cell styling for spreadsheet grids.'],
            ['widthClass?', 'string (Cells only)', 'Tailwind width class applied to each cell (e.g. "w-40").'],
          ]}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE_FIELDS} />
        <div className="mt-4">
          <CodeBlock code={CODE_CELLS} />
        </div>
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={[
            'Use LocationCascadeFields inside form grids; it renders divs that fit naturally in a CSS grid.',
            'Use LocationCascadeCells inside <tr> — never outside a table row.',
            'Pass all three values and the onChange handler from the same parent state slice.',
            'Clear city and barangay when province changes — the onChange callback already does this.',
          ]}
          donts={[
            'Don\'t use free-text inputs for province/city/barangay; the cascade validates against the GGX locations API.',
            'Don\'t style the inner selects directly; apply widthClass for size and let the component handle layout.',
            'Don\'t keep city/barangay state when province is cleared — the component resets them automatically.',
          ]}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'Each select has an associated <label> with the field name.',
          'Dependent selects are disabled until their parent has a value, with placeholder text explaining why.',
          'The API-offline fallback renders plain text inputs with the same labels.',
          'Required-field errors show a red border; pair with a visible error message at the form level.',
        ]}
      />
    </Section>
  );
}
