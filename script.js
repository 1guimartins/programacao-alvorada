// Banco de dados dos produtos por categoria (Aba Progresso)
const bancoDeDados = {
  "191-1 - PÃES / ROSCAS": [
    { codigo: 2171, nome: "BRIOCHE C/ COCO UN - 275g", pedido: 0, produzido: 0 },
    { codigo: 2172, nome: "BRIOCHE TRADICIONAL UN - 225g", pedido: 226, produzido: 0 },
    { codigo: 2175, nome: "PÃO DE BATATA ALVORADA C/ 4UN - 200g", pedido: 619, produzido: 0 },
    { codigo: 5370, nome: "PÃO DE CEBOLA ALVORADA UN - 200g", pedido: 80, produzido: 0 },
    { codigo: 2555, nome: "PÃO DE FORMA 52% INTEGRAL UN - 400g", pedido: 80, produzido: 0 },
    { codigo: 5170, nome: "PÃO DE FORMA P/ TORTA UN - 400g", pedido: 0, produzido: 0 },
    { codigo: 2916, nome: "PÃO DE FORMA TRADICIONAL UN - 500g", pedido: 88, produzido: 0 },
    { codigo: 2250, nome: "PÃO DE HAMBÚRGUER C/ GERGELIM C/ 4UN - 260g", pedido: 344, produzido: 0 }
  ],
  "14.77.487 - PÃO QUEIJO / MINI SALGADO": [
    { codigo: 3001, nome: "PÃO DE QUEIJO CONGELADO 1KG", pedido: 500, produzido: 0 },
    { codigo: 3002, nome: "MINI COXINHA C/ REQUEIJÃO 1KG", pedido: 350, produzido: 0 }
  ]
};

// Estrutura de dados das Sub-Abas da Programação Semanal
let setoresProgramacao = {
  "PRÉ PESAGEM_RECHEIO": {
    titulo: "PROGRAMAÇÃO DE PRÉ PESAGEM E RECHEIO",
    datas: { segunda: "10/08/2026", terca: "11/08/2026", quarta: "12/08/2026", quinta: "13/08/2026", sexta: "14/08/2026", sabado: "15/08/2026", domingo: "16/08/2026" },
    dias: {
      segunda: [
        { qtd: "120 Kg", produto: "MASSA DE PIZZA" },
        { qtd: "3 rec", produto: "CIGARRETE" },
        { qtd: "2 rec", produto: "COOKIES TRADICIONAL" },
        { qtd: "2 rec", produto: "MINI EMPADINHA FESTA" },
        { qtd: "16 rec", produto: "BROA AEROSA" },
        { qtd: "2 rec", produto: "STROGONOFF DE CARNE C/ ARROZ" }
      ],
      terca: [
        { qtd: "6 rec", produto: "CIGARRETE" },
        { qtd: "8 rec", produto: "BOLINHA DE MILHO" },
        { qtd: "8 rec", produto: "BOLINHA DE PIZZA" },
        { qtd: "6 rec", produto: "PÃO DE QUEIJO LANCHE" },
        { qtd: "30 kg", produto: "CROISSANT DE PRESUNTO E QUEIJO" }
      ],
      quarta: [
        { qtd: "120 kg", produto: "MASSA DE PIZZA" },
        { qtd: "5 rec", produto: "ESFIHA ABERTA DE 4 QUEIJOS" },
        { qtd: "2 rec", produto: "MINI EMPADINHA FESTA" },
        { qtd: "4 rec", produto: "MINI EMPADA DE FRANGO C/ 6" },
        { qtd: "6 rec", produto: "PÃO DE QUEIJO TRADICIONAL" },
        { qtd: "2 rec", produto: "FEIJOADA" },
        { qtd: "200 kg", produto: "BISCOITINHO DE QUEIJO" }
      ],
      quinta: [
        { qtd: "120 kg", produto: "MASSA DE PIZZA" },
        { qtd: "5 rec", produto: "ESFIHA FECHADA DE FRANGO C/ CATUPIRY" },
        { qtd: "16 rec", produto: "MINI COXINHA DE FRANGO" },
        { qtd: "2 rec", produto: "MINI EMPADINHA FESTA" },
        { qtd: "3 rec", produto: "PÃO DE QUEIJO LANCHE" },
        { qtd: "3 rec", produto: "PÃO DE QUEIJO 3 QUEIJOS" }
      ],
      sexta: [
        { qtd: "4 rec", produto: "DOGUINHO" },
        { qtd: "5 rec", produto: "MISTO DE PRESUNTO E QUEIJO" },
        { qtd: "16 rec", produto: "BOLINHA DE QUEIJO" },
        { qtd: "16 rec", produto: "BROA AEROSA" },
        { qtd: "20 kg", produto: "CROISSANT DE FRANGO" }
      ],
      sabado: [
        { qtd: "120 kg", produto: "MASSA DE PIZZA" },
        { qtd: "3 rec", produto: "CIGARRETE" }
      ],
      domingo: [
        { qtd: "120 kg", produto: "MASSA DE PIZZA" }
      ]
    }
  },
  "PRATOS PRONTOS": criarEstruturaPadrao("PROGRAMAÇÃO DE PRATOS PRONTOS"),
  "SALGADOS FRITOS E PÃO DE QUEIJO": criarEstruturaPadrao("PROGRAMAÇÃO DE SALGADOS FRITOS E PÃO DE QUEIJO"),
  "SALGADOS ASSADOS": criarEstruturaPadrao("PROGRAMAÇÃO DE SALGADOS ASSADOS"),
  "CONG_CAMARA": criarEstruturaPadrao("PROGRAMAÇÃO DE CÂMARA DE CONGELADOS"),
  "BISCOITÃO": criarEstruturaPadrao("PROGRAMAÇÃO DE BISCOITÃO"),
  "PIZZA_CONG_": criarEstruturaPadrao("PROGRAMAÇÃO DE PIZZAS CONGELADAS"),
  "CONFEITARIA": criarEstruturaPadrao("PROGRAMAÇÃO DE CONFEITARIA"),
  "CONFEITARIA-BOLOS": criarEstruturaPadrao("PROGRAMAÇÃO DE CONFEITARIA - BOLOS"),
  "PÃO LEVAIN": criarEstruturaPadrao("PROGRAMAÇÃO DE PÃO LEVAIN")
};

