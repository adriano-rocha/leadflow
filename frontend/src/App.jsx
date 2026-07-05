import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import RotaProtegida from './components/RotaProtegida';
import Login from './pages/Login';
import Painel from './pages/Painel';
import Instancias from './pages/Instancias';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <RotaProtegida>
        <Painel />
        <Instancias />
      </RotaProtegida>
    ),
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;