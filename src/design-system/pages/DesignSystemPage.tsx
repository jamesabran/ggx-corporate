import { useEffect } from 'react';
import { DocShell } from '../components/DocShell';
import { OverviewSection } from '../sections/OverviewSection';
import { ColorsSection } from '../sections/ColorsSection';
import { TypographySection } from '../sections/TypographySection';
import { SpacingSection } from '../sections/SpacingSection';
import { IconsSection } from '../sections/IconsSection';
import { ButtonSection } from '../sections/ButtonSection';
import { BadgeBaseSection } from '../sections/BadgeBaseSection';
import { BadgeSection } from '../sections/BadgeSection';
import { CardSection } from '../sections/CardSection';
import { StatCardSection } from '../sections/StatCardSection';
import { IconContainerSection } from '../sections/IconContainerSection';
import { FormFieldSection } from '../sections/FormFieldSection';
import { SelectSection } from '../sections/SelectSection';
import { SearchInputSection } from '../sections/SearchInputSection';
import { SegmentedControlSection } from '../sections/SegmentedControlSection';
import { TabsSection } from '../sections/TabsSection';
import { TableSection } from '../sections/TableSection';
import { DialogSection } from '../sections/DialogSection';
import { PaymentSection } from '../sections/PaymentSection';

/**
 * GoGo Xpress Design System — living reference page.
 *
 * Isolated at /design-system. Cross-references the GGX-SHADCN Figma file and the
 * production code, and renders the actual coded components. Changes no production
 * screen, flow, or global component.
 */
export function DesignSystemPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = 'GoGo Xpress Design System';
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <DocShell>
      <OverviewSection />
      {/* Foundations */}
      <ColorsSection />
      <TypographySection />
      <SpacingSection />
      <IconsSection />
      {/* Components */}
      <ButtonSection />
      <BadgeBaseSection />
      <BadgeSection />
      <CardSection />
      <StatCardSection />
      <IconContainerSection />
      <FormFieldSection />
      <SelectSection />
      <SearchInputSection />
      <SegmentedControlSection />
      <TabsSection />
      <TableSection />
      <DialogSection />
      {/* Patterns */}
      <PaymentSection />
    </DocShell>
  );
}

export default DesignSystemPage;