function criarEstruturaPadrao(titulo) {
  return {
    titulo: titulo,
    datas: { segunda: "10/08/2026", terca: "11/08/2026", quarta: "12/08/2026", quinta: "13/08/2026", sexta: "14/08/2026", sabado: "15/08/2026", domingo: "16/08/2026" },
    dias: { segunda: [], terca: [], quarta: [], quinta: [], sexta: [], sabado: [], domingo: [] }
  };
}

let categoriaAtual = "191-1 - PÃES / ROSCAS";
let setorAtivo = "PRÉ PESAGEM_RECHEIO";

function iniciar() {
  renderizarBotoesCategorias();
  carregarTabela(categoriaAtual);
  atualizarKPIs();
  renderizarSubAbas();
  renderizarGridsSetores();
}

function trocarAbaPrincipal(botaoClicado, idAbaDestino) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.aba-conteudo').forEach(aba => aba.style.display = 'none');

  botaoClicado.classList.add('active');
  const abaSelecionada = document.getElementById(idAbaDestino);
  if (abaSelecionada) abaSelecionada.style.display = 'block';
}

/* ==========================================
   FUNÇÕES DA PROGRAMAÇÃO SEMANAL E SUB-ABAS
   ========================================== */

function renderizarSubAbas() {
  const container = document.getElementById("sub-tabs-list");
  if (!container) return;
  container.innerHTML = "";

  Object.keys(setoresProgramacao).forEach(key => {
    const btn = document.createElement("button");
    btn.className = `sub-tab-btn ${key === setorAtivo ? 'active' : ''}`;
    btn.innerText = key;
    btn.onclick = () => selecionarSetor(key);
    container.appendChild(btn);
  });
}

