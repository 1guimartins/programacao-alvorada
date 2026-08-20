let setores = [
  "BOLOS CONGELADOS", "BOLOS SECOS", "EMBALAGEM CONGELADA", "EMBALAGEM SECAS", 
  "LEVAIN", "PANIFICAÇÃO", "PIZZAS CONGELADAS", "PRATOS PRONTOS", 
  "PRÉ-PESAGEM", "PÃO DE QUEIJO / SALGADOS FRITOS", "SALGADOS ASSADOS"
];

const diasDaSemana = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];
let setorAtivo = "PANIFICAÇÃO";
let bancoDados = {};
let semanaAtiva = "";

function carregarDados() {
  const dadosSalvos = localStorage.getItem("bancoDadosPanificacao");
  const setoresSalvos = localStorage.getItem("setoresPanificacao");
  const semanaSalva = localStorage.getItem("semanaAtivaPanificacao");

  if (setoresSalvos) {
    try { setores = JSON.parse(setoresSalvos); } catch(e){}
  }

  if (dadosSalvos) {
    try { bancoDados = JSON.parse(dadosSalvos); } catch(e){}
  }

  if (semanaSalva && bancoDados[semanaSalva]) {
    semanaAtiva = semanaSalva;
  } else {
    const listaSemanas = Object.keys(bancoDados);
    semanaAtiva = listaSemanas.length > 0 ? listaSemanas[0] : "Semana 17/08 a 23/08";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarDados();
  renderizarAbas();
  renderizarQuadro();
});

function renderizarAbas() {
  const container = document.getElementById("nav-setores-lider");
  if (!container) return;
  container.innerHTML = "";

  setores.forEach((setor) => {
    const btn = document.createElement("button");
    btn.className = `tab-setor ${setor === setorAtivo ? "active" : ""}`;
    btn.innerText = setor;
    btn.onclick = () => {
      setorAtivo = setor;
      renderizarAbas();
      renderizarQuadro();
    };
    container.appendChild(btn);
  });
}

function obterDatasDaSemana(semanaNome) {
  const datasFormatadas = {};
  const match = semanaNome.match(/(\d{1,2}\/\d{1,2})/);

  if (match) {
    const [diaStr, mesStr] = match[1].split("/");
    const anoAtual = new Date().getFullYear();
    const dataInicial = new Date(anoAtual, parseInt(mesStr) - 1, parseInt(diaStr));

    diasDaSemana.forEach((dia, index) => {
      const dataDia = new Date(dataInicial);
      dataDia.setDate(dataInicial.getDate() + index);

      const d = String(dataDia.getDate()).padStart(2, "0");
      const m = String(dataDia.getMonth() + 1).padStart(2, "0");
      datasFormatadas[dia] = `${dia} (${d}/${m})`;
    });
  } else {
    diasDaSemana.forEach(dia => datasFormatadas[dia] = dia);
  }

  return datasFormatadas;
}

function obterClasseCategoria(categoria) {
  if (!categoria) return "cat-padrao";
  const catUpper = categoria.toUpperCase().trim();

  if (catUpper.includes("PLACA")) return "cat-placa";
  if (catUpper.includes("COBERTURA")) return "cat-cobertura";
  if (catUpper.includes("CASEIRO")) return "cat-caseiro";
  if (catUpper.includes("INGLÊS") || catUpper.includes("INGLES")) return "cat-ingles";
  if (catUpper.includes("CREMOSO")) return "cat-cremoso";
  if (catUpper.includes("REDONDO")) return "cat-redondo";

  return "cat-padrao";
}

function renderizarQuadro() {
  const titulo = document.getElementById("titulo-setor-ativo");
  if (titulo) titulo.innerText = `PROGRAMAÇÃO DE ${setorAtivo}`;

  const grid = document.getElementById("grid-dias-lider") || document.getElementById("grid-dias-adm");
  if (!grid) return;
  grid.innerHTML = "";

  if (!bancoDados[semanaAtiva]) bancoDados[semanaAtiva] = {};
  if (!bancoDados[semanaAtiva][setorAtivo]) bancoDados[semanaAtiva][setorAtivo] = {};

  const dadosSetor = bancoDados[semanaAtiva][setorAtivo];
  const rotulosDias = obterDatasDaSemana(semanaAtiva);

  diasDaSemana.forEach((dia) => {
    if (!dadosSetor[dia]) dadosSetor[dia] = [];
    const listaItens = dadosSetor[dia];

    const card = document.createElement("div");
    card.className = "day-card";

    let itensHTML = listaItens.map((item) => {
      const classeCor = obterClasseCategoria(item.categoria);
      
      // Concatena a quantidade e o tipo (Ex: "50 REC", "6x")
      let textoBadge = [item.qtd, item.tipo].filter(Boolean).join(" ");
      if (!textoBadge && item.qtd) {
        textoBadge = item.qtd;
      }

      return `
        <div class="item-row">
          <div class="item-left-info">
            ${textoBadge ? `<span class="badge-rec">${textoBadge}</span>` : ""}
            ${item.categoria ? `<span class="badge-categoria ${classeCor}">${item.categoria}</span>` : ""}
            <span class="item-nome">${item.nome}</span>
          </div>
          <input type="text" class="input-qtd-lider" placeholder="Qtd" />
        </div>
      `;
    }).join("");

    card.innerHTML = `
      <div class="day-header">
        <span>${rotulosDias[dia]}</span>
        <span style="font-size: 0.75rem; opacity: 0.85;">${listaItens.length} itens</span>
      </div>
      <div class="day-items-list">
        ${itensHTML || '<p style="font-size: 0.75rem; color: #94a3b8; text-align: center; padding: 10px;">Nenhum item cadastrado</p>'}
      </div>
    `;

    grid.appendChild(card);
  });
}