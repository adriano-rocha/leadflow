import { useState, useEffect, useRef } from 'react';
import { criarInstancia, verificarStatus } from '../services/instanciaService';

function Instancias() {
  const [nomeInstancia, setNomeInstancia] = useState('');
  const [qrcode, setQrcode] = useState(null);
  const [status, setStatus] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const intervalRef = useRef(null);

  async function handleCriar(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    setQrcode(null);

    try {
      const dados = await criarInstancia(nomeInstancia);
      setQrcode(dados.qrcode);
      setStatus('aguardando_qrcode');
      iniciarVerificacao(nomeInstancia);
    } catch (err) {
      console.error(err);
      setErro('Erro ao criar instância');
    } finally {
      setCarregando(false);
    }
  }

  function iniciarVerificacao(nome) {
    // Verifica o status a cada 3 segundos
    intervalRef.current = setInterval(async () => {
      try {
        const resposta = await verificarStatus(nome);
        setStatus(resposta.status);

        if (resposta.status === 'conectado') {
          clearInterval(intervalRef.current);
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);
  }

  // Limpa o intervalo se o componente for desmontado (boa prática)
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Central de Instâncias</h1>

      <form onSubmit={handleCriar} style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <input
          type="text"
          placeholder="Nome da instância (ex: whatsapp-principal)"
          value={nomeInstancia}
          onChange={(e) => setNomeInstancia(e.target.value)}
          required
        />
        <button type="submit" disabled={carregando}>
          {carregando ? 'Criando...' : '+ Criar Instância'}
        </button>
      </form>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      {qrcode && (
        <div style={{ marginTop: 20 }}>
          <p>Status: <strong>{status}</strong></p>
          {status !== 'conectado' ? (
            <img src={qrcode} alt="QR Code do WhatsApp" style={{ width: 250 }} />
          ) : (
            <p style={{ color: 'green' }}>✅ WhatsApp conectado com sucesso!</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Instancias;