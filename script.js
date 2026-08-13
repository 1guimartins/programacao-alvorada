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
  const badge = document.getElementById("status-badge");
  if (badge) {
    badge.innerText = estaPublicado ? "Publicado" : "Rascunho";
    badge.className = `status-badge ${estaPublicado ? 'bg-publicado' : 'bg-rascunho'}`;
  }
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
    titulo.innerText = setorAtivo ? "PROGRAMAÇÃO DE " + formatarNomeExibicao(setorAtivo) : "NENHUM SETOR SELECIONADO";
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
      const temTipo = item.tipo && item.tipo.trim() !== "";
      return `
        <div class="item-linha">
          ${temQtd ? `<span class="item-qtd">${item.qtd}</span>` : ''}
          ${temTipo ? `<span class="item-tipo">${item.tipo}</span>` : ''}
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
  db.ref(`programacao/${setorAtivo}/${dia}`).set(objDia);

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
            db.ref(`programacao/${setorAtivo}/${d}`).set(objProximo);
          }
        });
      }
    }
  }
}

function adicionarItem(dia) {
  let qtd = "";
  let tipo = "";
  let nome = "";

  const ehBolosSecos = setorAtivo && setorAtivo.toUpperCase().includes("BOLOS") && setorAtivo.toUpperCase().includes("SECOS");

  if (ehBolosSecos) {
    const respQtd = prompt("1/3 - Digite a QUANTIDADE (ex: 2 REC, 5 CX, 10):");
    if (respQtd === null) return;
    qtd = respQtd.trim();

    const respTipo = prompt("2/3 - Digite o TIPO DO BOLO (ex: PLACA, CASEIRO, INGLÊS, MINI):");
    if (respTipo === null) return;
    tipo = respTipo.trim();

    const respNome = prompt("3/3 - Digite o SABOR DO BOLO (ex: CENOURA, CHOCOLATE, FUBÁ):");
    if (!respNome || respNome.trim() === "") return;
    nome = respNome.trim();
  } else {
    let respQtd = prompt("Digite a quantidade ou deixe em branco:");
    if (respQtd === null) return;
    qtd = respQtd.trim();

    let respNome = prompt("Digite o nome do produto:");
    if (!respNome || respNome.trim() === "") return;
    nome = respNome.trim();
  }

  const objDia = normalizarDia(setoresProgramacao[setorAtivo][dia]);

  const novoItem = { 
    qtd: qtd,
    tipo: tipo,
    nome: nome,
    novo: estaPublicado
  };

  objDia.itens.push(novoItem);
  db.ref(`programacao/${setorAtivo}/${dia}`).set(objDia);

  if (estaPublicado) {
    const hora = new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
    const textoTipo = tipo ? `[${tipo.toUpperCase()}] ` : '';
    db.ref("historico_notificacoes").push({
      texto: `Item adicionado em ${formatarNomeExibicao(setorAtivo)} (${dia}): ${qtd ? qtd + ' ' : ''}${textoTipo}${nome.toUpperCase()}`,
      hora: hora
    });
  }
}

function removerItem(dia, index) {
  if (confirm("Deseja remover este item?")) {
    const objDia = normalizarDia(setoresProgramacao[setorAtivo][dia]);
    const removido = objDia.itens[index];
    objDia.itens.splice(index, 1);
    db.ref(`programacao/${setorAtivo}/${dia}`).set(objDia);

    if (estaPublicado && removido) {
      const hora = new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
      db.ref("historico_notificacoes").push({
        texto: `Item removido de ${formatarNomeExibicao(setorAtivo)} (${dia}): ${removido.nome.toUpperCase()}`,
        hora: hora
      });
    }
  }
}

function alternarPublicacao() {
  const novoStatus = !estaPublicado;
  db.ref("status_publicacao").set(novoStatus).then(() => {
    alert(novoStatus ? "Programação PUBLICADA com sucesso!" : "Programação mudou para RASCUNHO.");
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

    db.ref(`programacao/${chave}`).set(novoSetor).then(() => {
      setorAtivo = chave;
    });
  }
}

function excluirAbaAtual() {
  if (!setorAtivo) return;
  if (confirm(`Deseja realmente excluir o setor "${formatarNomeExibicao(setorAtivo)}"?`)) {
    db.ref(`programacao/${setorAtivo}`).remove().then(() => {
      setorAtivo = "";
    });
  }
}