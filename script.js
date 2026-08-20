let setores = [
  "EMBALAGEM CONGELADA", "LEVAIN", "PANIFICAÇÃO", "PIZZAS CONGELADAS", 
  "PRATOS PRONTOS", "PRÉ-PESAGEM", "PÃO DE QUEIJO / SALGADOS FRITOS", "SALGADOS ASSADOS"
];

const diasDaSemana = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];
let setorAtivo = setores[0];
let bancoDados = {};
let semanaAtiva = "Semana 17/08 a 23/08";

document.addEventListener("DOMContentLoaded", () => {
  carregarDadosLocais();
  configurarEventos();
  renderizarAbas();
  renderizarQuadro();
});

function carregarDadosLocais() {
  const dadosSalvos = localStorage.getItem("bancoDadosPanificacao");
  const setoresSalvos = localStorage.getItem("setoresPanificacao");
  const semanaSalva = localStorage.getItem("semanaAtivaPanificacao");

  if (setoresSalvos) {
    try {
      const parsed = JSON.parse(setoresSalvos);
      if (Array.isArray(parsed) && parsed.length > 0) setores = parsed;
    } catch (e) {}
  }
  if (dadosSalvos) {
    try { bancoDados = JSON.parse(dadosSalvos); } catch (e) {}
  }
  if (semanaSalva) semanaAtiva = semanaSalva;

  if (!bancoDados[semanaAtiva]) bancoDados[semanaAtiva] = {};
}

function configurarEventos() {
  const btnPublicar = document.getElementById("btn-publicar") || document.querySelector(".btn-publish");
  if (btnPublicar) {
    btnPublicar.onclick = salvarDados;
  }

  const selectSemana = document.getElementById("semana-select");
  if (selectSemana) {
    selectSemana.value = semanaAtiva;
    selectSemana.onchange = (e) => {
      semanaAtiva = e.target.value;
      localStorage.setItem("semanaAtivaPanificacao", semanaAtiva);
      renderizarQuadro();
    };
  }
}

function renderizarAbas() {
  const container = document.getElementById("nav-setores-adm") || document.querySelector(".nav-setores");
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

function renderizarQuadro() {
  const titulo = document.getElementById("titulo-setor-ativo") || document.querySelector(".sector-title-banner");
  if (titulo) titulo.innerText = `PROGRAMAÇÃO DE ${setorAtivo}`;

  const grid = document.getElementById("grid-dias-adm") || document.querySelector(".days-grid");
  if (!grid) return;
  grid.innerHTML = "";

  if (!bancoDados[semanaAtiva]) bancoDados[semanaAtiva] = {};
  if (!bancoDados[semanaAtiva][setorAtivo]) bancoDados[semanaAtiva][setorAtivo] = {};

  const dadosSetor = bancoDados[semanaAtiva][setorAtivo];

  diasDaSemana.forEach((dia) => {
    const listaItens = dadosSetor[dia] || [];

    const card = document.createElement("div");
    card.className = "day-card";

    let itensHTML = listaItens.map((item, index) => `
      <div class="item-row">
        <div class="item-left-info">
          ${item.qtd ? `<span class="badge-rec">${item.qtd}</span>` : ""}
          <span class="item-nome">${item.nome || item.descricao || ""}</span>
        </div>
        <button class="btn-remove-item" onclick="removerItem('${dia}', ${index})">✕</button>
      </div>
    `).join("");

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

function removerItem(dia, index) {
  if (bancoDados[semanaAtiva] && bancoDados[semanaAtiva][setorAtivo] && bancoDados[semanaAtiva][setorAtivo][dia]) {
    bancoDados[semanaAtiva][setorAtivo][dia].splice(index, 1);
    salvarDadosLocais();
    renderizarQuadro();
  }
}

function salvarDadosLocais() {
  localStorage.setItem("bancoDadosPanificacao", JSON.stringify(bancoDados));
  localStorage.setItem("setoresPanificacao", JSON.stringify(setores));
  localStorage.setItem("semanaAtivaPanificacao", semanaAtiva);
}

function salvarDados() {
  salvarDadosLocais();

  if (typeof firebase !== "undefined" && firebase.database) {
    const payload = {
      bancoDados: bancoDados,
      setores: setores,
      semanaAtiva: semanaAtiva
    };

    // Atualiza tanto na estrutura 'painelPanificacao' quanto na raiz do banco para sincronizar tudo
    firebase.database().ref("painelPanificacao").set(payload);
    firebase.database().ref("semanas_v2").set(bancoDados)
      .then(() => {
        alert("Sincronizado com sucesso para todos os celulares!");
      })
      .catch((error) => {
        alert("Erro ao sincronizar: " + error.message);
      });
  } else {
    alert("Dados salvos localmente (Firebase não conectado).");
  }
}