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

// Função para salvar dados na nuvem do Firebase
function salvarDadosNaNuvem() {
  if (setoresProgramacao && Object.keys(setoresProgramacao).length > 0) {
    db.ref("programacao").set(setoresProgramacao);
  }
}

// Troca de abas do topo
function trocarAbaPrincipal(btn, idAba) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.aba-conteudo').forEach(a => a.style.display = 'none');
  
  btn.classList.add('active');
  document.getElementById(idAba).style.display = 'block';
}

// Carrega os dados salvos do Firebase ao abrir a página
db.ref("programacao").once("value", (snapshot) => {
  const dados = snapshot.val();
  if (dados) {
    setoresProgramacao = dados;
    const chaves = Object.keys(dados);
    if (chaves.length > 0) setorAtivo = chaves[0];
    renderizarSubAbas();
    renderizarGridsSetores();
  }
});

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
  const nome = prompt("Digite o nome da nova aba (Ex: CONFEITARIA):");
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
    divDia.style.marginBottom = "15px";
    divDia.style.border = "1px solid #ccc";
    divDia.style.borderRadius = "4px";
    divDia.style.padding = "10px";

    let itensHTML = (setoresProgramacao[setorAtivo][dia] || []).map((item, idx) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid #eee;">
        <span><strong>${item.qtd}</strong> - ${item.nome}</span>
        <button onclick="removerItem('${dia}', ${idx})" style="color: red; border: none; background: none; cursor: pointer; font-weight: bold;">✕</button>
      </div>
    `).join("");

    divDia.innerHTML = `
      <h3 style="background: #0066cc; color: white; margin: -10px -10px 10px -10px; padding: 8px; font-size: 1rem;">${dia}</h3>
      <div>${itensHTML || "<p style='color:#888; font-size: 0.9rem;'>Nenhum item adicionado</p>"}</div>
      <button onclick="adicionarItem('${dia}')" style="margin-top: 10px; background: #28a745; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">➕ Add Item em ${dia}</button>
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