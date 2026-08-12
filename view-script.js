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

function conectarFirebaseView() {
  db.ref("programacao").on("value", (snapshot) => {
    setoresProgramacao = snapshot.val() || {};
    const chaves = Object.keys(setoresProgramacao);
    if (!setorAtivo && chaves.length > 0) setorAtivo = chaves[0];
    if (chaves.length > 0 && !setoresProgramacao[setorAtivo]) setorAtivo = chaves[0];
    renderizarSubAbasView();
    filtrarProgramacao();
  });
}

conectarFirebaseView();

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
      filtrarProgramacao();
    };
    container.appendChild(btn);
  });

  const tituloView = document.getElementById("setor-titulo-view");
  if (tituloView && setorAtivo) {
    tituloView.innerText = "PROGRAMAÇÃO DE " + setorAtivo.replace(/_/g, " ");
  }
}

function alternarModoFiltro() {
  const modo = document.getElementById("filtro-modo").value;
  document.getElementById("grupo-dia-unico").style.display = modo === "dia" ? "flex" : "none";
  document.getElementById("grupo-periodo").style.display = modo === "periodo" ? "flex" : "none";
  filtrarProgramacao();
}

function converterDataParaISO(dataString) {
  if (!dataString) return "";
  const partes = dataString.split("/");
  if (partes.length === 3) {
    return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
  }
  return dataString;
}

function filtrarProgramacao() {
  const container = document.getElementById("setores-containers-view");
  if (!container) return;
  container.innerHTML = "";

  if (!setorAtivo || !setoresProgramacao[setorAtivo]) return;

  const modo = document.getElementById("filtro-modo").value;
  const dataUnica = document.getElementById("filtro-data-unica").value;
  const dataInicio = document.getElementById("filtro-data-inicio").value;
  const dataFim = document.getElementById("filtro-data-fim").value;

  const dias = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];

  dias.forEach(dia => {
    const objDia = normalizarDia(setoresProgramacao[setorAtivo][dia]);
    const dataDiaISO = converterDataParaISO(objDia.data);

    let exibir = true;

    if (modo === "dia" && dataUnica) {
      exibir = (dataDiaISO === dataUnica);
    } else if (modo === "periodo" && dataInicio && dataFim) {
      exibir = (dataDiaISO >= dataInicio && dataDiaISO <= dataFim);
    }

    if (exibir) {
      const divDia = document.createElement("div");
      divDia.className = "dia-card";

      let itensHTML = objDia.itens.map(item => `
        <div class="item-linha">
          <div class="item-left">
            <span class="item-qtd">${item.qtd}</span>
            <span class="item-nome">- ${item.nome}</span>
          </div>
        </div>
      `).join("");

      divDia.innerHTML = `
        <div class="dia-card-header">
          <span>${dia}</span>
          ${objDia.data ? `<span>${objDia.data}</span>` : ""}
        </div>
        <div class="dia-card-body">${itensHTML || "<p class='item-vazio'>Nenhum item programado.</p>"}</div>
      `;

      container.appendChild(divDia);
    }
  });

  if (container.children.length === 0) {
    container.innerHTML = "<p class='item-vazio' style='grid-column: 1/-1; font-size:1.1rem; padding: 20px;'>Nenhuma programação encontrada para a data/período selecionado.</p>";
  }
}