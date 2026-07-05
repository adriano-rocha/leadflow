import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { criarInstancia, verificarStatus } from '../services/instanciaService';
import './Instancias.css';

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

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="instancias-container">
      <Link to="/" className="painel-link-voltar">← Voltar ao Painel</Link>
      <h1 className="instancias-titulo">Central de Instâncias</h1>

      <form onSubmit={handleCriar} className="instancias-form">
        <input
          type="text"
          placeholder="Nome da instância (ex: whatsapp-principal)"
          value={nomeInstancia}
          onChange={(e) => setNomeInstancia(e.target.value)}
          required
        />
        <button type="submit" className="instancias-botao" disabled={carregando}>
          {carregando ? 'Criando...' : '+ Criar Instância'}
        </button>
      </form>

      {erro && <p className="instancias-erro">{erro}</p>}

      {qrcode && (
        <div className="instancias-card-qr">
          <p className="instancias-status">
            Status: <strong>{status.replace('_', ' ')}</strong>
          </p>
          {status !== 'conectado' ? (
            <img src={qrcode} alt="QR Code do WhatsApp" className="instancias-qrcode" />
          ) : (
            <p className="instancias-conectado">✅ WhatsApp conectado com sucesso!</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Instancias;