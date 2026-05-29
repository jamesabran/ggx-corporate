import { RouterProvider } from 'react-router';
import { router } from './routes';
import { SubAccountProvider } from './contexts/SubAccountContext';

export default function App() {
  return (
    <SubAccountProvider>
      <RouterProvider router={router} />
    </SubAccountProvider>
  );
}
