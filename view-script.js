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

  if (listaSemanas.length > 0 && (!semanaAtiva || !semanasData[semanaAtiva])) {
    semanaAtiva = listaSemanas[0];
  }

  carregarSeletorSemanasView();
  escutarSetoresView();
});

function carregarSeletorSemanasView() {
  const select = document.getElementById("seletor-semana-view");
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

function mudarSemanaView(novaSemana) {
  semanaAtiva = novaSemana;
  escutarSetoresView();
}

function escutarSetoresView() {
  db.ref(`semanas/${semanaAtiva}/programacao`).on("value", (snapshot) => {
    setoresProgramacao = snapshot.val() || {};
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
    verificarAtualizacaoSetor();
  });
}

function setorTemAtualizacao(chaveSetor) {
  if (!setoresProgramacao[chaveSetor]) return false;
  const dias = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];
  
  for (let d of dias) {
    const obj = normalizarDia(setoresProgramacao[chaveSetor][d]);
    if (obj.itens.some(item => item.atualizado === true)) {
      return true;
    }
  }
  return false;
}

function verificarAtualizacaoSetor() {
  const banner = document.getElementById("banner-alerta-lider");
  if (!banner) return;

  if (setorTemAtualizacao(setorAtivo)) {
    banner.style.display = "flex";
  } else {
    banner.style.display = "none";
  }
}

function renderizarSubAbasView() {
  const container = document.getElementById("sub-tabs-list-view");
  if (!container) return;
  container.innerHTML = "";

  Object.keys(setoresProgramacao).forEach(chaveAba => {
    const btn = document.createElement("button");
    const temNovaAlt = setorTemAtualizacao(chaveAba);
    btn.className = `sub-tab-btn ${chaveAba === setorAtivo ? "active" : ""} ${temNovaAlt ? "has-update" : ""}`;
    btn.innerText = formatarNomeExibicao(chaveAba);
    btn.onclick = () => {
      setorAtivo = chaveAba;
      renderizarSubAbasView();
      renderizarGridsView();
      verificarAtualizacaoSetor();
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
        <div class="item-linha ${item.atualizado ? 'item-atualizado' : ''}">
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

function limparNotificacoesSetor() {
  if (!setorAtivo || !setoresProgramacao[setorAtivo]) return;

  const dias = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];

  dias.forEach(dia => {
    const objDia = normalizarDia(setoresProgramacao[setorAtivo][dia]);
    let mudou = false;

    objDia.itens.forEach(item => {
      if (item.atualizado) {
        delete item.atualizado;
        mudou = true;
      }
    });

    if (mudou) {
      db.ref(`semanas/${semanaAtiva}/programacao/${setorAtivo}/${dia}`).set(objDia);
    }
  });

  document.getElementById("banner-alerta-lider").style.display = "none";
}