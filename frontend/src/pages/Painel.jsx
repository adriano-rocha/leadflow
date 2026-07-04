import { useAuth } from '../context/useAuth';

function Painel() {
  const { usuario, logout } = useAuth();

  return (
    <div style={{ padding: 40 }}>
      <h1>Painel LeadFlow</h1>
      <p>Bem-vindo, {usuario?.nome}!</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}

export default Painel;