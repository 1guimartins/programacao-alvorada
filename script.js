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

  if (listaSemanas.length === 0) {
    // Se não existir nenhuma semana, cria a Semana Atual Padrão
    const chaveAtual = "SEMANA_ATUAL";
    db.ref(`semanas/${chaveAtual}/nome`).set("Semana Atual");
    semanaAtiva = chaveAtual;
  } else if (!semanaAtiva || !semanasData[semanaAtiva]) {
    semanaAtiva = listaSemanas[0];
  }

  carregarSeletorSemanas();
  escutarSetoresDaSemana();
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
  escutarSetoresDaSemana();
}

function escutarSetoresDaSemana() {
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

    renderizarSubAbas();
    renderizarGrids();
  });
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

    let itensHTML = objDia.itens.map((item, index) => {
      const temQtd = item.qtd && item.qtd.trim() !== "";
      return `
        <div class="item-linha ${item.atualizado ? 'item-atualizado' : ''}">
          ${temQtd ? `<span class="item-qtd">${item.qtd}</span>` : ''}
          <span class="item-nome">${item.nome}</span>
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
  db.ref(`semanas/${semanaAtiva}/programacao/${setorAtivo}/${dia}`).set(objDia);

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
            db.ref(`semanas/${semanaAtiva}/programacao/${setorAtivo}/${d}`).set(objProximo);
          }
        });
      }
    }
  }
}

function adicionarItem(dia) {
  let qtd = prompt("Digite a quantidade ou deixe em branco:");
  if (qtd === null) return;

  const nome = prompt("Digite o nome do produto:");
  if (!nome || nome.trim() === "") return;

  const objDia = normalizarDia(setoresProgramacao[setorAtivo][dia]);
  
  // Marca com flag 'atualizado: true' e registra hora da alteração
  objDia.itens.push({ 
    qtd: qtd.trim(), 
    nome: nome.trim(), 
    atualizado: true,
    dataAtualizacao: Date.now()
  });

  db.ref(`semanas/${semanaAtiva}/programacao/${setorAtivo}/${dia}`).set(objDia);
}

function removerItem(dia, index) {
  if (confirm("Deseja remover este item?")) {
    const objDia = normalizarDia(setoresProgramacao[setorAtivo][dia]);
    objDia.itens.splice(index, 1);
    db.ref(`semanas/${semanaAtiva}/programacao/${setorAtivo}/${dia}`).set(objDia);
  }
}

function criarNovaSemanaRascunho() {
  const nomeSemana = prompt("Digite um nome para a Nova Semana (ex: Semana 17/08 a 23/08):");
  if (!nomeSemana) return;

  const chave = "SEMANA_" + Date.now();
  db.ref(`semanas/${chave}`).set({
    nome: nomeSemana,
    programacao: {}
  }).then(() => {
    semanaAtiva = chave;
    alert("Nova semana em Rascunho criada com sucesso!");
  });
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

    db.ref(`semanas/${semanaAtiva}/programacao/${chave}`).set(novoSetor).then(() => {
      setorAtivo = chave;
    });
  }
}

function excluirAbaAtual() {
  if (!setorAtivo) return;
  if (confirm(`Deseja realmente excluir o setor "${formatarNomeExibicao(setorAtivo)}"?`)) {
    db.ref(`semanas/${semanaAtiva}/programacao/${setorAtivo}`).remove().then(() => {
      setorAtivo = "";
    });
  }
}