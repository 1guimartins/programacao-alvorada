// CONFIGURAÇÃO DO FIREBASE
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

// Função para salvar no Firebase
function salvarDadosNaNuvem() {
  if (setoresProgramacao && Object.keys(setoresProgramacao).length > 0) {
    db.ref("programacao").set(setoresProgramacao);
  }
}

// Carregar dados iniciais do Firebase
db.ref("programacao").on("value", (snapshot) => {
  const dados = snapshot.val();
  if (dados) {
    setoresProgramacao = dados;
    const chaves = Object.keys(setoresProgramacao);
    if (!setorAtivo && chaves.length > 0) setorAtivo = chaves[0];
    renderizarSubAbas();
    renderizarGridsSetores();
  }
});

function trocarAbaPrincipal(btn, idAba) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.aba-conteudo').forEach(a => a.style.display = 'none');
  btn.classList.add('active');
  document.getElementById(idAba).style.display = 'block';
}

function renderizarSubAbas() {
  const container = document.getElementById("sub-tabs-list");
  if (!container) return;
  container.innerHTML = "";

  Object.keys(setoresProgramacao).forEach(nomeAba => {
    const btn = document.createElement("button");
    btn.className = `sub-tab-btn ${nomeAba === setorAtivo ? "active" : ""}`;
    btn.innerText = nomeAba;
    btn.onclick = () => {
      setorAtivo = nomeAba;
      renderizarSubAbas();
      renderizarGridsSetores();
    };
    container.appendChild(btn);
  });

  const tituloDisplay = document.getElementById("setor-titulo-display");
  if (tituloDisplay && setorAtivo) {
    tituloDisplay.innerText = "PROGRAMAÇÃO DE " + setorAtivo.replace(/_/g, " ");
  }
}

function criarNovaSubAba() {
  const nome = prompt("Digite o nome da nova aba (Ex: PRÉ PESAGEM):");
  if (nome) {
    const chave = nome.toUpperCase().trim().replace(/\s+/g, "_");
    if (!setoresProgramacao[chave]) {
      setoresProgramacao[chave] = {
        "SEGUNDA": [], "TERÇA": [], "QUARTA": [], 
        "QUINTA": [], "SEXTA": [], "SÁBADO": [], "DOMINGO": []
      };
      setorAtivo = chave;
      renderizarSubAbas();
      renderizarGridsSetores();
      salvarDadosNaNuvem();
    }
  }
}

function excluirAbaAtual() {
  if (!setorAtivo) return;
  if (confirm(`Tem certeza que deseja excluir a aba ${setorAtivo}?`)) {
    delete setoresProgramacao[setorAtivo];
    const chaves = Object.keys(setoresProgramacao);
    setorAtivo = chaves.length > 0 ? chaves[0] : "";
    renderizarSubAbas();
    renderizarGridsSetores();
    salvarDadosNaNuvem();
  }
}

function renderizarGridsSetores() {
  const container = document.getElementById("setores-containers");
  if (!container) return;
  container.innerHTML = "";

  if (!setorAtivo || !setoresProgramacao[setorAtivo]) return;

  const dias = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];

  dias.forEach(dia => {
    const divDia = document.createElement("div");
    divDia.className = "dia-card";

    let itens = setoresProgramacao[setorAtivo][dia] || [];
    let itensHTML = itens.map((item, idx) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; border-bottom: 1px solid #eee;">
        <span><strong>${item.qtd}</strong> -${item.nome}</span>
        <button class="no-print" onclick="removerItem('${dia}',${idx})" style="color: red; border: none; background: none; cursor: pointer; font-weight: bold;">✕</button>
      </div>
    `).join("");

    divDia.innerHTML = `
      <div class="dia-card-header">${dia}</div>
      <div style="padding: 4px;">${itensHTML || "<p style='color:#888; font-size: 0.85rem; padding: 4px;'>Nenhum item</p>"}</div>
      <div class="no-print" style="padding: 4px; text-align: center;">
        <button onclick="adicionarItem('${dia}')" style="background: #28a745; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">➕ Add Item</button>
      </div>
    `;

    container.appendChild(divDia);
  });
}

function adicionarItem(dia) {
  const nome = prompt(`Nome do produto para ${dia}:`);
  if (!nome) return;
  const qtd = prompt(`Quantidade para ${nome}:`, "1 rec");
  if (!qtd) return;

  if (!setoresProgramacao[setorAtivo][dia]) {
    setoresProgramacao[setorAtivo][dia] = [];
  }

  setoresProgramacao[setorAtivo][dia].push({ nome: nome.toUpperCase(), qtd });
  renderizarGridsSetores();
  salvarDadosNaNuvem();
}

function removerItem(dia, index) {
  setoresProgramacao[setorAtivo][dia].splice(index, 1);
  renderizarGridsSetores();
  salvarDadosNaNuvem();
}