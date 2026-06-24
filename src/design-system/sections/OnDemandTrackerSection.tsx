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
import {
  OnDemandBadge,
  OnDemandRoute,
  OnDemandTimeline,
} from '../../app/components/OnDemandTracker';
import { OnDemandMap } from '../../app/components/OnDemandMap';
import { getOnDemandProgress } from '../../app/data/onDemandDelivery';

const PICKUP  = { name: 'Acme Luzon — Makati Hub', address: '5F ABC Bldg, Ayala Ave, Makati' };
const DROPOFF = { name: 'Juan Dela Cruz', address: 'Unit 3B, XYZ Residences, Diliman, QC' };

const PROGRESS_EN_ROUTE  = getOnDemandProgress('en_route');
const PROGRESS_SEARCHING = getOnDemandProgress('looking_for_driver');
const PROGRESS_DELIVERED = getOnDemandProgress('delivered');

const CODE = `import {
  OnDemandBadge,
  OnDemandRoute,
  OnDemandTimeline,
} from '@/app/components/OnDemandTracker';
import { OnDemandMap } from '@/app/components/OnDemandMap';
import { resolveOnDemandProgress } from '@/app/services/transactionService';

const progress = resolveOnDemandProgress(transaction);

<OnDemandBadge />

<OnDemandRoute
  pickup={{ name: sender.name, address: sender.address }}
  dropoff={{ name: recipient.name, address: recipient.address }}
/>

<OnDemandMap progress={progress} className="rounded-xl" />

<OnDemandTimeline progress={progress} />`;

export function OnDemandTrackerSection() {
  return (
    <Section
      id="on-demand-tracker"
      title="On-Demand Tracker"
      intro="Composable UI pieces for On-Demand delivery tracking. Four components — Badge, Route, Map, Timeline — are used together in Transaction Details and the public /track page to show the live delivery state. All values are presentation-only; dispatch status, ETAs, and rider position come from the backend."
    >
      <ImplementationMeta
        id="on-demand-tracker"
        note="Used on TransactionDetails, TrackingPage, and StorefrontOrderDetail. OnDemandMap is a mocked map mockup — no real tiles or geolocation."
      />

      <Subsection title="OnDemandBadge" description="Violet On-Demand service chip. Used in transaction list rows and detail headers alongside the service type.">
        <PreviewBox className="flex items-center gap-3">
          <OnDemandBadge />
          <OnDemandBadge className="text-sm" />
        </PreviewBox>
      </Subsection>

      <Subsection
        title="OnDemandRoute"
        description="Pickup → drop-off address pair shown above the map and timeline."
      >
        <PreviewBox>
          <OnDemandRoute pickup={PICKUP} dropoff={DROPOFF} />
        </PreviewBox>
      </Subsection>

      <Subsection
        title="OnDemandMap — en route"
        description="Mocked delivery tracking map. Rider position moves along the route based on the delivery stage."
      >
        <PreviewBox>
          <OnDemandMap progress={PROGRESS_EN_ROUTE} className="rounded-xl" />
        </PreviewBox>
      </Subsection>

      <Subsection title="OnDemandMap — looking for driver">
        <PreviewBox>
          <OnDemandMap progress={PROGRESS_SEARCHING} className="rounded-xl" />
        </PreviewBox>
      </Subsection>

      <Subsection
        title="OnDemandTimeline — en route"
        description="Vertical stage stepper showing progression through the OD delivery lifecycle."
      >
        <PreviewBox>
          <div className="max-w-xs">
            <OnDemandTimeline progress={PROGRESS_EN_ROUTE} />
          </div>
        </PreviewBox>
      </Subsection>

      <Subsection title="OnDemandTimeline — delivered">
        <PreviewBox>
          <div className="max-w-xs">
            <OnDemandTimeline progress={PROGRESS_DELIVERED} />
          </div>
        </PreviewBox>
      </Subsection>

      <Subsection title="Delivery stages reference">
        <SpecTable
          columns={['Stage key', 'Label', 'Rider shown']}
          rows={[
            ['looking_for_driver', 'Looking for driver', 'No (searching)'],
            ['driver_assigned', 'Driver assigned', 'At pickup'],
            ['preparing', 'Preparing', 'At pickup'],
            ['ready_for_pickup', 'Ready for pickup', 'At pickup'],
            ['handed_to_rider', 'Handed to rider', 'At pickup'],
            ['picked_up', 'Picked up', 'Moving'],
            ['en_route', 'En route', 'Moving (~62%)'],
            ['delivered', 'Delivered', 'At drop-off'],
            ['cancelled', 'Cancelled', 'Hidden'],
          ]}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={[
            'Use resolveOnDemandProgress(transaction) to derive the progress object — do not construct it manually.',
            'Compose all four components together; they are designed to appear as a unit.',
            'Use OnDemandBadge in transaction list rows alongside the service type indicator.',
          ]}
          donts={[
            'Don\'t treat OnDemandMap as a real map — it is a presentation mockup for stage-based rider position.',
            'Don\'t show On-Demand tracker UI for Standard or Same-Day deliveries.',
            'Don\'t display live ETAs as real-time data; they are demo values until the dispatch integration is live.',
          ]}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'OnDemandTimeline renders an <ol> with each stage as an <li>; completed stages are visually distinct.',
          'Stage state (done / current / upcoming) is conveyed by the icon and text color, not color alone.',
          'Exception states (failed / returned) show a warning icon with a red border on the current stage.',
          'OnDemandMap is decorative — all meaningful delivery data is in the Route and Timeline.',
        ]}
      />
    </Section>
  );
}
