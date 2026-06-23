import { useEffect } from 'react';
import { DocShell } from '../components/DocShell';
import { OverviewSection } from '../sections/OverviewSection';
import { ColorsSection } from '../sections/ColorsSection';
import { TypographySection } from '../sections/TypographySection';
import { SpacingSection } from '../sections/SpacingSection';
import { IconsSection } from '../sections/IconsSection';
import { ButtonSection } from '../sections/ButtonSection';
import { BadgeSection } from '../sections/BadgeSection';
import { FormFieldSection } from '../sections/FormFieldSection';
import { PaymentSection } from '../sections/PaymentSection';

/**
 * GoGo Xpress Design System — sample reference page.
 *
 * Isolated at /design-system. Reuses existing tokens, components, icons, and
 * assets; changes no production screen, flow, or global component. Safe to
 * remove by deleting src/design-system/ and its route entry.
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
      <ColorsSection />
      <TypographySection />
      <SpacingSection />
      <IconsSection />
      <ButtonSection />
      <BadgeSection />
      <FormFieldSection />
      <PaymentSection />
    </DocShell>
  );
}

export default DesignSystemPage;
