// ESTRUTURA DE DADOS INICIAL
let setores = ["BOLOS CONGELADOS", "BOLOS SECOS", "EMBALAGEM CONGELADA", "EMBALAGEM SECAS", "LEVAIN", "PANIFICAÇÃO", "PIZZAS CONGELADAS", "PRATOS PRONTOS", "PRÉ-PESAGEM", "PÃO DE QUEIJO / SALGADOS FRITOS", "SALGADOS ASSADOS"];
let setorAtivo = "BOLOS SECOS";

// DADOS DE EXEMPLO DAS PROGRAMAÇÕES
let bancoDados = {
  "BOLOS SECOS": {
    "SEGUNDA": [
      { qtd: "2 rec", tipo: "PLACA", nome: "ABACAXI" },
      { qtd: "2 rec", tipo: "PLACA", nome: "CENOURA C/ COBERTURA" },
      { qtd: "2 rec", tipo: "PLACA", nome: "CENOURA" }
    ],
    "TERÇA": [], "QUARTA": [], "QUINTA": [], "SEXTA": [], "SÁBADO": [], "DOMINGO": []
  },
  "PRÉ-PESAGEM": {
    "SEGUNDA": [
      { qtd: "120 Kg", tipo: "", nome: "MASSA DE PIZZA" },
      { qtd: "3 rec", tipo: "", nome: "CIGARRETE" },
      { qtd: "8 rec", tipo: "", nome: "BOLINHO DE MILHO" },
      { qtd: "8 rec", tipo: "", nome: "BOLINHA DE PIZZA" },
      { qtd: "1 rec", tipo: "", nome: "FRICASSÊ DE FRANGO" },
      { qtd: "4 rec", tipo: "", nome: "PÃO DE QUEIJO LANCHE" }
    ],
    "TERÇA": [], "QUARTA": [], "QUINTA": [], "SEXTA": [], "SÁBADO": [], "DOMINGO": []
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

  const ehBolosSecos = setorAtivo === "BOLOS SECOS";

  diasDaSemana.forEach((dia) => {
    const card = document.createElement("div");
    card.className = "day-card";

    const items = bancoDados[setorAtivo][dia] || [];

    let itemsHTML = items.map((item, index) => {
      let badgeHTML = "";

      // Exibe a TAG de tipo (PLACA, REDONDO, etc.) APENAS no setor BOLOS SECOS
      if (ehBolosSecos && item.tipo) {
        let badgeClass = "badge-padrao";
        const t = item.tipo.toUpperCase();
        if (t.includes("PLACA")) badgeClass = "badge-placa";
        else if (t.includes("REDONDO")) badgeClass = "badge-redondo";
        else if (t.includes("CREMOSO")) badgeClass = "badge-cremoso";
        else if (t.includes("INGLÊS")) badgeClass = "badge-inglês";
        else if (t.includes("COBERTURA")) badgeClass = "badge-cobertura";
        else if (t.includes("CASEIRO")) badgeClass = "badge-caseiro";

        badgeHTML = `<span class="badge-tipo ${badgeClass}">${item.tipo}</span>`;
      }

      return `
        <div class="item-row">
          <div class="item-info">
            <span class="badge-rec" style="min-width: 65px;">${item.qtd}</span>
            ${badgeHTML}
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
  const unidadesConhecidas = ["KG", "KGS", "REC", "RECS", "UN", "UNS", "PCT", "PCTS"];
  const ehBolosSecos = setorAtivo === "BOLOS SECOS";

  linhas.forEach((linha) => {
    if (!linha.trim()) return;

    // Separa por TAB (colunas copiadas do Excel)
    const colunas = linha.split("\t").map(c => c.trim()).filter(c => c !== "");

    if (ehBolosSecos) {
      // REGRA PARA BOLOS SECOS
      const linhaTextoUnificado = colunas.join(" ").toUpperCase();
      if (categoriasConhecidas.includes(linhaTextoUnificado)) {
        tipoAtual = linhaTextoUnificado;
        return;
      }

      let qtd = "";
      let nome = "";

      colunas.forEach((col) => {
        const colUpper = col.toUpperCase();
        if (/^\d+$/.test(col)) {
          qtd = col + " rec";
        } else if (categoriasConhecidas.includes(colUpper)) {
          tipoAtual = colUpper;
        } else if (colUpper !== "REC") {
          nome = colUpper;
        }
      });

      if (nome !== "") {
        garantirEstruturaBanco(dia);
        bancoDados[setorAtivo][dia].push({
          qtd: qtd || "1 rec",
          tipo: tipoAtual,
          nome: nome
        });
        contagemInclusoes++;
      }
    } else {
      // REGRA PARA OUTROS SETORES (PANIFICAÇÃO, PRÉ-PESAGEM, ETC)
      let qtd = "";
      let nome = "";

      if (colunas.length >= 2) {
        qtd = colunas[0];
        nome = colunas.slice(1).join(" ").toUpperCase();
      } else if (colunas.length === 1) {
        nome = colunas[0].toUpperCase();
      }

      // TRATAMENTO DA UNIDADE (Se KG veio junto do Nome, joga para a QTD)
      if (nome !== "") {
        const partesNome = nome.split(" ");
        const primeiraPalavra = partesNome[0].toUpperCase();

        // Se a primeira palavra do nome for KG, KGS, REC, UN, etc.
        if (unidadesConhecidas.includes(primeiraPalavra)) {
          // Se qtd era só o número "50", vira "50 KG"
          if (/^\d+$/.test(qtd.trim())) {
            qtd = `${qtd.trim()} ${primeiraPalavra.toLowerCase()}`;
          } else if (!qtd) {
            qtd = `1 ${primeiraPalavra.toLowerCase()}`;
          }
          // Remove a unidade do início do nome
          nome = partesNome.slice(1).join(" ");
        } else if (/^\d+$/.test(qtd.trim())) {
          // Caso padrão se for só número sem unidade
          qtd = `${qtd.trim()} rec`;
        }
      }

      if (nome !== "") {
        garantirEstruturaBanco(dia);
        bancoDados[setorAtivo][dia].push({
          qtd: qtd,
          tipo: "",
          nome: nome
        });
        contagemInclusoes++;
      }
    }
  });

  fecharModalExcel();
  renderizarProgramacao();
  alert(`${contagemInclusoes} itens foram importados com sucesso para ${dia}!`);
}

function garantirEstruturaBanco(dia) {
  if (!bancoDados[setorAtivo]) {
    bancoDados[setorAtivo] = { SEGUNDA: [], TERÇA: [], QUARTA: [], QUINTA: [], SEXTA: [], SÁBADO: [], DOMINGO: [] };
  }
  if (!bancoDados[setorAtivo][dia]) {
    bancoDados[setorAtivo][dia] = [];
  }
}