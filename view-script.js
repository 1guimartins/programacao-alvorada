let setoresProgramacao = {};
let setorAtivo = "";

function carregarDados() {
  // Busca os dados salvos pelo ADM na memória do navegador
  const dadosSalvos = localStorage.getItem("panificacao_programacao");
  
  if (dadosSalvos) {
    setoresProgramacao = JSON.parse(dadosSalvos);
    setorAtivo = Object.keys(setoresProgramacao)[0] || "";
    renderizarSubAbas();
    renderizarGridsSetores();
  } else {
    document.getElementById("setores-containers").innerHTML = 
      "<p style='text-align:center; padding: 20px; font-weight:bold;'>Nenhuma programação publicada pelo ADM ainda.</p>";
  }
}

function renderizarSubAbas() {
  const container = document.getElementById("sub-tabs-list");
  if (!container) return;
  container.innerHTML = "";

  Object.keys(setoresProgramacao).forEach(key => {
    const btn = document.createElement("button");
    btn.className = `sub-tab-btn ${key === setorAtivo ? 'active' : ''}`;
    btn.innerText = key;
    btn.onclick = () => selecionarSetor(key);
    container.appendChild(btn);
  });
}

function selecionarSetor(key) {
  setorAtivo = key;
  renderizarSubAbas();

  document.getElementById("setor-titulo-display").innerText = setoresProgramacao[key].titulo;

  document.querySelectorAll('.setor-grid-container').forEach(grid => {
    grid.style.display = 'none';
  });

  const gridAtiva = document.getElementById(`grid-setor-${formatarId(key)}`);
  if (gridAtiva) {
    gridAtiva.style.display = 'block';
  }
}

function renderizarGridsSetores() {
  const container = document.getElementById("setores-containers");
  if (!container) return;
  container.innerHTML = "";

  Object.keys(setoresProgramacao).forEach(setorKey => {
    const setorDiv = document.createElement("div");
    setorDiv.id = `grid-setor-${formatarId(setorKey)}`;
    setorDiv.className = "setor-grid-container";
    setorDiv.style.display = setorKey === setorAtivo ? 'block' : 'none';

    setorDiv.innerHTML = `
      <div class="programacao-grid">
        ${gerarCardDiaView(setorKey, 'segunda', 'SEGUNDA-FEIRA')}
        ${gerarCardDiaView(setorKey, 'terca', 'TERÇA-FEIRA')}
        ${gerarCardDiaView(setorKey, 'quarta', 'QUARTA-FEIRA')}
        ${gerarCardDiaView(setorKey, 'quinta', 'QUINTA-FEIRA')}
        ${gerarCardDiaView(setorKey, 'sexta', 'SEXTA-FEIRA')}
        ${gerarCardDiaView(setorKey, 'sabado', 'SÁBADO')}
        ${gerarCardDiaView(setorKey, 'domingo', 'DOMINGO', true)}
      </div>
    `;

    container.appendChild(setorDiv);
    carregarTabelasSetorView(setorKey);
  });
}

function gerarCardDiaView(setorKey, diaKey, diaNome, fullWidth = false) {
  const dataAtual = setoresProgramacao[setorKey].datas[diaKey] || "";
  return `
    <div class="dia-box ${fullWidth ? 'full-width' : ''}">
      <div class="dia-title">${diaNome} <span>${dataAtual}</span></div>
      <table class="tb-prog">
        <tbody id="body-view-${formatarId(setorKey)}-${diaKey}"></tbody>
      </table>
    </div>
  `;
}

function carregarTabelasSetorView(setorKey) {
  const setorData = setoresProgramacao[setorKey];
  if (!setorData) return;

  Object.keys(setorData.dias).forEach(diaKey => {
    const tbody = document.getElementById(`body-view-${formatarId(setorKey)}-${diaKey}`);
    if (!tbody) return;
    tbody.innerHTML = "";

    if (setorData.dias[diaKey].length === 0) {
      tbody.innerHTML = "<tr><td colspan='2' style='color:#999; font-weight:normal;'>Sem itens cadastrados</td></tr>";
      return;
    }

    setorData.dias[diaKey].forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="width: 30%;">${item.qtd}</td>
        <td>${item.produto}</td>
      `;
      tbody.appendChild(tr);
    });
  });
}

function formatarId(texto) {
  return texto.replace(/[^a-zA-Z0-9]/g, "_");
}

window.onload = carregarDados;