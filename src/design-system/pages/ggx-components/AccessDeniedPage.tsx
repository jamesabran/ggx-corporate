import { DSPage } from '../../layout/DSPage';
import { AccessDeniedSection } from '../../sections/AccessDeniedSection';

export function AccessDeniedPage() {
  return (
    <DSPage title="Access Denied">
      <AccessDeniedSection />
    </DSPage>
  );
}
