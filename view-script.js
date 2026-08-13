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

let setoresProgramacao = {};
let setorAtivo = "";
let estaPublicado = false;
let historico = [];

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

db.ref("status_publicacao").on("value", (snapshot) => {
  estaPublicado = snapshot.val() || false;
  renderizarGridsView();
});

db.ref("historico_notificacoes").on("value", (snapshot) => {
  const data = snapshot.val() || {};
  historico = Object.keys(data).map(k => data[k]).reverse();
});

db.ref("programacao").on("value", (snapshot) => {
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
});

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
    titulo.innerText = setorAtivo ? "PROGRAMAÇÃO DE " + formatarNomeExibicao(setorAtivo) : "NENHUM SETOR SELECIONADO";
  }
}

function renderizarGridsView() {
  const container = document.getElementById("setores-containers-view");
  if (!container) return;
  container.innerHTML = "";

  if (!estaPublicado) {
    container.innerHTML = "<p class='item-vazio' style='grid-column: 1/-1; padding: 40px; font-size: 1.1rem;'>🔒 A programação está sendo atualizada pelo ADM. Aguarde a publicação.</p>";
    return;
  }

  if (!setorAtivo || !setoresProgramacao[setorAtivo]) return;

  const dias = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];

  dias.forEach(dia => {
    const objDia = normalizarDia(setoresProgramacao[setorAtivo][dia]);

    const divDia = document.createElement("div");
    divDia.className = "dia-card";

    let itensHTML = objDia.itens.map(item => {
      const temQtd = item.qtd && item.qtd.trim() !== "";
      const temTipo = item.tipo && item.tipo.trim() !== "";
      return `
        <div class="item-linha ${item.novo ? 'item-novo' : ''}">
          ${temQtd ? `<span class="item-qtd">${item.qtd}</span>` : ''}
          ${temTipo ? `<span class="item-tipo">${item.tipo}</span>` : ''}
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

function abrirModal() {
  const modal = document.getElementById("modal-notificacoes");
  const lista = document.getElementById("modal-lista");
  if (!modal || !lista) return;

  if (historico.length === 0) {
    lista.innerHTML = "<p class='item-vazio'>Sem histórico de alterações.</p>";
  } else {
    lista.innerHTML = historico.map(h => `
      <div style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 0.85rem;">
        <strong>${h.texto}</strong>
        <div style="color: #94a3b8; font-size: 0.75rem;">🕒 ${h.hora}</div>
      </div>
    `).join("");
  }

  modal.style.display = "flex";
}

function fecharModal() {
  document.getElementById("modal-notificacoes").style.display = "none";
}