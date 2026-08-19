// ESTRUTURA DE DADOS INICIAL
let setores = ["BOLOS CONGELADOS", "BOLOS SECOS", "EMBALAGEM CONGELADA", "EMBALAGEM SECAS", "LEVAIN", "PANIFICAÇÃO", "PIZZAS CONGELADAS", "PRATOS PRONTOS", "PRÉ-PESAGEM", "PÃO DE QUEIJO / SALGADOS FRITOS", "SALGADOS ASSADOS"];
let setorAtivo = "BOLOS SECOS";

// DADOS DE EXEMPLO DAS PROGRAMAÇÕES
let bancoDados = {
  "BOLOS SECOS": {
    "SEGUNDA": [
      { qtd: "2 rec", tipo: "PLACA", nome: "ABACAXI" },
      { qtd: "2 rec", tipo: "PLACA", nome: "CENOURA C/ COBERTURA" },
      { qtd: "2 rec", tipo: "PLACA", nome: "CENOURA" },
      { qtd: "2 rec", tipo: "PLACA", nome: "CHOCOLATE C/ COBERTURA" },
      { qtd: "2 rec", tipo: "PLACA", nome: "CHOCOLATE" },
      { qtd: "2 rec", tipo: "PLACA", nome: "COCO C/ COBERTURA" },
      { qtd: "2 rec", tipo: "PLACA", nome: "COCO" },
      { qtd: "2 rec", tipo: "PLACA", nome: "FUBÁ" },
      { qtd: "2 rec", tipo: "PLACA", nome: "LARANJA" },
      { qtd: "2 rec", tipo: "PLACA", nome: "LEITE CONDENSADO" },
      { qtd: "2 rec", tipo: "PLACA", nome: "LIMÃO C/ COBERTURA" },
      { qtd: "2 rec", tipo: "PLACA", nome: "LIMÃO" },
      { qtd: "2 rec", tipo: "PLACA", nome: "MILHO" }
    ],
    "TERÇA": [
      { qtd: "1 rec", tipo: "REDONDO", nome: "ABACAXI" },
      { qtd: "1 rec", tipo: "REDONDO", nome: "CENOURA" },
      { qtd: "2 rec", tipo: "REDONDO", nome: "CHOCOLATE" },
      { qtd: "1 rec", tipo: "REDONDO", nome: "COCO" },
      { qtd: "1 rec", tipo: "REDONDO", nome: "FORMIGUEIRO" },
      { qtd: "1 rec", tipo: "REDONDO", nome: "FUBÁ" },
      { qtd: "1 rec", tipo: "REDONDO", nome: "LARANJA" },
      { qtd: "1 rec", tipo: "REDONDO", nome: "LEITE CONDENSADO" },
      { qtd: "1 rec", tipo: "REDONDO", nome: "LIMÃO" },
      { qtd: "1 rec", tipo: "REDONDO", nome: "MILHO" },
      { qtd: "1 rec", tipo: "REDONDO", nome: "NEUTRO" },
      { qtd: "3 rec", tipo: "COBERTURA", nome: "RED VELVET" },
      { qtd: "3 rec", tipo: "COBERTURA", nome: "CENOURA" }
    ],
    "QUARTA": [
      { qtd: "1 rec", tipo: "PLACA", nome: "ABACAXI" },
      { qtd: "1 rec", tipo: "PLACA", nome: "CENOURA" },
      { qtd: "1 rec", tipo: "PLACA", nome: "CHOCOLATE C/ COBERTURA" }
    ],
    "QUINTA": [],
    "SEXTA": [],
    "SÁBADO": [],
    "DOMINGO": []
  }
};

const diasDaSemana = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
  renderizarSetores();
  renderizarProgramacao();
});

// RENDERIZAR ABAS DE SETORES
function renderizarSetores() {
  const container = document.getElementById("container-setores");
  container.innerHTML = "";

  setores.forEach((setor) => {
    const btn = document.createElement("button");
    btn.className = `tab-setor ${setor === setorAtivo ? "active" : ""}`;
    btn.innerText = setor;
    btn.onclick = () => {
      setorAtivo = setor;
      renderizarSetores();
      renderizarProgramacao();
    };
    container.appendChild(btn);
  });
}

// RENDERIZAR QUADROS DOS DIAS E ITENS
function renderizarProgramacao() {
  document.getElementById("titulo-setor-ativo").innerText = `PROGRAMAÇÃO DE ${setorAtivo}`;
  const grid = document.getElementById("grid-dias");
  grid.innerHTML = "";

  if (!bancoDados[setorAtivo]) {
    bancoDados[setorAtivo] = { SEGUNDA: [], TERÇA: [], QUARTA: [], QUINTA: [], SEXTA: [], SÁBADO: [], DOMINGO: [] };
  }

  diasDaSemana.forEach((dia) => {
    const card = document.createElement("div");
    card.className = "day-card";

    const items = bancoDados[setorAtivo][dia] || [];

    let itemsHTML = items.map((item, index) => {
      let badgeClass = "badge-padrao";
      const t = (item.tipo || "").toUpperCase();
      if (t.includes("PLACA")) badgeClass = "badge-placa";
      else if (t.includes("REDONDO")) badgeClass = "badge-redondo";
      else if (t.includes("CREMOSO")) badgeClass = "badge-cremoso";
      else if (t.includes("INGLÊS")) badgeClass = "badge-inglês";
      else if (t.includes("COBERTURA")) badgeClass = "badge-cobertura";
      else if (t.includes("CASEIRO")) badgeClass = "badge-caseiro";

      return `
        <div class="item-row">
          <div class="item-info">
            <span class="badge-rec">${item.qtd}</span>
            <span class="badge-tipo ${badgeClass}">${item.tipo}</span>
            <span class="item-nome">${item.nome}</span>
          </div>
          <button class="btn-remove" onclick="removerItem('${dia}', ${index})">×</button>
        </div>
      `;
    }).join("");

    card.innerHTML = `
      <div class="day-header">
        <span>${dia}</span>
        <span style="font-size: 0.75rem; opacity: 0.8;">${items.length} itens</span>
      </div>
      <div class="day-items-list">
        ${itemsHTML || '<p style="font-size: 0.75rem; color: #94a3b8; text-align: center; padding: 10px;">Nenhum item cadastrado</p>'}
      </div>
    `;

    grid.appendChild(card);
  });
}

