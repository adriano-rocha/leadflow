import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import RotaProtegida from "./components/RotaProtegida";
import Login from "./pages/Login";
import Painel from "./pages/Painel";
import Instancias from "./pages/Instancias";
import Workflow from "./pages/Workflow";
import Disparo from "./pages/Disparo";
import Dashboard from "./pages/Dashboard";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <RotaProtegida>
        <Dashboard />
      </RotaProtegida>
    ),
  },
  {
    path: "/painel",
    element: (
      <RotaProtegida>
        <Painel />
      </RotaProtegida>
    ),
  },
  {
    path: "/instancias",
    element: (
      <RotaProtegida>
        <Instancias />
      </RotaProtegida>
    ),
  },
  {
    path: "/workflow",
    element: (
      <RotaProtegida>
        <Workflow />
      </RotaProtegida>
    ),
  },
  {
    path: "/disparo",
    element: (
      <RotaProtegida>
        <Disparo />
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
