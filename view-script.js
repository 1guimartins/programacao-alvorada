const diasDaSemana = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];
let setoresLideres = [];
let setorAtivoLider = "PANIFICAÇÃO";

function obterDadosSalvos() {
  const dados = localStorage.getItem("bancoDadosPanificacao");
  return dados ? JSON.parse(dados) : {};
}

function obterSetoresSalvos() {
  const lista = localStorage.getItem("setoresPanificacao");
  const padrao = [
    "BOLOS CONGELADOS", "BOLOS SECOS", "EMBALAGEM CONGELADA", "EMBALAGEM SECAS", 
    "LEVAIN", "PANIFICAÇÃO", "PIZZAS CONGELADAS", "PRATOS PRONTOS", 
    "PRÉ-PESAGEM", "PÃO DE QUEIJO / SALGADOS FRITOS", "SALGADOS ASSADOS"
  ];
  return lista ? JSON.parse(lista) : padrao;
}

function obterSemanaAtiva() {
  return localStorage.getItem("semanaAtivaPanificacao") || "Semana 17/08 a 23/08";
}

document.addEventListener("DOMContentLoaded", () => {
  sincronizarTela();
});

window.addEventListener("storage", () => {
  sincronizarTela();
});

function sincronizarTela() {
  setoresLideres = obterSetoresSalvos();
  
  if (!setorAtivoLider || !setoresLideres.includes(setorAtivoLider)) {
    setorAtivoLider = setoresLideres.includes("PANIFICAÇÃO") ? "PANIFICAÇÃO" : setoresLideres[0];
  }
  
  renderizarAbasLideres();
  renderizarQuadroLideres();
}

function renderizarAbasLideres() {
  const container = document.getElementById("nav-setores-lideres");
  if (!container) return;
  container.innerHTML = "";

  setoresLideres.forEach((setor) => {
    const btn = document.createElement("button");
    btn.className = `tab-setor ${setor === setorAtivoLider ? "active" : ""}`;
    btn.innerText = setor;
    btn.onclick = () => {
      setorAtivoLider = setor;
      renderizarAbasLideres();
      renderizarQuadroLideres();
    };
    container.appendChild(btn);
  });
}

function renderizarQuadroLideres() {
  const titulo = document.getElementById("titulo-setor-ativo");
  if (titulo) titulo.innerText = `PROGRAMAÇÃO DE ${setorAtivoLider}`;
  
  const grid = document.getElementById("grid-dias-lideres");
  if (!grid) return;
  grid.innerHTML = "";

  const bancoDados = obterDadosSalvos();
  const semanaAtual = obterSemanaAtiva();
  
  const dadosSemana = bancoDados[semanaAtual] || {};
  const dadosSetor = dadosSemana[setorAtivoLider] || {};
  const ehBolosSecos = setorAtivoLider === "BOLOS SECOS";

  diasDaSemana.forEach((dia) => {
    const card = document.createElement("div");
    card.className = "day-card";

    const listaItens = dadosSetor[dia] || [];

    let itensHTML = listaItens.map((item) => {
      let badgeTipoHTML = "";

      if (ehBolosSecos && item.tipo) {
        let badgeClass = "badge-padrao";
        const t = item.tipo.toUpperCase();
        if (t.includes("PLACA")) badgeClass = "badge-placa";
        else if (t.includes("REDONDO")) badgeClass = "badge-redondo";
        else if (t.includes("CREMOSO")) badgeClass = "badge-cremoso";
        else if (t.includes("INGLÊS")) badgeClass = "badge-inglês";
        else if (t.includes("COBERTURA")) badgeClass = "badge-cobertura";
        else if (t.includes("CASEIRO")) badgeClass = "badge-caseiro";

        badgeTipoHTML = `<span class="badge-tipo ${badgeClass}">${item.tipo}</span>`;
      }

      return `
        <div class="item-row">
          <div class="item-left-info">
            <span class="badge-rec" style="min-width: 65px;">${item.qtd}</span>
            ${badgeTipoHTML}
            <span class="item-nome">${item.nome}</span>
          </div>
          <input type="text" class="input-qtd-realizada" placeholder="Qtd" />
        </div>
      `;
    }).join("");

    card.innerHTML = `
      <div class="day-header">
        <span>${dia}</span>
        <span style="font-size: 0.75rem; opacity: 0.85;">${listaItens.length} itens</span>
      </div>
      <div class="day-items-list">
        ${itensHTML || '<p style="font-size: 0.75rem; color: #94a3b8; text-align: center; padding: 10px;">Nenhum item cadastrado</p>'}
      </div>
    `;

    grid.appendChild(card);
  });
}