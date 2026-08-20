let setores = [
  "EMBALAGEM CONGELADA", "LEVAIN", "PANIFICAÇÃO", "PIZZAS CONGELADAS", 
  "PRATOS PRONTOS", "PRÉ-PESAGEM", "PÃO DE QUEIJO / SALGADOS FRITOS", "SALGADOS ASSADOS"
];

const diasDaSemana = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];
let setorAtivo = setores[0];
let bancoDados = {};
let semanaAtiva = "";

function iniciarSincronizacaoFirebase() {
  if (typeof firebase !== "undefined" && firebase.database) {
    firebase.database().ref("painelPanificacao").on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.bancoDados) bancoDados = data.bancoDados;
        if (data.setores) setores = data.setores;
        if (data.semanaAtiva) semanaAtiva = data.semanaAtiva;

        if (!setores.includes(setorAtivo)) {
          setorAtivo = setores[0];
        }

        renderizarAbas();
        renderizarQuadro();
      }
    });
  } else {
    // Fallback caso não tenha conexão com o Firebase
    const dadosSalvos = localStorage.getItem("bancoDadosPanificacao");
    const setoresSalvos = localStorage.getItem("setoresPanificacao");
    const semanaSalva = localStorage.getItem("semanaAtivaPanificacao");

    if (setoresSalvos) { try { setores = JSON.parse(setoresSalvos); } catch(e){} }
    if (dadosSalvos) { try { bancoDados = JSON.parse(dadosSalvos); } catch(e){} }
    semanaAtiva = semanaSalva || Object.keys(bancoDados)[0] || "Semana 17/08 a 23/08";

    if (!setores.includes(setorAtivo)) {
      setorAtivo = setores[0];
    }

    renderizarAbas();
    renderizarQuadro();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarSincronizacaoFirebase();
});

function renderizarAbas() {
  const container = document.getElementById("nav-setores-lider") || document.querySelector(".nav-setores") || document.querySelector("nav");
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
  const titulo = document.getElementById("titulo-setor-ativo") || document.querySelector("h1") || document.querySelector("h2");
  if (titulo) titulo.innerText = `PROGRAMAÇÃO DE ${setorAtivo}`;

  const grid = document.getElementById("grid-dias-lider") || document.getElementById("grid-dias-adm") || document.querySelector(".grid-dias") || document.querySelector(".main-content");
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
      let textoBadge = [item.qtd, item.tipo].filter(Boolean).join(" ");
      if (!textoBadge && item.qtd) {
        textoBadge = item.qtd;
      }

      return `
        <div class="item-row">
          <div class="item-left-info">
            ${textoBadge ? `<span class="badge-rec">${textoBadge}</span>` : ""}
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