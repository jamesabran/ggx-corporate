import { useNavigate } from 'react-router';
import { IconLock, IconArrowLeft } from '@tabler/icons-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';

/** Minimal access-denied state for routes the current role can't access. */
export function AccessDenied() {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <Card className="max-w-lg mx-auto mt-10">
        <CardContent className="p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <IconLock className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Access restricted</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            This page is available to the parent account (Admin) only. Your role doesn&apos;t have access to it.
          </p>
          <Button className="mt-6" onClick={() => navigate('/dashboard')}>
            <IconArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
