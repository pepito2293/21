// dobbleGenerator.js

export function generateDobbleCards(emojiList) {
  const n = 7; // Nombre de symboles par carte - 1
  const totalSymbols = n * n + n + 1;
  const symbols = emojiList.slice(0, totalSymbols);
  const cards = [];

  for (let i = 0; i <= n; i++) {
    const card = [symbols[0]];
    for (let j = 0; j < n; j++) {
      card.push(symbols[1 + i * n + j]);
    }
    cards.push(card);
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const card = [symbols[1 + i]];
      for (let k = 0; k < n; k++) {
        const index = 1 + n + k * n + ((i * k + j) % n);
        card.push(symbols[index]);
      }
      cards.push(card);
    }
  }

  return cards.slice(0, 55);
}

// Fonction pour afficher les cartes
export function displayCards(cards) {
  const cardContainer = document.getElementById("cardContainer");
  if (!cardContainer) {
    console.error("❌ Erreur : Élément #cardContainer non trouvé.");
    return;
  }

  cardContainer.innerHTML = ""; // Nettoyage du contenu précédent

  cards.forEach(cardData => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";

    cardData.forEach(symbol => {
      const symbolDiv = document.createElement("div");
      symbolDiv.className = "symbol";
      symbolDiv.textContent = symbol;  // Affichage de l'émoji ou du symbole
      cardDiv.appendChild(symbolDiv);
    });

    cardContainer.appendChild(cardDiv);
  });
}