// REMOVER ITEM
function removerItem(dia, index) {
  bancoDados[setorAtivo][dia].splice(index, 1);
  renderizarProgramacao();
}

// AÇÕES DOS BOTOES SUPERIORES
function alternarStatus() { alert("Status alterado!"); }
function novaSemanaRascunho() { alert("Nova semana criada como rascunho!"); }
function abrirModalCriarSetor() { document.getElementById("modal-criar-setor").style.display = "flex"; }
function fecharModalCriarSetor() { document.getElementById("modal-criar-setor").style.display = "none"; }

function confirmarCriarSetor() {
  const nome = document.getElementById("input-nome-setor").value.trim().toUpperCase();
  if (nome && !setores.includes(nome)) {
    setores.push(nome);
    setorAtivo = nome;
    renderizarSetores();
    renderizarProgramacao();
    fecharModalCriarSetor();
    document.getElementById("input-nome-setor").value = "";
  }
}

function excluirSetor() {
  if (confirm(`Deseja realmente excluir o setor ${setorAtivo}?`)) {
    setores = setores.filter(s => s !== setorAtivo);
    delete bancoDados[setorAtivo];
    setorAtivo = setores[0] || "";
    renderizarSetores();
    renderizarProgramacao();
  }
}

function excluirSemana() {
  if (confirm("Deseja realmente excluir toda a programação desta semana?")) {
    bancoDados[setorAtivo] = { SEGUNDA: [], TERÇA: [], QUARTA: [], QUINTA: [], SEXTA: [], SÁBADO: [], DOMINGO: [] };
    renderizarProgramacao();
  }
}

// --- FUNÇÃO DE COLAR DO EXCEL ---

function abrirModalExcel() {
  if (!setorAtivo) {
    alert("Selecione um setor antes de importar dados!");
    return;
  }
  document.getElementById("excel-input-texto").value = "";
  document.getElementById("modal-excel").style.display = "flex";
}

function fecharModalExcel() {
  document.getElementById("modal-excel").style.display = "none";
}

function processarColagemExcel() {
  const dia = document.getElementById("excel-select-dia").value;
  const textoCopiado = document.getElementById("excel-input-texto").value;

  if (!textoCopiado.trim()) {
    alert("Cole os dados do Excel antes de processar!");
    return;
  }

  const linhas = textoCopiado.split("\n");
  let tipoAtual = "PLACA";
  let contagemInclusoes = 0;

  const categoriasConhecidas = ["PLACA", "REDONDO", "CREMOSO", "INGLÊS", "COBERTURA", "CASEIRO"];

  linhas.forEach((linha) => {
    if (!linha.trim()) return;

    // As colunas copiadas do Excel vêm separadas por caractere TAB (\t)
    const colunas = linha.split("\t").map(c => c.trim()).filter(c => c !== "");

    // Se a linha contiver apenas o nome do tipo/categoria
    const linhaTextoUnificado = colunas.join(" ").toUpperCase();
    if (categoriasConhecidas.includes(linhaTextoUnificado)) {
      tipoAtual = linhaTextoUnificado;
      return;
    }

    let qtd = "";
    let nome = "";

    // Analisa as colunas da linha lida do Excel
    colunas.forEach((col) => {
      const colUpper = col.toUpperCase();

      // Se for número puro, é a Quantidade
      if (/^\d+$/.test(col)) {
        qtd = col + " rec";
      } 
      // Se for a palavra da categoria isolada, atualiza o tipo atual
      else if (categoriasConhecidas.includes(colUpper)) {
        tipoAtual = colUpper;
      } 
      // Se não for "REC" nem número, é o Nome/Sabor do Bolo
      else if (colUpper !== "REC") {
        nome = colUpper;
      }
    });

    // Se identificou um nome de produto
    if (nome !== "") {
      if (!bancoDados[setorAtivo]) {
        bancoDados[setorAtivo] = { SEGUNDA: [], TERÇA: [], QUARTA: [], QUINTA: [], SEXTA: [], SÁBADO: [], DOMINGO: [] };
      }
      if (!bancoDados[setorAtivo][dia]) {
        bancoDados[setorAtivo][dia] = [];
      }

      bancoDados[setorAtivo][dia].push({
        qtd: qtd || "1 rec",
        tipo: tipoAtual,
        nome: nome
      });

      contagemInclusoes++;
    }
  });

  fecharModalExcel();
  renderizarProgramacao();
  alert(`${contagemInclusoes} itens foram importados com sucesso para ${dia}!`);
}