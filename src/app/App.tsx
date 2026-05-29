import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { SubAccountProvider } from './contexts/SubAccountContext';

export default function App() {
  return (
    <AuthProvider>
      <SubAccountProvider>
        <RouterProvider router={router} />
      </SubAccountProvider>
    </AuthProvider>
  );
}
