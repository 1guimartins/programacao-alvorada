// CONFIGURAÇÃO DO FIREBASE COM SUAS CHAVES REAIS
const firebaseConfig = {
  apiKey: "AIzaSyBen86e0DcOv3LCH9cyvwyCiscIvuM-05E",
  authDomain: "programacao-alvorada.firebaseapp.com",
  databaseURL: "https://programacao-alvorada-default-rtdb.firebaseio.com",
  projectId: "programacao-alvorada",
  storageBucket: "programacao-alvorada.firebasestorage.app",
  messagingSenderId: "482889574306",
  appId: "1:482889574306:web:56463da674a065162c34fb"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let setoresProgramacao = {};
let setorAtivo = "";

// ESCUTA EM TEMPO REAL: Quando o ADM altera algo, o celular atualiza sozinho
db.ref("programacao").on("value", (snapshot) => {
  const dados = snapshot.val();
  if (dados) {
    setoresProgramacao = dados;
    
    const chaves = Object.keys(setoresProgramacao);
    if (!setorAtivo && chaves.length > 0) {
      setorAtivo = chaves[0];
    }
    
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
    btn.className = `sub-tab-btn-view ${nomeAba === setorAtivo ? "active" : ""}`;
    btn.innerText = nomeAba;
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
    divDia.style.marginBottom = "15px";
    divDia.style.border = "1px solid #ddd";
    divDia.style.borderRadius = "6px";
    divDia.style.overflow = "hidden";
    divDia.style.background = "#fff";

    let itensHTML = itens.map(item => `
      <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #f0f0f0;">
        <span style="font-weight: 500;">${item.nome}</span>
        <span style="font-weight: bold; color: #0066cc;">${item.qtd}</span>
      </div>
    `).join("");

    divDia.innerHTML = `
      <div style="background: #0f5c2e; color: white; padding: 8px 12px; font-weight: bold;">${dia}</div>
      <div>${itensHTML || "<p style='color:#999; padding: 10px; margin:0;'>Nenhum item programado.</p>"}</div>
    `;

    container.appendChild(divDia);
  });
}