function selecionarSetor(key) {
  setorAtivo = key;
  renderizarSubAbas();

  // Atualizar título
  document.getElementById("setor-titulo-display").innerText = setoresProgramacao[key].titulo;

  // Alternar visibilidade das grids
  document.querySelectorAll('.setor-grid-container').forEach(grid => {
    grid.style.display = 'none';
    grid.classList.remove('active-setor');
  });

  const gridAtiva = document.getElementById(`grid-setor-${formatarId(key)}`);
  if (gridAtiva) {
    gridAtiva.style.display = 'block';
    gridAtiva.classList.add('active-setor');
  }
}

function criarNovaSubAba() {
  const nomeAba = prompt("Digite o nome da nova aba/setor:");
  if (!nomeAba || nomeAba.trim() === "") return;

  const key = nomeAba.trim().toUpperCase();
  if (setoresProgramacao[key]) {
    alert("Já existe uma aba com esse nome!");
    return;
  }

  setoresProgramacao[key] = criarEstruturaPadrao(`PROGRAMAÇÃO DE ${key}`);

  renderizarSubAbas();
  renderizarGridsSetores();
  selecionarSetor(key);
}

function excluirAbaAtual() {
  const chaves = Object.keys(setoresProgramacao);
  if (chaves.length <= 1) {
    alert("Você não pode excluir todas as abas!");
    return;
  }

  if (confirm(`Tem certeza que deseja excluir a aba "${setorAtivo}"?`)) {
    delete setoresProgramacao[setorAtivo];
    setorAtivo = Object.keys(setoresProgramacao)[0];
    renderizarSubAbas();
    renderizarGridsSetores();
    selecionarSetor(setorAtivo);
  }
}

function renderizarGridsSetores() {
  const container = document.getElementById("setores-containers");
  if (!container) return;
  container.innerHTML = "";

  Object.keys(setoresProgramacao).forEach(setorKey => {
    const setorData = setoresProgramacao[setorKey];
    const setorId = formatarId(setorKey);

    const setorDiv = document.createElement("div");
    setorDiv.id = `grid-setor-${setorId}`;
    setorDiv.className = `setor-grid-container ${setorKey === setorAtivo ? 'active-setor' : ''}`;
    setorDiv.style.display = setorKey === setorAtivo ? 'block' : 'none';

    setorDiv.innerHTML = `
      <div class="programacao-grid">
        ${gerarCardDia(setorKey, 'segunda', 'SEGUNDA-FEIRA')}
        ${gerarCardDia(setorKey, 'terca', 'TERÇA-FEIRA')}
        ${gerarCardDia(setorKey, 'quarta', 'QUARTA-FEIRA')}
        ${gerarCardDia(setorKey, 'quinta', 'QUINTA-FEIRA')}
        ${gerarCardDia(setorKey, 'sexta', 'SEXTA-FEIRA')}
        ${gerarCardDia(setorKey, 'sabado', 'SÁBADO')}
        ${gerarCardDia(setorKey, 'domingo', 'DOMINGO', true)}
      </div>
    `;

    container.appendChild(setorDiv);
    carregarTabelasSetor(setorKey);
  });
}

function gerarCardDia(setorKey, diaKey, diaNome, fullWidth = false) {
  const dataAtual = setoresProgramacao[setorKey].datas[diaKey] || "10/08/2026";
  return `
    <div class="dia-box ${fullWidth ? 'full-width' : ''}">
      <div class="dia-title">
        ${diaNome} 
        <span class="data-editable" contenteditable="true" 
          onblur="atualizarData('${setorKey}', '${diaKey}', this.innerText)">${dataAtual}</span>
      </div>
      <table class="tb-prog">
        <tbody id="body-${formatarId(setorKey)}-${diaKey}"></tbody>
      </table>
      <button class="btn-add-day no-print" onclick="adicionarLinhaProgramacao('${setorKey}', '${diaKey}')">➕ Add Item em ${diaNome.split('-')[0]}</button>
    </div>
  `;
}

function atualizarData(setorKey, diaKey, novaData) {
  setoresProgramacao[setorKey].datas[diaKey] = novaData.trim();
}

