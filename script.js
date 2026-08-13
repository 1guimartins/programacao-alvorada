const firebaseConfig = {
  apiKey: "AIzaSyBen86e0DcOv3LCH9cyvwyCiscIvuM-05E",
  authDomain: "programacao-alvorada.firebaseapp.com",
  databaseURL: "https://programacao-alvorada-default-rtdb.firebaseio.com",
  projectId: "programacao-alvorada",
  storageBucket: "programacao-alvorada.firebasestorage.app",
  messagingSenderId: "482889574306",
  appId: "1:482889574306:web:56463da674a065162c34fb"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

let semanasData = {};
let semanaAtiva = "";
let setoresProgramacao = {};
let setorAtivo = "";
let estaPublicado = false;
let diaSelecionadoModal = "";

function normalizarDia(dados) {
  if (!dados) return { data: "", itens: [] };
  if (Array.isArray(dados)) return { data: "", itens: dados };
  
  let itensArray = [];
  if (dados.itens) {
    if (Array.isArray(dados.itens)) {
      itensArray = dados.itens;
    } else if (typeof dados.itens === 'object') {
      itensArray = Object.keys(dados.itens).map(k => dados.itens[k]);
    }
  }

  return { data: dados.data || "", itens: itensArray };
}

function formatarNomeExibicao(nome) {
  if (!nome) return "";
  return nome.replace(/_BARRA_/g, " / ").replace(/-BARRA-/g, " / ").replace(/BARRA/g, " / ").replace(/_/g, " ");
}

db.ref("semanas_v2").on("value", (snapshot) => {
  semanasData = snapshot.val() || {};
  const listaSemanas = Object.keys(semanasData);

  if (listaSemanas.length === 0) {
    const idPadrao = "SEMANA_PADRAO";
    db.ref(`semanas_v2/${idPadrao}`).set({
      nome: "Semana Atual",
      publicado: false,
      programacao: {}
    });
    semanaAtiva = idPadrao;
  } else if (!semanaAtiva || !semanasData[semanaAtiva]) {
    semanaAtiva = listaSemanas[0];
  }

  carregarSeletorSemanas();
  atualizarDadosSemanaAtiva();
});

function carregarSeletorSemanas() {
  const select = document.getElementById("seletor-semana-adm");
  if (!select) return;
  select.innerHTML = "";

  Object.keys(semanasData).forEach(key => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.innerText = semanasData[key].nome || key;
    if (key === semanaAtiva) opt.selected = true;
    select.appendChild(opt);
  });
}

function mudarSemanaADM(novaSemana) {
  semanaAtiva = novaSemana;
  setorAtivo = "";
  atualizarDadosSemanaAtiva();
}

function atualizarDadosSemanaAtiva() {
  if (!semanaAtiva || !semanasData[semanaAtiva]) return;

  const dadosSemana = semanasData[semanaAtiva];
  estaPublicado = dadosSemana.publicado || false;

  const badge = document.getElementById("status-badge");
  if (badge) {
    badge.innerText = estaPublicado ? "Publicado" : "Rascunho";
    badge.className = `status-badge ${estaPublicado ? 'bg-publicado' : 'bg-rascunho'}`;
  }

  setoresProgramacao = dadosSemana.programacao || {};
  const chaves = Object.keys(setoresProgramacao);

  if (chaves.length > 0) {
    if (!setorAtivo || !setoresProgramacao[setorAtivo]) {
      setorAtivo = chaves[0];
    }
  } else {
    setorAtivo = "";
  }

  renderizarSubAbas();
  renderizarGrids();
}

function renderizarSubAbas() {
  const container = document.getElementById("sub-tabs-list");
  if (!container) return;
  container.innerHTML = "";

  Object.keys(setoresProgramacao).forEach(chaveAba => {
    const btn = document.createElement("button");
    btn.className = `sub-tab-btn ${chaveAba === setorAtivo ? "active" : ""}`;
    btn.innerText = formatarNomeExibicao(chaveAba);
    btn.onclick = () => {
      setorAtivo = chaveAba;
      renderizarSubAbas();
      renderizarGrids();
    };
    container.appendChild(btn);
  });

  const titulo = document.getElementById("setor-titulo");
  if (titulo) {
    titulo.innerText = setorAtivo ? "PROGRAMAÇÃO DE " + formatarNomeExibicao(setorAtivo) : "NENHUM SETOR SELECIONADO";
  }
}

