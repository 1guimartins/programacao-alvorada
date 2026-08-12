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
let semanaAtualChave = "atual"; // "atual" ou formato "2026-W33"

// Carrega dados da semana selecionada
function conectarFirebase() {
  const caminho = semanaAtualChave === "atual" ? "programacao" : `historicos/${semanaAtualChave}`;
  db.ref(caminho).on("value", (snapshot) => {
    const dados = snapshot.val() || {};
    setoresProgramacao = dados;
    const chaves = Object.keys(setoresProgramacao);
    if (!setorAtivo && chaves.length > 0) setorAtivo = chaves[0];
    if (chaves.length > 0 && !setoresProgramacao[setorAtivo]) setorAtivo = chaves[0];
    renderizarSubAbas();
    renderizarGrids();
  });
}

conectarFirebase();

function carregarHistoricoSemana(valorSemana) {
  semanaAtualChave = valorSemana || "atual";
  document.getElementById("info-semana").innerText = valorSemana ? `Exibindo semana: ${valorSemana}` : "Semana Atual";
  conectarFirebase();
}

function salvarNoFirebase() {
  const caminho = semanaAtualChave === "atual" ? "programacao" : `historicos/${semanaAtualChave}`;
  db.ref(caminho).set(setoresProgramacao);
}

function renderizarSubAbas() {
  const container = document.getElementById("sub-tabs-list");
  if (!container) return;
  container.innerHTML = "";

  Object.keys(setoresProgramacao).forEach(nomeAba => {
    const btn = document.createElement("button");
    btn.className = `sub-tab-btn ${nomeAba === setorAtivo ? "active" : ""}`;
    btn.innerText = nomeAba.replace(/_/g, " ");
    btn.onclick = () => {
      setorAtivo = nomeAba;
      renderizarSubAbas();
      renderizarGrids();
    };
    container.appendChild(btn);
  });

  const titulo = document.getElementById("setor-titulo");
  if (titulo && setorAtivo) {
    titulo.innerText = "PROGRAMAÇÃO DE " + setorAtivo.replace(/_/g, " ");
  }
}

function renderizarGrids() {
  const container = document.getElementById("setores-containers");
  if (!container) return;
  container.innerHTML = "";

  if (!setorAtivo || !setoresProgramacao[setorAtivo]) return;

  const dias = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];

  dias.forEach(dia => {
    const dadosDia = setoresProgramacao[setorAtivo][dia] || { data: "", itens: [] };
    const itens = Array.isArray(dadosDia) ? dadosDia : (dadosDia.itens || []);
    const dataVal = Array.isArray(dadosDia) ? "" : (dadosDia.data || "");

    const divDia = document.createElement("div");
    divDia.className = "dia-card";

    let itensHTML = itens.map((item, index) => `
      <div class="item-linha">
        <div class="item-left">
          <span class="item-qtd">${item.qtd}</span>
          <span class="item-nome">${item.nome}</span>
        </div>
        <button class="btn-del-item" onclick="removerItem('${dia}', ${index})">&times;</button>
      </div>
    `).join("");

    divDia.innerHTML = `
      <div class="dia-card-header">
        <span>${dia}</span>
        <input type="text" class="dia-data-input" placeholder="DD/MM/AAAA" value="${dataVal}" onchange="salvarDataDia('${dia}', this.value)">
      </div>
      <div class="dia-card-body">
        ${itensHTML || "<p class='item-vazio'>Nenhum item adicionado</p>"}
        <button class="btn-add-item-card" onclick="adicionarItem('${dia}')">➕ Add Item em ${dia}</button>
      </div>
    `;

    container.appendChild(divDia);
  });
}

function salvarDataDia(dia, valorData) {
  if (!setoresProgramacao[setorAtivo][dia] || Array.isArray(setoresProgramacao[setorAtivo][dia])) {
    const itensAntigos = Array.isArray(setoresProgramacao[setorAtivo][dia]) ? setoresProgramacao[setorAtivo][dia] : [];
    setoresProgramacao[setorAtivo][dia] = { data: valorData, itens: itensAntigos };
  } else {
    setoresProgramacao[setorAtivo][dia].data = valorData;
  }
  salvarNoFirebase();
}

function adicionarItem(dia) {
  const qtd = prompt("Digite a quantidade (ex: 16 rec, 120 kg):");
  if (!qtd) return;
  const nome = prompt("Digite o nome do produto:");
  if (!nome) return;

  if (!setoresProgramacao[setorAtivo][dia] || Array.isArray(setoresProgramacao[setorAtivo][dia])) {
    const itensAntigos = Array.isArray(setoresProgramacao[setorAtivo][dia]) ? setoresProgramacao[setorAtivo][dia] : [];
    setoresProgramacao[setorAtivo][dia] = { data: "", itens: itensAntigos };
  }

  setoresProgramacao[setorAtivo][dia].itens.push({ qtd, nome });
  salvarNoFirebase();
}

function removerItem(dia, index) {
  if (confirm("Deseja remover este item?")) {
    setoresProgramacao[setorAtivo][dia].itens.splice(index, 1);
    salvarNoFirebase();
  }
}

function criarNovaAba() {
  const nome = prompt("Digite o nome do novo setor/aba:");
  if (nome) {
    const chave = nome.toUpperCase().replace(/\s+/g, "_");
    setoresProgramacao[chave] = {
      SEGUNDA: { data: "", itens: [] }, TERÇA: { data: "", itens: [] },
      QUARTA: { data: "", itens: [] }, QUINTA: { data: "", itens: [] },
      SEXTA: { data: "", itens: [] }, SÁBADO: { data: "", itens: [] },
      DOMINGO: { data: "", itens: [] }
    };
    setorAtivo = chave;
    salvarNoFirebase();
  }
}

function excluirAbaAtual() {
  if (confirm(`Excluir a aba "${setorAtivo}"?`)) {
    delete setoresProgramacao[setorAtivo];
    setorAtivo = Object.keys(setoresProgramacao)[0] || "";
    salvarNoFirebase();
  }
}