function carregarTabelasSetor(setorKey) {
  const setorData = setoresProgramacao[setorKey];
  if (!setorData) return;

  Object.keys(setorData.dias).forEach(diaKey => {
    const tbody = document.getElementById(`body-${formatarId(setorKey)}-${diaKey}`);
    if (!tbody) return;
    tbody.innerHTML = "";

    setorData.dias[diaKey].forEach((item, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td contenteditable="true">${item.qtd}</td>
        <td contenteditable="true">${item.produto}</td>
        <td class="no-print" style="width: 25px; text-align: center;">
          <button class="btn-del-row" onclick="removerLinhaProgramacao('${setorKey}', '${diaKey}', ${index})">✕</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });
}

function adicionarLinhaProgramacao(setorKey, diaKey) {
  setoresProgramacao[setorKey].dias[diaKey].push({ qtd: "1 rec", produto: "NOVO ITEM" });
  carregarTabelasSetor(setorKey);
}

function removerLinhaProgramacao(setorKey, diaKey, index) {
  setoresProgramacao[setorKey].dias[diaKey].splice(index, 1);
  carregarTabelasSetor(setorKey);
}

function formatarId(texto) {
  return texto.replace(/[^a-zA-Z0-9]/g, "_");
}

/* ==========================================
   FUNÇÕES DA ABA PROGRESSO DA PRODUÇÃO
   ========================================== */

function renderizarBotoesCategorias() {
  const container = document.getElementById("category-buttons");
  if (!container) return;
  container.innerHTML = "";

  Object.keys(bancoDeDados).forEach(cat => {
    const btn = document.createElement("button");
    btn.className = `cat-btn ${cat === categoriaAtual ? 'active' : ''}`;
    btn.innerText = cat;
    btn.onclick = () => {
      categoriaAtual = cat;
      document.getElementById("category-title").innerText = cat;
      renderizarBotoesCategorias();
      carregarTabela(categoriaAtual);
    };
    container.appendChild(btn);
  });
}

function carregarTabela(categoria) {
  const tbody = document.getElementById("table-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  const produtos = bancoDeDados[categoria] || [];

  produtos.forEach((prod, index) => {
    const falta = Math.max(0, prod.pedido - prod.produzido);
    const progresso = prod.pedido > 0 ? Math.min(100, Math.round((prod.produzido / prod.pedido) * 100)) : 0;
    const status = prod.produzido >= prod.pedido && prod.pedido > 0 ? "CONCLUÍDO" : "EM PRODUÇÃO";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><b>${prod.codigo}</b></td>
      <td>${prod.nome}</td>
      <td><b>${prod.pedido}</b></td>
      <td>
        <input type="number" class="input-produzido" value="${prod.produzido}" min="0" 
          onchange="atualizarProduzido('${categoria}', ${index}, this.value)">
      </td>
      <td style="color: ${falta > 0 ? '#fd7e14' : '#28a745'}; font-weight: bold;">${falta}</td>
      <td>${progresso}%</td>
      <td><span class="status-badge ${status === 'CONCLUÍDO' ? 'concluido' : 'em-producao'}">${status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function atualizarProduzido(categoria, index, valor) {
  bancoDeDados[categoria][index].produzido = parseInt(valor) || 0;
  carregarTabela(categoria);
  atualizarKPIs();
}

function atualizarKPIs() {
  let totalPedido = 0, totalProduzido = 0;
  Object.values(bancoDeDados).forEach(lista => {
    lista.forEach(prod => {
      totalPedido += prod.pedido;
      totalProduzido += prod.produzido;
    });
  });

  const faltaTotal = Math.max(0, totalPedido - totalProduzido);
  document.getElementById("kpi-total").innerText = `${totalPedido.toLocaleString('pt-BR')} un`;
  document.getElementById("kpi-produzido").innerText = `${totalProduzido.toLocaleString('pt-BR')} un`;
  document.getElementById("kpi-falta").innerText = `${faltaTotal.toLocaleString('pt-BR')} un`;
}

window.onload = iniciar;

// Adicione esta função no seu script.js do ADM:
function salvarDadosLocalmente() {
  localStorage.setItem("panificacao_programacao", JSON.stringify(setoresProgramacao));
}

// Chame 'salvarDadosLocalmente()' sempre que fizer alguma alteração no ADM!