function renderizarGrids() {
  const container = document.getElementById("setores-containers");
  if (!container) return;
  container.innerHTML = "";

  if (!setorAtivo || !setoresProgramacao[setorAtivo]) {
    container.innerHTML = "<p class='item-vazio' style='grid-column: 1/-1; padding: 30px;'>Nenhum setor selecionado nesta semana.</p>";
    return;
  }

  const dias = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];

  dias.forEach(dia => {
    const objDia = normalizarDia(setoresProgramacao[setorAtivo][dia]);

    const divDia = document.createElement("div");
    divDia.className = "dia-card";

    let itensHTML = objDia.itens.map((item, index) => {
      const temQtd = item.qtd && item.qtd.trim() !== "";
      const temTipo = item.tipo && item.tipo.trim() !== "";
      const classeTipo = temTipo ? `tipo-${item.tipo.toUpperCase()}` : '';
      const temProduzido = item.produzido !== undefined && item.produzido !== '';

      return `
        <div class="item-linha">
          ${temQtd ? `<span class="item-qtd">${item.qtd}</span>` : ''}
          ${temTipo ? `<span class="item-tipo ${classeTipo}">${item.tipo}</span>` : ''}
          <span class="item-nome">${item.nome}</span>
          
          ${temProduzido ? `<span class="badge-contagem-lider">Feito: ${item.produzido}</span>` : ''}

          <button class="btn-del-item" onclick="removerItem('${dia}', ${index})" style="margin-left: auto;">&times;</button>
        </div>
      `;
    }).join("");

    divDia.innerHTML = `
      <div class="dia-card-header">
        <span>${dia}</span>
        <input type="text" class="dia-data-input" placeholder="DD/MM/AAAA" value="${objDia.data}" onchange="salvarDataDia('${dia}', this.value)">
      </div>
      <div class="dia-card-body">
        ${itensHTML || "<p class='item-vazio'>Sem itens cadastrados</p>"}
        <button class="btn-add-item-card" onclick="adicionarItem('${dia}')">➕ Adicionar Item</button>
      </div>
    `;

    container.appendChild(divDia);
  });
}

function salvarDataDia(dia, valorData) {
  if (!setoresProgramacao[setorAtivo]) return;

  const objDia = normalizarDia(setoresProgramacao[setorAtivo][dia]);
  objDia.data = valorData;
  db.ref(`semanas_v2/${semanaAtiva}/programacao/${setorAtivo}/${dia}`).set(objDia);

  if (dia === "SEGUNDA" && valorData.includes("/")) {
    const partes = valorData.split("/");
    if (partes.length === 3) {
      const diaNum = parseInt(partes[0], 10);
      const mesNum = parseInt(partes[1], 10) - 1;
      let anoNum = parseInt(partes[2], 10);
      if (anoNum < 100) anoNum += 2000;

      const dataBase = new Date(anoNum, mesNum, diaNum);

      if (!isNaN(dataBase.getTime())) {
        const diasSemana = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];

        diasSemana.forEach((d, index) => {
          if (index > 0) {
            const proximaData = new Date(dataBase);
            proximaData.setDate(dataBase.getDate() + index);

            const dStr = String(proximaData.getDate()).padStart(2, '0');
            const mStr = String(proximaData.getMonth() + 1).padStart(2, '0');
            const aStr = proximaData.getFullYear();

            const objProximo = normalizarDia(setoresProgramacao[setorAtivo][d]);
            objProximo.data = `${dStr}/${mStr}/${aStr}`;
            db.ref(`semanas_v2/${semanaAtiva}/programacao/${setorAtivo}/${d}`).set(objProximo);
          }
        });
      }
    }
  }
}

function adicionarItem(dia) {
  const ehBolosSecos = setorAtivo && setorAtivo.toUpperCase().includes("BOLOS") && setorAtivo.toUpperCase().includes("SECOS");

  if (ehBolosSecos) {
    diaSelecionadoModal = dia;
    document.getElementById("modal-dia-nome").innerText = dia;
    document.getElementById("input-sabor").value = "";
    document.getElementById("modal-bolo").style.display = "flex";
    setTimeout(() => document.getElementById("input-sabor").focus(), 100);
  } else {
    let respQtd = prompt("Digite a quantidade:");
    if (respQtd === null) return;
    let respNome = prompt("Digite o nome do produto:");
    if (!respNome || respNome.trim() === "") return;

    salvarItemBanco(dia, respQtd.trim(), "", respNome.trim().toUpperCase());
  }
}

function fecharModalBolo() {
  document.getElementById("modal-bolo").style.display = "none";
  diaSelecionadoModal = "";
}

