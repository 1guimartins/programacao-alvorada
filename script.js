// Lista inicial de setores
let setores = [
  "EMBALAGEM CONGELADA", "LEVAIN", "PANIFICAÇÃO", "PIZZAS CONGELADAS", 
  "PRATOS PRONTOS", "PRÉ-PESAGEM", "PÃO DE QUEIJO / SALGADOS FRITOS", "SALGADOS ASSADOS"
];

const diasDaSemana = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];
let setorAtivo = setores[0]; 
let bancoDados = {};

function carregarDadosLocais() {
  const dadosSalvos = localStorage.getItem("bancoDadosPanificacao");
  const setoresSalvos = localStorage.getItem("setoresPanificacao");

  if (setoresSalvos) {
    try { 
      const parsed = JSON.parse(setoresSalvos);
      if (Array.isArray(parsed) && parsed.length > 0) setores = parsed;
    } catch(e){}
  }

  if (!setores.includes(setorAtivo)) {
    setorAtivo = setores[0];
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
  carregarDadosLocais();
  renderizarAbas();
  renderizarQuadro();

  // Escuta atualizações do Firebase em tempo real
  if (typeof firebase !== "undefined" && firebase.database) {
    firebase.database().ref("painelPanificacao").on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.bancoDados) bancoDados = data.bancoDados;
        if (data.setores && Array.isArray(data.setores) && data.setores.length > 0) {
          setores = data.setores;
        }
        if (!setores.includes(setorAtivo)) {
          setorAtivo = setores[0];
        }
        
        atualizarSelectSemanas();
        renderizarAbas();
        renderizarQuadro();
      }
    });
  }
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
  const semanaSelect = document.getElementById("semana-select");
  const semanaAtual = semanaSelect ? semanaSelect.value : Object.keys(bancoDados)[0];
  
  const titulo = document.getElementById("titulo-setor-ativo");
  if (titulo) titulo.innerText = `PROGRAMAÇÃO DE ${setorAtivo}`;

  const grid = document.getElementById("grid-dias-adm") || document.querySelector(".grid-dias");
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
      let textoBadge = [item.qtd, item.tipo].filter(Boolean).join(" ");
      if (!textoBadge && item.qtd) textoBadge = item.qtd;

      return `
        <div class="item-row">
          <div class="item-left-info">
            ${textoBadge ? `<span class="badge-rec">${textoBadge}</span>` : ""}
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
  const semanaAtual = semanaSelect ? semanaSelect.value : Object.keys(bancoDados)[0];
  
  if (bancoDados[semanaAtual] && bancoDados[semanaAtual][setorAtivo] && bancoDados[semanaAtual][setorAtivo][dia]) {
    bancoDados[semanaAtual][setorAtivo][dia].splice(index, 1);
  }
  renderizarQuadro();
}

function excluirSetorAtual() {
  if (setores.length <= 1) {
    alert("Você não pode excluir o único setor existente!");
    return;
  }

  if (confirm(`Tem certeza que deseja excluir o setor "${setorAtivo}"?`)) {
    setores = setores.filter(s => s !== setorAtivo);
    setorAtivo = setores[0];
    
    // Atualiza localmente
    localStorage.setItem("setoresPanificacao", JSON.stringify(setores));
    
    // Força atualização no Firebase se disponível
    if (typeof firebase !== "undefined" && firebase.database) {
      firebase.database().ref("painelPanificacao/setores").set(setores);
    }

    renderizarAbas();
    renderizarQuadro();
  }
}

function alternarStatus() {
  const semanaSelect = document.getElementById("semana-select");
  const semanaAtual = semanaSelect ? semanaSelect.value : Object.keys(bancoDados)[0];

  // Salva no navegador local (backup)
  localStorage.setItem("bancoDadosPanificacao", JSON.stringify(bancoDados));
  localStorage.setItem("setoresPanificacao", JSON.stringify(setores));
  localStorage.setItem("semanaAtivaPanificacao", semanaAtual);

  const dadosParaEnviar = {
    bancoDados: bancoDados,
    setores: setores,
    semanaAtiva: semanaAtual
  };

  // Envia para os celulares via Firebase
  if (typeof firebase !== "undefined" && firebase.database) {
    firebase.database().ref("painelPanificacao").set(dadosParaEnviar)
      .then(() => {
        alert("Programação publicada com sucesso no celular dos líderes!");
      })
      .catch((error) => {
        alert("Erro de conexão com o Firebase: " + error.message);
      });
  } else {
    alert("Dados salvos localmente! (Atenção: Os scripts do Firebase não foram encontrados no HTML).");
  }
}

function abrirModalExcel() {
  const modal = document.getElementById("modal-excel");
  if (modal) modal.style.display = "flex";
}

function fecharModalExcel() {
  const modal = document.getElementById("modal-excel");
  if (modal) modal.style.display = "none";
  const input = document.getElementById("excel-input");
  if (input) input.value = "";
}

function processarColagemExcel() {
  const inputEl = document.getElementById("excel-input") || document.querySelector("textarea");
  const selectEl = document.getElementById("dia-semana-select") || document.querySelector("#modal-excel select");
  const semanaSelect = document.getElementById("semana-select");

  const textoInput = inputEl ? inputEl.value : "";
  const diaSelecionado = selectEl ? selectEl.value : "SEGUNDA";
  const semanaAtual = semanaSelect ? semanaSelect.value : Object.keys(bancoDados)[0];

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

    let colunas = linha.includes("\t") 
      ? linha.split("\t").map(c => c.trim()) 
      : linha.split(/\s{2,}/).map(c => c.trim());

    colunas = colunas.filter(c => c !== "");
    if (colunas.length === 0) return;

    let qtd = "";
    let tipo = "";
    let nome = "";

    if (colunas.length >= 3) {
      qtd = colunas[0];
      tipo = colunas[1];
      nome = colunas.slice(2).join(" ");
    } else if (colunas.length === 2) {
      if (/^\d+/.test(colunas[0])) {
        qtd = colunas[0];
        if (colunas[1].toUpperCase() === "REC" || colunas[1].toLowerCase().endsWith("x")) {
          tipo = colunas[1];
        } else {
          nome = colunas[1];
        }
      } else {
        nome = colunas.join(" ");
      }
    } else {
      const partes = colunas[0].split(/\s+/);
      if (/^\d+/.test(partes[0])) {
        qtd = partes[0];
        if (partes[1] && (partes[1].toUpperCase() === "REC" || partes[1].toLowerCase().endsWith("x"))) {
          tipo = partes[1];
          nome = partes.slice(2).join(" ");
        } else {
          nome = partes.slice(1).join(" ");
        }
      } else {
        nome = colunas[0];
      }
    }

    if (nome || qtd) {
      bancoDados[semanaAtual][setorAtivo][diaSelecionado].push({
        qtd: qtd,
        tipo: tipo,
        categoria: "",
        nome: nome
      });
    }
  });

  fecharModalExcel();
  renderizarQuadro();
}