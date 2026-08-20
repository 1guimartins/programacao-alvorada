let setores = [
  "EMBALAGEM CONGELADA", "LEVAIN", "PANIFICAÇÃO", "PIZZAS CONGELADAS", 
  "PRATOS PRONTOS", "PRÉ-PESAGEM", "PÃO DE QUEIJO / SALGADOS FRITOS", "SALGADOS ASSADOS"
];

const diasDaSemana = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];
let setorAtivo = setores[0];
let bancoDados = {};
let semanaAtiva = "";

function carregarDadosLocais() {
  const dadosSalvos = localStorage.getItem("bancoDadosPanificacao");
  const setoresSalvos = localStorage.getItem("setoresPanificacao");
  const semanaSalva = localStorage.getItem("semanaAtivaPanificacao");

  if (setoresSalvos) { 
    try { 
      const parsed = JSON.parse(setoresSalvos); 
      if (Array.isArray(parsed) && parsed.length > 0) setores = parsed;
    } catch(e){} 
  }
  if (dadosSalvos) { 
    try { bancoDados = JSON.parse(dadosSalvos); } catch(e){} 
  }
  
  semanaAtiva = semanaSalva || Object.keys(bancoDados)[0] || "";

  if (!setores.includes(setorAtivo)) {
    setorAtivo = setores[0];
  }

  renderizarAbas();
  renderizarQuadro();
}

document.addEventListener("DOMContentLoaded", () => {
  carregarDadosLocais();

  if (typeof firebase !== "undefined" && firebase.database) {
    // Escuta a raiz inteira do Firebase para garantir compatibilidade
    firebase.database().ref("/").on("value", (snapshot) => {
      const raiz = snapshot.val();
      if (!raiz) return;

      // 1. Tenta carregar do novo padrão
      if (raiz.painelPanificacao) {
        if (raiz.painelPanificacao.bancoDados) bancoDados = raiz.painelPanificacao.bancoDados;
        if (raiz.painelPanificacao.setores && Array.isArray(raiz.painelPanificacao.setores)) {
          setores = raiz.painelPanificacao.setores;
        }
        if (raiz.painelPanificacao.semanaAtiva) semanaAtiva = raiz.painelPanificacao.semanaAtiva;
      } 
      // 2. Se não houver novo padrão, tenta mapear as chaves 'semanas_v2' / 'semanas' / 'programacao'
      else {
        if (raiz.semanas_v2) bancoDados = raiz.semanas_v2;
        else if (raiz.semanas) bancoDados = raiz.semanas;
        else if (raiz.programacao) bancoDados = raiz.programacao;
      }

      if (!semanaAtiva || !bancoDados[semanaAtiva]) {
        semanaAtiva = Object.keys(bancoDados)[0] || "";
      }

      if (!setores.includes(setorAtivo)) {
        setorAtivo = setores[0];
      }

      renderizarAbas();
      renderizarQuadro();
    });
  }
});

function renderizarAbas() {
  const container = document.getElementById("nav-setores-lideres") || document.getElementById("nav-setores-lider") || document.querySelector(".nav-setores");
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
  if (!semanaNome) {
    diasDaSemana.forEach(dia => datasFormatadas[dia] = dia);
    return datasFormatadas;
  }

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

function renderizarQuadro() {
  const titulo = document.getElementById("titulo-setor-ativo");
  if (titulo) titulo.innerText = `PROGRAMAÇÃO DE ${setorAtivo}`;

  const grid = document.getElementById("grid-dias-lideres") || document.getElementById("grid-dias-lider") || document.getElementById("grid-dias-adm") || document.querySelector(".days-grid") || document.querySelector(".grid-dias");
  if (!grid) return;
  grid.innerHTML = "";

  if (!semanaAtiva) semanaAtiva = Object.keys(bancoDados)[0] || "";

  if (!bancoDados[semanaAtiva]) bancoDados[semanaAtiva] = {};
  if (!bancoDados[semanaAtiva][setorAtivo]) bancoDados[semanaAtiva][setorAtivo] = {};

  const dadosSetor = bancoDados[semanaAtiva][setorAtivo];
  const rotulosDias = obterDatasDaSemana(semanaAtiva);

  diasDaSemana.forEach((dia) => {
    const listaItens = dadosSetor[dia] || [];

    const card = document.createElement("div");
    card.className = "day-card";

    let itensHTML = listaItens.map((item) => {
      let textoBadge = [item.qtd, item.tipo].filter(Boolean).join(" ");
      if (!textoBadge && item.qtd) {
        textoBadge = item.qtd;
      }

      return `
        <div class="item-row">
          <div class="item-left-info">
            ${textoBadge ? `<span class="badge-rec">${textoBadge}</span>` : ""}
            <span class="item-nome">${item.nome || item.descricao || ""}</span>
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