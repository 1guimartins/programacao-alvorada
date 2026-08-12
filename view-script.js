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

// Atualização em tempo real do Firebase
db.ref("programacao").on("value", (snapshot) => {
  const dados = snapshot.val();
  if (dados) {
    setoresProgramacao = dados;
    const chaves = Object.keys(setoresProgramacao);
    if (!setorAtivo && chaves.length > 0) setorAtivo = chaves[0];
    renderizarSubAbasView();
    renderizarGridsView();
  }
});

function renderizarSubAbasView() {
  const container = document.getElementById("sub-tabs-list-view");
  if (!container) return;
  container.innerHTML = "";

  Object.keys(setoresProgramacao).forEach(nomeAba => {
    const btn = document.createElement("button");
    btn.className = `sub-tab-btn ${nomeAba === setorAtivo ? "active" : ""}`;
    btn.innerText = nomeAba.replace(/_/g, " ");
    btn.onclick = () => {
      setorAtivo = nomeAba;
      renderizarSubAbasView();
      renderizarGridsView();
    };
    container.appendChild(btn);
  });

  const tituloView = document.getElementById("setor-titulo-view");
  if (tituloView && setorAtivo) {
    tituloView.innerText = "PROGRAMAÇÃO DE " + setorAtivo.replace(/_/g, " ");
  }
}

function renderizarGridsView() {
  const container = document.getElementById("setores-containers-view");
  if (!container) return;
  container.innerHTML = "";

  if (!setorAtivo || !setoresProgramacao[setorAtivo]) return;

  const dias = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];

  dias.forEach(dia => {
    const itens = setoresProgramacao[setorAtivo][dia] || [];

    const divDia = document.createElement("div");
    divDia.className = "dia-card";

    let itensHTML = itens.map(item => `
      <div class="item-linha">
        <span class="item-qtd">${item.qtd}</span>
        <span class="item-nome">- ${item.nome}</span>
      </div>
    `).join("");

    divDia.innerHTML = `
      <div class="dia-card-header">${dia}</div>
      <div class="dia-card-body">${itensHTML || "<p class='item-vazio'>Nenhum item programado.</p>"}</div>
    `;

    container.appendChild(divDia);
  });
}