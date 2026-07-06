function escaparCampo(valor) {
  const texto = String(valor ?? '');
  return `"${texto.replace(/"/g, '""')}"`;
}

function exportarCsv(leads) {
  const SEPARADOR = ';';

  const cabecalho = ['Nome', 'Endereço', 'Telefone', 'Segmento', 'Cidade', 'Tem site próprio', 'Status'];

  const linhas = leads.map((lead) => [
    escaparCampo(lead.nome),
    escaparCampo(lead.endereco),
    escaparCampo(lead.telefone),
    escaparCampo(lead.segmento),
    escaparCampo(lead.cidade),
    escaparCampo(lead.temSiteProprio ? 'Sim' : 'Não'),
    escaparCampo(lead.status),
  ].join(SEPARADOR));

  const cabecalhoEscapado = cabecalho.map(escaparCampo).join(SEPARADOR);
  const conteudoCsv = [cabecalhoEscapado, ...linhas].join('\n');

  const blob = new Blob(['\uFEFF' + conteudoCsv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'leads.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default exportarCsv;