// LISTA DE SETORES
const setoresLideres = [
  "BOLOS CONGELADOS", "BOLOS SECOS", "EMBALAGEM CONGELADA", "EMBALAGEM SECAS", 
  "LEVAIN", "PANIFICAÇÃO", "PIZZAS CONGELADAS", "PRATOS PRONTOS", 
  "PRÉ-PESAGEM", "PÃO DE QUEIJO / SALGADOS FRITOS", "SALGADOS ASSADOS", 
  "SEPARAÇÃO SECA", "SOBREMESAS"
];

let setorAtivoLider = "PANIFICAÇÃO";

// DADOS DE EXEMPLO (Simulação da programação vinda do ADM)
let programacaoGeral = {
  "PANIFICAÇÃO": {
    "SEGUNDA 17/08/2026": [
      { qtd: "50 kg", nome: "PÃO DE FORMA" },
      { qtd: "40 kg", nome: "BRIOCHE" },
      { qtd: "8 x 40 kg", nome: "SOVADO" },
      { qtd: "60 kg", nome: "PÃO DE CEBOLA" },
      { qtd: "80 kg", nome: "ROSCA RAINHA DE CREME" },
      { qtd: "70 kg", nome: "ROSQUINHA DE CREME" }
    ],
    "TERÇA 18/08/2026": [
      { qtd: "20 KG", nome: "ROSCA DE LEITE CONDENSADO" },
      { qtd: "20 KG", nome: "PÃO DE MILHO" },
      { qtd: "3X40 KG", nome: "SOVADO" },
      { qtd: "30 KG", nome: "ROSCA LISA" },
      { qtd: "20 KG", nome: "PÃO DE BATATA" },
      { qtd: "40 KG", nome: "ROSCA RAINHA AÇÚCAR" },
      { qtd: "30 KG", nome: "HOT DOG" },
      { qtd: "40 KG", nome: "ROSCA FAZENDA" },
      { qtd: "2 KITS", nome: "CHOCOTTONE / 30 COLOMBA" },
      { qtd: "2 KITS", nome: "PANETTONE / 30 COLOMBA" }
    ],
    "QUARTA 19/08/2026": [
      { qtd: "50 KG", nome: "PÃO DE FORMA" },
      { qtd: "50 KG", nome: "PÃO DE FORMA INTEGRAL" },
      { qtd: "3X40 KG", nome: "SOVADO" },
      { qtd: "20 KG", nome: "PÃO DE CEBOLA" },
      { qtd: "50 KG", nome: "ROSCA RAINHA DE CREME" },
      { qtd: "40 KG", nome: "ROSQUINHA DE CREME" }
    ],
    "QUINTA 20/08/2026": [
      { qtd: "4X40 KG", nome: "SOVADO" },
      { qtd: "30 KG", nome: "ROSCA LISA" },
      { qtd: "30 KG", nome: "PÃO DE BATATA" },
      { qtd: "30 KG", nome: "HAMBURGUER TRADICIONAL" },
      { qtd: "40 KG", nome: "HAMBURGUER GERGELIM" },
      { qtd: "40 KG", nome: "ROSCA RAINHA AÇÚCAR" },
      { qtd: "20 KG", nome: "ROSQUINHA C/ AÇÚCAR" },
      { qtd: "30 KG", nome: "ROSCA FAZENDA C/ AÇÚCAR" }
    ],
    "SEXTA 21/08/2026": [
      { qtd: "30 KG", nome: "ROSQUINHA C/ AÇÚCAR (CONGELAR)" }
    ]
  },
  "BOLOS SECOS": {
    "SEGUNDA 17/08/2026": [
      { qtd: "2 rec", tipo: "PLACA", nome: "ABACAXI" },
      { qtd: "2 rec", tipo: "PLACA", nome: "CENOURA C/ COBERTURA" },
      { qtd: "2 rec", tipo: "CREMOSO", nome: "FUBÁ CREMOSO" }
    ]
  }
};

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
  renderizarAbasLideres();
  renderizarQuadroLideres();
});

// DESENHAR AS ABAS DOS SETORES
function renderizarAbasLideres() {
  const container = document.getElementById("nav-setores-lideres");
  container.innerHTML = "";

  setoresLideres.forEach((setor) => {
    const btn = document.createElement("button");
    btn.className = `tab-lider ${setor === setorAtivoLider ? "active" : ""}`;
    btn.innerText = setor;
    btn.onclick = () => {
      setorAtivoLider = setor;
      renderizarAbasLideres();
      renderizarQuadroLideres();
    };
    container.appendChild(btn);
  });
}

// DESENHAR OS CARDS DA PROGRAMAÇÃO DOS LÍDERES
function renderizarQuadroLideres() {
  document.getElementById("titulo-setor-ativo").innerText = `PROGRAMAÇÃO DE ${setorAtivoLider}`;
  const grid = document.getElementById("grid-dias-lideres");
  grid.innerHTML = "";

  const dadosSetor = programacaoGeral[setorAtivoLider] || {};
  const ehBolosSecos = setorAtivoLider === "BOLOS SECOS";
  const diasChaves = Object.keys(dadosSetor);

  if (diasChaves.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b; font-weight: 600;">Nenhuma programação cadastrada para o setor de ${setorAtivoLider}.</div>`;
    return;
  }

  diasChaves.forEach((diaData) => {
    const card = document.createElement("div");
    card.className = "day-card-lider";

    const listaItens = dadosSetor[diaData] || [];

    let itensHTML = listaItens.map((item, idx) => {
      let badgeTipoHTML = "";

      // Apenas no setor "BOLOS SECOS" renderiza as tags de tipo
      if (ehBolosSecos && item.tipo) {
        let badgeClass = "badge-padrao";
        const t = item.tipo.toUpperCase();
        if (t.includes("PLACA")) badgeClass = "badge-placa";
        else if (t.includes("REDONDO")) badgeClass = "badge-redondo";
        else if (t.includes("CREMOSO")) badgeClass = "badge-cremoso";
        else if (t.includes("INGLÊS")) badgeClass = "badge-inglês";
        else if (t.includes("COBERTURA")) badgeClass = "badge-cobertura";
        else if (t.includes("CASEIRO")) badgeClass = "badge-caseiro";

        badgeTipoHTML = `<span class="badge-tipo-lider ${badgeClass}">${item.tipo}</span>`;
      }

      return `
        <div class="item-row-lider">
          <div class="item-left-info">
            <span class="badge-qtd-lider">${item.qtd}</span>
            ${badgeTipoHTML}
            <span class="item-nome-lider">${item.nome}</span>
          </div>
          <input 
            type="text" 
            class="input-qtd-realizada" 
            placeholder="Qtd" 
            title="Digite a quantidade realizada"
          />
        </div>
      `;
    }).join("");

    card.innerHTML = `
      <div class="day-header-lider">
        <span>${diaData}</span>
        <span style="font-size: 0.75rem; opacity: 0.85;">${listaItens.length} itens</span>
      </div>
      <div class="day-items-list-lider">
        ${itensHTML}
      </div>
    `;

    grid.appendChild(card);
  });
}

function verHistorico() {
  alert("Exibindo histórico de alterações...");
}