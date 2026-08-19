// LISTA PADRÃO DE SETORES
let setores = [
  "BOLOS CONGELADOS", "BOLOS SECOS", "EMBALAGEM CONGELADA", "EMBALAGEM SECAS", 
  "LEVAIN", "PANIFICAÇÃO", "PIZZAS CONGELADAS", "PRATOS PRONTOS", 
  "PRÉ-PESAGEM", "PÃO DE QUEIJO / SALGADOS FRITOS", "SALGADOS ASSADOS"
];

const diasDaSemana = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];
let setorAtivo = "PANIFICAÇÃO";
let bancoDados = {};

// CARREGAR DADOS DO LOCALSTORAGE OU INICIALIZAR
function carregarDados() {
  const dadosSalvos = localStorage.getItem("bancoDadosPanificacao");
  const setoresSalvos = localStorage.getItem("setoresPanificacao");

  if (setoresSalvos) {
    setores = JSON.parse(setoresSalvos);
  }

  if (dadosSalvos) {
    bancoDados = JSON.parse(dadosSalvos);
  } else {
    // Inicialização vazia para a primeira semana
    const semanaInicial = "Semana 17/08 a 23/08";
    bancoDados[semanaInicial] = {};
    setores.forEach(setor => {
      bancoDados[semanaInicial][setor] = {};
      diasDaSemana.forEach(dia => {
        bancoDados[semanaInicial][setor][dia] = [];
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarDados();
  renderizarAbas();
  renderizarQuadro();
});

function renderizarAbas() {
  const container = document.getElementById("nav-setores-adm");
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
  const semanaSelect = document.getElementById("semana-select");
  const semanaAtual = semanaSelect ? semanaSelect.value : "Semana 17/08 a 23/08";
  
  const titulo = document.getElementById("titulo-setor-ativo");
  if (titulo) titulo.innerText = `PROGRAMAÇÃO DE ${setorAtivo}`;

  const grid = document.getElementById("grid-dias-adm");
  if (!grid) return;
  grid.innerHTML = "";

  if (!bancoDados[semanaAtual]) bancoDados[semanaAtual] = {};
  if (!bancoDados[semanaAtual][setorAtivo]) bancoDados[semanaAtual][setorAtivo] = {};

  const dadosSetor = bancoDados[semanaAtual][setorAtivo];

  diasDaSemana.forEach((dia) => {
    if (!dadosSetor[dia]) dadosSetor[dia] = [];
    const listaItens = dadosSetor[dia];

    const card = document.createElement("div");
    card.className = "day-card";

    let itensHTML = listaItens.map((item, index) => `
      <div class="item-row">
        <div class="item-left-info">
          <span class="badge-rec">${item.qtd}</span>
          ${item.tipo ? `<span class="badge-tipo">${item.tipo}</span>` : ""}
          <span class="item-nome">${item.nome}</span>
        </div>
        <button class="btn-del-item" onclick="removerItem('${dia}', ${index})">×</button>
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
  const semanaSelect = document.getElementById("semana-select");
  const semanaAtual = semanaSelect ? semanaSelect.value : "Semana 17/08 a 23/08";
  
  bancoDados[semanaAtual][setorAtivo][dia].splice(index, 1);
  renderizarQuadro();
}

// PUBLICAÇÃO DE DADOS PARA A TELA DOS LÍDERES
function alternarStatus() {
  const semanaSelect = document.getElementById("semana-select");
  const semanaAtual = semanaSelect ? semanaSelect.value : "Semana 17/08 a 23/08";

  localStorage.setItem("bancoDadosPanificacao", JSON.stringify(bancoDados));
  localStorage.setItem("setoresPanificacao", JSON.stringify(setores));
  localStorage.setItem("semanaAtivaPanificacao", semanaAtual);

  alert("Programação publicada com sucesso no Painel dos Líderes!");
}

function abrirModalCriarSetor() {
  const nomeSetor = prompt("Digite o nome do novo setor:");
  if (nomeSetor && nomeSetor.trim() !== "") {
    const nomeFormatado = nomeSetor.trim().toUpperCase();
    if (!setores.includes(nomeFormatado)) {
      setores.push(nomeFormatado);
      setorAtivo = nomeFormatado;
      renderizarAbas();
      renderizarQuadro();
    }
  }
}

function abrirModalExcel() {
  document.getElementById("modal-excel").style.display = "flex";
}

function fecharModalExcel() {
  document.getElementById("modal-excel").style.display = "none";
  document.getElementById("excel-input").value = "";
}

function processarColagemExcel() {
  const texto = document.getElementById("excel-input").value;
  const diaSelecionado = document.getElementById("select-dia-excel").value;

  if (!texto.trim()) return;

  const semanaSelect = document.getElementById("semana-select");
  const semanaAtual = semanaSelect ? semanaSelect.value : "Semana 17/08 a 23/08";

  const linhas = texto.split("\n");
  linhas.forEach(linha => {
    if (linha.trim()) {
      const colunas = linha.split("\t");
      if (colunas.length >= 2) {
        const qtd = colunas[0].trim();
        const nome = colunas[1].trim();
        if (qtd && nome) {
          bancoDados[semanaAtual][setorAtivo][diaSelecionado].push({ qtd, nome });
        }
      }
    }
  });

  fecharModalExcel();
  renderizarQuadro();
}