function confirmarAdicaoBolo() {
  const qtd = document.getElementById("select-qtd").value;
  const tipo = document.getElementById("select-tipo").value;
  const sabor = document.getElementById("input-sabor").value.trim().toUpperCase();

  if (!sabor) {
    alert("Por favor, digite o sabor do bolo!");
    return;
  }

  salvarItemBanco(diaSelecionadoModal, qtd, tipo, sabor);
  fecharModalBolo();
}

function salvarItemBanco(dia, qtd, tipo, nome) {
  const objDia = normalizarDia(setoresProgramacao[setorAtivo][dia]);

  const novoItem = { 
    qtd: qtd,
    tipo: tipo,
    nome: nome,
    novo: estaPublicado
  };

  objDia.itens.push(novoItem);
  db.ref(`semanas_v2/${semanaAtiva}/programacao/${setorAtivo}/${dia}`).set(objDia);

  if (estaPublicado) {
    const hora = new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
    const textoTipo = tipo ? `[${tipo}] ` : '';
    db.ref(`semanas_v2/${semanaAtiva}/historico_notificacoes`).push({
      texto: `Item adicionado em ${formatarNomeExibicao(setorAtivo)} (${dia}): ${qtd ? qtd + ' ' : ''}${textoTipo}${nome}`,
      hora: hora
    });
  }
}

function removerItem(dia, index) {
  if (confirm("Deseja remover este item?")) {
    const objDia = normalizarDia(setoresProgramacao[setorAtivo][dia]);
    const removido = objDia.itens[index];
    objDia.itens.splice(index, 1);
    db.ref(`semanas_v2/${semanaAtiva}/programacao/${setorAtivo}/${dia}`).set(objDia);

    if (estaPublicado && removido) {
      const hora = new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
      db.ref(`semanas_v2/${semanaAtiva}/historico_notificacoes`).push({
        texto: `Item removido de ${formatarNomeExibicao(setorAtivo)} (${dia}): ${removido.nome}`,
        hora: hora
      });
    }
  }
}

function alternarPublicacao() {
  const novoStatus = !estaPublicado;
  db.ref(`semanas_v2/${semanaAtiva}/publicado`).set(novoStatus).then(() => {
    alert(novoStatus ? "Programação PUBLICADA com sucesso!" : "Programação mudou para RASCUNHO.");
  });
}

function criarNovaSemana() {
  const nomeSemana = prompt("Digite o nome/período da semana (ex: Semana 10/08 a 16/08):");
  if (!nomeSemana || nomeSemana.trim() === "") return;

  const idSemana = "SEMANA_" + Date.now();
  
  db.ref(`semanas_v2/${idSemana}`).set({
    nome: nomeSemana.trim(),
    publicado: false,
    programacao: {}
  }).then(() => {
    semanaAtiva = idSemana;
  });
}

function excluirSemanaAtual() {
  if (!semanaAtiva || !semanasData[semanaAtiva]) return;

  const nomeExibicao = semanasData[semanaAtiva].nome || "esta semana";
  if (confirm(`Deseja realmente EXCLUIR toda a "${nomeExibicao}"?`)) {
    db.ref(`semanas_v2/${semanaAtiva}`).remove().then(() => {
      semanaAtiva = "";
    });
  }
}

function criarNovaAba() {
  const nome = prompt("Digite o nome do novo setor:");
  if (nome && nome.trim() !== "") {
    let chave = nome.trim().toUpperCase().replace(/\//g, "_BARRA_").replace(/[\.\#\$\[\]]/g, "").replace(/\s+/g, "_");

    const novoSetor = {
      SEGUNDA: { data: "", itens: [] }, TERÇA: { data: "", itens: [] },
      QUARTA: { data: "", itens: [] }, QUINTA: { data: "", itens: [] },
      SEXTA: { data: "", itens: [] }, SÁBADO: { data: "", itens: [] },
      DOMINGO: { data: "", itens: [] }
    };

    db.ref(`semanas_v2/${semanaAtiva}/programacao/${chave}`).set(novoSetor).then(() => {
      setorAtivo = chave;
    });
  }
}

function excluirAbaAtual() {
  if (!setorAtivo) return;
  if (confirm(`Deseja realmente excluir o setor "${formatarNomeExibicao(setorAtivo)}"?`)) {
    db.ref(`semanas_v2/${semanaAtiva}/programacao/${setorAtivo}`).remove().then(() => {
      setorAtivo = "";
    });
  }
}