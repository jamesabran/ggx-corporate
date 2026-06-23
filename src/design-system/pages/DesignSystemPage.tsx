import { useEffect } from 'react';
import { DocShell } from '../components/DocShell';
import { OverviewSection } from '../sections/OverviewSection';
import { ColorsSection } from '../sections/ColorsSection';
import { TypographySection } from '../sections/TypographySection';
import { SpacingSection } from '../sections/SpacingSection';
import { IconsSection } from '../sections/IconsSection';
// Components
import { ButtonSection } from '../sections/ButtonSection';
import { BadgeBaseSection } from '../sections/BadgeBaseSection';
import { BadgeSection } from '../sections/BadgeSection';
import { CardSection } from '../sections/CardSection';
import { StatCardSection } from '../sections/StatCardSection';
import { ModuleCardSection } from '../sections/ModuleCardSection';
import { IconContainerSection } from '../sections/IconContainerSection';
import { AvatarSection } from '../sections/AvatarSection';
import { AlertSection } from '../sections/AlertSection';
import { SeparatorSection } from '../sections/SeparatorSection';
import { ProgressSection } from '../sections/ProgressSection';
import { FieldSection } from '../sections/FieldSection';
import { TooltipSection } from '../sections/TooltipSection';
import { AccordionSection } from '../sections/AccordionSection';
import { TabsSection } from '../sections/TabsSection';
import { TableSection } from '../sections/TableSection';
import { DialogSection } from '../sections/DialogSection';
import { OtpDialogSection } from '../sections/OtpDialogSection';
// Layout & Navigation
import { PageHeaderSection } from '../sections/PageHeaderSection';
import { BreadcrumbSection } from '../sections/BreadcrumbSection';
import { PaginationSection } from '../sections/PaginationSection';
// Forms
import { FormFieldSection } from '../sections/FormFieldSection';
import { TextareaSection } from '../sections/TextareaSection';
import { SelectSection } from '../sections/SelectSection';
import { SearchInputSection } from '../sections/SearchInputSection';
import { CheckboxSection } from '../sections/CheckboxSection';
import { RadioGroupSection } from '../sections/RadioGroupSection';
import { SwitchSection } from '../sections/SwitchSection';
import { SegmentedControlSection } from '../sections/SegmentedControlSection';
// Patterns
import { PaymentSection } from '../sections/PaymentSection';
import { CheckoutDeliveryOptionsSection } from '../sections/CheckoutDeliveryOptionsSection';
import { AddressDisplayCardSection } from '../sections/AddressDisplayCardSection';

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
      <ModuleCardSection />
      <IconContainerSection />
      <AvatarSection />
      <AlertSection />
      <ProgressSection />
      <SeparatorSection />
      <FieldSection />
      <TooltipSection />
      <AccordionSection />
      <TabsSection />
      <TableSection />
      <DialogSection />
      <OtpDialogSection />
      {/* Layout & Navigation */}
      <PageHeaderSection />
      <BreadcrumbSection />
      <PaginationSection />
      {/* Forms */}
      <FormFieldSection />
      <TextareaSection />
      <SelectSection />
      <SearchInputSection />
      <CheckboxSection />
      <RadioGroupSection />
      <SwitchSection />
      <SegmentedControlSection />
      {/* Patterns */}
      <PaymentSection />
      <CheckoutDeliveryOptionsSection />
      <AddressDisplayCardSection />
    </DocShell>
  );
}

export default DesignSystemPage;
