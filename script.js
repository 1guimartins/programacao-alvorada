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

  return {
    data: dados.data || "",
    itens: itensArray
  };
}

function formatarNomeExibicao(nome) {
  if (!nome) return "";
  return nome
    .replace(/_BARRA_/g, " / ")
    .replace(/-BARRA-/g, " / ")
    .replace(/BARRA/g, " / ")
    .replace(/_/g, " ");
}

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

  renderizarSubAbas();
  renderizarGrids();
});

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
    titulo.innerText = setorAtivo 
      ? "PROGRAMAÇÃO DE " + formatarNomeExibicao(setorAtivo) 
      : "NENHUM SETOR SELECIONADO";
  }
}

function renderizarGrids() {
  const container = document.getElementById("setores-containers");
  if (!container) return;
  container.innerHTML = "";

  if (!setorAtivo || !setoresProgramacao[setorAtivo]) return;

  const dias = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];

  dias.forEach(dia => {
    const objDia = normalizarDia(setoresProgramacao[setorAtivo][dia]);

    const divDia = document.createElement("div");
    divDia.className = "dia-card";

    let itensHTML = objDia.itens.map((item, index) => `
      <div class="item-linha">
        <span class="item-qtd">${item.qtd}</span>
        <span class="item-nome">${item.nome}</span>
        <button class="btn-del-item" onclick="removerItem('${dia}', ${index})" style="margin-left: auto;">&times;</button>
      </div>
    `).join("");

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
  db.ref(`programacao/${setorAtivo}/${dia}`).set(objDia);
}

function adicionarItem(dia) {
  const qtd = prompt("Digite a quantidade (ex: 16 rec, 120 kg):");
  if (!qtd) return;
  const nome = prompt("Digite o nome do produto:");
  if (!nome) return;

  if (!setoresProgramacao[setorAtivo]) return;
  const objDia = normalizarDia(setoresProgramacao[setorAtivo][dia]);
  objDia.itens.push({ qtd, nome });

  db.ref(`programacao/${setorAtivo}/${dia}`).set(objDia);
}

function removerItem(dia, index) {
  if (confirm("Deseja remover este item?")) {
    const objDia = normalizarDia(setoresProgramacao[setorAtivo][dia]);
    objDia.itens.splice(index, 1);
    db.ref(`programacao/${setorAtivo}/${dia}`).set(objDia);
  }
}

function criarNovaAba() {
  const nome = prompt("Digite o nome do novo setor:");
  if (nome && nome.trim() !== "") {
    let chave = nome.trim().toUpperCase()
      .replace(/\//g, "_BARRA_")
      .replace(/[\.\#\$\[\]]/g, "")
      .replace(/\s+/g, "_");

    const novoSetor = {
      SEGUNDA: { data: "", itens: [] },
      TERÇA: { data: "", itens: [] },
      QUARTA: { data: "", itens: [] },
      QUINTA: { data: "", itens: [] },
      SEXTA: { data: "", itens: [] },
      SÁBADO: { data: "", itens: [] },
      DOMINGO: { data: "", itens: [] }
    };

    db.ref(`programacao/${chave}`).set(novoSetor).then(() => {
      setorAtivo = chave;
    }).catch(err => {
      alert("Erro ao criar setor no Firebase: " + err.message);
    });
  }
}

function excluirAbaAtual() {
  if (!setorAtivo) return;
  const nomeExibicao = formatarNomeExibicao(setorAtivo);
  if (confirm(`Deseja realmente excluir o setor "${nomeExibicao}"?`)) {
    db.ref(`programacao/${setorAtivo}`).remove().then(() => {
      setorAtivo = "";
    });
  }
}