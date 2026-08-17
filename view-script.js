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

db.ref("semanas_v2").on("value", (snapshot) => {
  semanasData = snapshot.val() || {};
  const listaSemanas = Object.keys(semanasData);

  const publicadas = listaSemanas.filter(k => semanasData[k].publicado === true);

  if (publicadas.length > 0) {
    if (!semanaAtiva || !semanasData[semanaAtiva] || !semanasData[semanaAtiva].publicado) {
      semanaAtiva = publicadas[0];
    }
  } else {
    semanaAtiva = "";
  }

  carregarSeletorSemanasView(publicadas);
  atualizarDadosView();
});

function carregarSeletorSemanasView(publicadas) {
  const select = document.getElementById("seletor-semana-view");
  if (!select) return;
  select.innerHTML = "";

  if (publicadas.length === 0) {
    const opt = document.createElement("option");
    opt.innerText = "Aguardando publicação do ADM...";
    select.appendChild(opt);
    return;
  }

  publicadas.forEach(key => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.innerText = semanasData[key].nome || key;
    if (key === semanaAtiva) opt.selected = true;
    select.appendChild(opt);
  });
}

function mudarSemanaView(novaSemana) {
  semanaAtiva = novaSemana;
  setorAtivo = "";
  atualizarDadosView();
}

function atualizarDadosView() {
  if (!semanaAtiva || !semanasData[semanaAtiva]) {
    document.getElementById("setores-containers-view").innerHTML = "<p class='item-vazio' style='grid-column: 1/-1; padding: 40px;'>🔒 Nenhuma programação está publicada no momento.</p>";
    return;
  }

  const dadosSemana = semanasData[semanaAtiva];
  estaPublicado = dadosSemana.publicado || false;
  setoresProgramacao = dadosSemana.programacao || {};

  const rawHistorico = dadosSemana.historico_notificacoes || {};
  historico = Object.keys(rawHistorico).map(k => rawHistorico[k]).reverse();

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
}

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
    container.innerHTML = "<p class='item-vazio' style='grid-column: 1/-1; padding: 40px;'>🔒 A programação desta semana está em rascunho pelo ADM.</p>";
    return;
  }

  if (!setorAtivo || !setoresProgramacao[setorAtivo]) return;

  const dias = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];

  dias.forEach(dia => {
    const objDia = normalizarDia(setoresProgramacao[setorAtivo][dia]);

    const divDia = document.createElement("div");
    divDia.className = "dia-card";

    let itensHTML = objDia.itens.map((item, index) => {
      const temQtd = item.qtd && item.qtd.trim() !== "";
      const temTipo = item.tipo && item.tipo.trim() !== "";
      const classeTipo = temTipo ? `tipo-${item.tipo.toUpperCase()}` : '';
      const valorProduzido = item.produzido !== undefined ? item.produzido : '';
      const classeNovo = item.novo ? 'item-novo' : '';

      return `
        <div class="item-linha ${classeNovo}" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 6px; flex: 1; overflow: hidden;">
            ${temQtd ? `<span class="item-qtd">${item.qtd}</span>` : ''}
            ${temTipo ? `<span class="item-tipo ${classeTipo}">${item.tipo}</span>` : ''}
            <span class="item-nome">${item.nome}</span>
          </div>

          <div style="display: flex; align-items: center; gap: 4px;">
            <input 
              type="number" 
              class="input-contagem-lider" 
              placeholder="Qtd" 
              value="${valorProduzido}" 
              onchange="atualizarContagemLider('${dia}', ${index}, this.value)"
            />
          </div>
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

function atualizarContagemLider(dia, index, valor) {
  if (!semanaAtiva || !setorAtivo) return;

  db.ref(`semanas_v2/${semanaAtiva}/programacao/${setorAtivo}/${dia}/itens/${index}/produzido`).set(valor)
    .catch((err) => {
      alert("Erro ao salvar quantidade: " + err.message);
    });
}

function abrirModal() {
  const modal = document.getElementById("modal-notificacoes");
  const lista = document.getElementById("modal-lista");
  if (!modal || !lista) return;

  if (historico.length === 0) {
    lista.innerHTML = "<p class='item-vazio'>Sem histórico de alterações nesta semana.</p>";
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
  const modal = document.getElementById("modal-notificacoes");
  if (modal) modal.style.display = "none";
}