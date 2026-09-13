import AdminRegistrationsPage from '../registrations/page';

export default function VerificationRoute() {
  return (
    <AdminRegistrationsPage
      initialFilter="PENDING"
      pageTitle="Student Credential Verification"
      pageSubtitle="Audit submitted student credentials and ID scans. Verify candidates to issue cryptographically signed digital entry passes."
    />
  );
}
