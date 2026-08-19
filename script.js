let setores = [
  "BOLOS CONGELADOS", "BOLOS SECOS", "EMBALAGEM CONGELADA", "EMBALAGEM SECAS", 
  "LEVAIN", "PANIFICAÇÃO", "PIZZAS CONGELADAS", "PRATOS PRONTOS", 
  "PRÉ-PESAGEM", "PÃO DE QUEIJO / SALGADOS FRITOS", "SALGADOS ASSADOS"
];

const diasDaSemana = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];
let setorAtivo = "BOLOS SECOS";
let bancoDados = {};

function carregarDados() {
  const dadosSalvos = localStorage.getItem("bancoDadosPanificacao");
  const setoresSalvos = localStorage.getItem("setoresPanificacao");

  if (setoresSalvos) {
    try { setores = JSON.parse(setoresSalvos); } catch(e){}
  }

  if (dadosSalvos) {
    try { bancoDados = JSON.parse(dadosSalvos); } catch(e){}
  } else {
    const semanaInicial = "Semana 17/08 a 23/08";
    bancoDados[semanaInicial] = {};
    setores.forEach(setor => {
      bancoDados[semanaInicial][setor] = {};
      diasDaSemana.forEach(dia => {
        bancoDados[semanaInicial][setor][dia] = [];
      });
    });
  }

  atualizarSelectSemanas();
}

document.addEventListener("DOMContentLoaded", () => {
  carregarDados();
  renderizarAbas();
  renderizarQuadro();
});

function atualizarSelectSemanas() {
  const semanaSelect = document.getElementById("semana-select");
  if (!semanaSelect) return;

  const valorSelecionadoAtual = semanaSelect.value;
  semanaSelect.innerHTML = "";

  const listaSemanas = Object.keys(bancoDados);

  listaSemanas.forEach(semana => {
    const option = document.createElement("option");
    option.value = semana;
    option.innerText = semana;
    semanaSelect.appendChild(option);
  });

  if (listaSemanas.includes(valorSelecionadoAtual)) {
    semanaSelect.value = valorSelecionadoAtual;
  } else if (listaSemanas.length > 0) {
    semanaSelect.value = listaSemanas[0];
  }
}

function trocarSemana() {
  renderizarQuadro();
}

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

