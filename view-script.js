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
let historicoNotificacoes = [];

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

db.ref("semanas").on("value", (snapshot) => {
  semanasData = snapshot.val() || {};
  const listaSemanas = Object.keys(semanasData);

  // Filtra apenas semanas que foram publicadas pelo ADM
  const semanasPublicadas = listaSemanas.filter(k => semanasData[k].publicada === true);

  if (semanasPublicadas.length > 0) {
    if (!semanaAtiva || !semanasData[semanaAtiva] || !semanasData[semanaAtiva].publicada) {
      semanaAtiva = semanasPublicadas[0];
    }
  } else {
    semanaAtiva = "";
  }

  carregarSeletorSemanasView(semanasPublicadas);
  escutarSetoresView();
});

function carregarSeletorSemanasView(semanasPublicadas) {
  const select = document.getElementById("seletor-semana-view");
  if (!select) return;
  select.innerHTML = "";

  if (semanasPublicadas.length === 0) {
    const opt = document.createElement("option");
    opt.innerText = "Aguardando publicação do ADM...";
    select.appendChild(opt);
    return;
  }

  semanasPublicadas.forEach(key => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.innerText = semanasData[key].nome || key;
    if (key === semanaAtiva) opt.selected = true;
    select.appendChild(opt);
  });
}

function mudarSemanaView(novaSemana) {
  semanaAtiva = novaSemana;
  escutarSetoresView();
}

function escutarSetoresView() {
  if (!semanaAtiva) {
    document.getElementById("setores-containers-view").innerHTML = "<p class='item-vazio'>Nenhuma programação foi publicada ainda.</p>";
    return;
  }

  db.ref(`semanas/${semanaAtiva}`).on("value", (snapshot) => {
    const dadosSemana = snapshot.val() || {};
    setoresProgramacao = dadosSemana.programacao || {};
    
    // Carrega o Histórico do Sininho
    const rawHistorico = dadosSemana.historico || {};
    historicoNotificacoes = Object.keys(rawHistorico).map(k => rawHistorico[k]).reverse();

    atualizarSininho();

    const chaves = Object.keys(setoresProgramacao);
    if (chaves.length > 0) {
      if (!setorAtivo || !setoresProgramacao[setorAtivo]) {
        setorAtivo = chaves[0];
      }
    } else {
      setorAtivo = "";
    }

    renderizarSubAbasView();
    renderizarGridsView();
  });
}

function atualizarSininho() {
  const badge = document.getElementById("sininho-contador");
  if (!badge) return;

  if (historicoNotificacoes.length > 0) {
    badge.innerText = historicoNotificacoes.length;
    badge.style.display = "inline-block";
  } else {
    badge.style.display = "none";
  }
}

function abrirModalHistorico() {
  const modal = document.getElementById("modal-historico");
  const body = document.getElementById("modal-body-historico");
  if (!modal || !body) return;

  if (historicoNotificacoes.length === 0) {
    body.innerHTML = "<p class='item-vazio'>Nenhuma atualização gravada nesta semana.</p>";
  } else {
    body.innerHTML = historicoNotificacoes.map(item => `
      <div class="notificacao-item">
        <strong>📍 Setor ${item.setor} (${item.dia})</strong><br>
        <span>${item.detalhe}</span>
        <span class="notificacao-hora">🕒 ${item.dataHora}</span>
      </div>
    `).join("");
  }

  modal.style.display = "flex";
}

function fecharModalHistorico() {
  const modal = document.getElementById("modal-historico");
  if (modal) modal.style.display = "none";
}

function renderizarSubAbasView() {
  const container = document.getElementById("sub-tabs-list-view");
  if (!container) return;
  container.innerHTML = "";

  Object.keys(setoresProgramacao).forEach(chaveAba => {
    const btn = document.createElement("button");
    btn.className = `sub-tab-btn ${chaveAba === setorAtivo ? "active" : ""}`;
    btn.innerText = formatarNomeExibicao(chaveAba);
    btn.onclick = () => {
      setorAtivo = chaveAba;
      renderizarSubAbasView();
      renderizarGridsView();
    };
    container.appendChild(btn);
  });

  const titulo = document.getElementById("setor-titulo-view");
  if (titulo) {
    titulo.innerText = setorAtivo 
      ? "PROGRAMAÇÃO DE " + formatarNomeExibicao(setorAtivo) 
      : "NENHUM SETOR SELECIONADO";
  }
}

function renderizarGridsView() {
  const container = document.getElementById("setores-containers-view");
  if (!container) return;
  container.innerHTML = "";

  if (!setorAtivo || !setoresProgramacao[setorAtivo]) return;

  const dias = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];

  dias.forEach(dia => {
    const objDia = normalizarDia(setoresProgramacao[setorAtivo][dia]);

    const divDia = document.createElement("div");
    divDia.className = "dia-card";

    let itensHTML = objDia.itens.map(item => {
      const temQtd = item.qtd && item.qtd.trim() !== "";
      return `
        <div class="item-linha ${item.alteradoEmSemanaPublicada ? 'item-atualizado' : ''}">
          ${temQtd ? `<span class="item-qtd">${item.qtd}</span>` : ''}
          <span class="item-nome">${item.nome}</span>
        </div>
      `;
    }).join("");

    divDia.innerHTML = `
      <div class="dia-card-header">
        <span>${dia}</span>
        <span class="dia-data-badge">${objDia.data || "---"}</span>
      </div>
      <div class="dia-card-body">
        ${itensHTML || "<p class='item-vazio'>Nenhum item programado.</p>"}
      </div>
    `;

    container.appendChild(divDia);
  });
}