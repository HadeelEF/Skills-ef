import { useRef } from 'react';
import { useNavigate } from 'react-router';
import { CreateRequestForm } from '../components/CreateRequestForm';
import { UnsavedChangesGuard } from '../components/UnsavedChangesGuard';

export function CreateRequestPage() {
  const navigate = useNavigate();
  const bypassGuard = useRef(false);

  return (
    <main>
      <h1>طلب شراء جديد</h1>
      <CreateRequestForm
        renderGuard={(isDirty) => <UnsavedChangesGuard when={isDirty} bypass={bypassGuard} />}
        onCreated={(id) => {
          bypassGuard.current = true;
          void navigate(`/requests/${encodeURIComponent(id)}`, { replace: true });
        }}
      />
    </main>
  );
}