function extrairCategoriaDoTexto(texto) {
  if (!texto) return { categoria: "", nomeLimpo: "" };
  
  const categoriasConhecidas = ["PLACA E COBERTURA", "PLACA", "COBERTURA", "CASEIRO", "INGLÊS", "INGLES", "CREMOSO", "REDONDO"];
  let categoriaEncontrada = "";
  let nomeLimpo = texto;

  for (const cat of categoriasConhecidas) {
    const regex = new RegExp(`\\b${cat}\\b`, "i");
    if (regex.test(texto)) {
      categoriaEncontrada = cat.toUpperCase();
      nomeLimpo = texto.replace(regex, "").trim();
      break;
    }
  }

  return { categoria: categoriaEncontrada, nomeLimpo: nomeLimpo || texto };
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
  const rotulosDias = obterDatasDaSemana(semanaAtual);

  diasDaSemana.forEach((dia) => {
    if (!dadosSetor[dia]) dadosSetor[dia] = [];
    const listaItens = dadosSetor[dia];

    const card = document.createElement("div");
    card.className = "day-card";

    let itensHTML = listaItens.map((item, index) => {
      const classeCor = obterClasseCategoria(item.categoria);
      
      let badgeQtd = "";
      if (item.qtd || item.tipo) {
        const textoBadge = [item.qtd, item.tipo].filter(Boolean).join(" ");
        badgeQtd = `<span class="badge-rec">${textoBadge}</span>`;
      }

      return `
        <div class="item-row">
          <div class="item-left-info">
            ${badgeQtd}
            ${item.categoria ? `<span class="badge-categoria ${classeCor}">${item.categoria}</span>` : ""}
            <span class="item-nome">${item.nome}</span>
          </div>
          <button class="btn-del-item" onclick="removerItem('${dia}', ${index})">×</button>
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

function removerItem(dia, index) {
  const semanaSelect = document.getElementById("semana-select");
  const semanaAtual = semanaSelect ? semanaSelect.value : "Semana 17/08 a 23/08";
  
  if (bancoDados[semanaAtual] && bancoDados[semanaAtual][setorAtivo] && bancoDados[semanaAtual][setorAtivo][dia]) {
    bancoDados[semanaAtual][setorAtivo][dia].splice(index, 1);
  }
  renderizarQuadro();
}

function criarNovaSemanaRascunho() {
  const nomeNovaSemana = prompt("Digite o nome da nova semana (Ex: Semana 24/08 a 30/08):");
  
  if (nomeNovaSemana && nomeNovaSemana.trim() !== "") {
    const nomeFormatado = nomeNovaSemana.trim();

    if (bancoDados[nomeFormatado]) {
      alert("Esta semana já existe!");
      return;
    }

    bancoDados[nomeFormatado] = {};
    setores.forEach(setor => {
      bancoDados[nomeFormatado][setor] = {};
      diasDaSemana.forEach(dia => {
        bancoDados[nomeFormatado][setor][dia] = [];
      });
    });

    atualizarSelectSemanas();
    document.getElementById("semana-select").value = nomeFormatado;
    renderizarQuadro();
  }
}

function excluirSemanaAtual() {
  const semanaSelect = document.getElementById("semana-select");
  const semanaAtual = semanaSelect ? semanaSelect.value : "";

  const listaSemanas = Object.keys(bancoDados);

  if (listaSemanas.length <= 1) {
    alert("Você não pode excluir a única semana existente!");
    return;
  }

  if (confirm(`Tem certeza que deseja excluir a "${semanaAtual}"?`)) {
    delete bancoDados[semanaAtual];
    atualizarSelectSemanas();
    renderizarQuadro();
  }
}

function excluirSetorAtual() {
  if (setores.length <= 1) {
    alert("Você não pode excluir o único setor existente!");
    return;
  }

  if (confirm(`Tem certeza que deseja excluir o setor "${setorAtivo}"?`)) {
    setores = setores.filter(s => s !== setorAtivo);
    setorAtivo = setores[0];
    renderizarAbas();
    renderizarQuadro();
  }
}

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
  const inputEl = document.getElementById("excel-input") || document.querySelector("textarea");
  const selectEl = document.getElementById("dia-semana-select") || document.querySelector("#modal-excel select");
  const semanaSelect = document.getElementById("semana-select");

  const textoInput = inputEl ? inputEl.value : "";
  const diaSelecionado = selectEl ? selectEl.value : "SEGUNDA";
  const semanaAtual = semanaSelect ? semanaSelect.value : "Semana 17/08 a 23/08";

  if (!textoInput.trim()) {
    alert("Por favor, cole os dados do Excel na caixa de texto.");
    return;
  }

  if (!bancoDados[semanaAtual]) bancoDados[semanaAtual] = {};
  if (!bancoDados[semanaAtual][setorAtivo]) bancoDados[semanaAtual][setorAtivo] = {};
  if (!bancoDados[semanaAtual][setorAtivo][diaSelecionado]) {
    bancoDados[semanaAtual][setorAtivo][diaSelecionado] = [];
  }

  const linhas = textoInput.split(/\r?\n/);

  linhas.forEach(linha => {
    if (!linha.trim()) return;

    let colunas = [];
    if (linha.includes("\t")) {
      colunas = linha.split("\t").map(c => c.trim());
    } else {
      colunas = linha.split(/\s{2,}/).map(c => c.trim());
    }

    let qtd = "";
    let tipo = "";
    let nomeBruto = "";

    if (colunas.length >= 3) {
      qtd = colunas[0];
      tipo = colunas[1];
      nomeBruto = colunas.slice(2).join(" ");
    } else if (colunas.length === 2) {
      qtd = colunas[0];
      nomeBruto = colunas[1];
    } else {
      nomeBruto = colunas[0] || "";
    }

    const { categoria, nomeLimpo } = extrairCategoriaDoTexto(nomeBruto);

    if (nomeLimpo || qtd) {
      bancoDados[semanaAtual][setorAtivo][diaSelecionado].push({
        qtd: qtd,
        tipo: tipo,
        categoria: categoria,
        nome: nomeLimpo
      });
    }
  });

  fecharModalExcel();
  renderizarQuadro();
}