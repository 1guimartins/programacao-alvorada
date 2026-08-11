function renderizarGridsView() {
    container.innerHTML = "";

    if (!setorAtivo || !setoresProgramacao[setorAtivo]) return;

    const dias = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];

    dias.forEach(dia => {
        const itens = setoresProgramacao[setorAtivo][dia] || [];

        const divDia = document.createElement("div");
        divDia.className = "dia-card"; // Usa as regras do CSS em vez de estilos fixos no JS

        let itensHTML = itens.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 6px 10px; border-bottom: 1px solid #f0f0f0;">
                <span style="font-weight: 500;">${item.nome}</span>
                <span style="font-weight: bold; color: #0066cc;">${item.qtd}</span>
            </div>
        `).join("");

        divDia.innerHTML = `
            <div class="dia-card-header">${dia}</div>
            <div>${itensHTML || "<p style='color:#999; padding: 8px; margin:0;'>Nenhum item programado.</p>"}</div>
        `;

        container.appendChild(divDia);
    });
}