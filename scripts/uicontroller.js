// uiController.js
import { generateDobbleCards } from './dobbleGenerator.js';
import { loadEmojiList, populateEmojiTable } from './emojiManager.js';
import { downloadCardsAsPDF } from './exportManager.js';

export function initializeUI() {
  const emojiList = loadEmojiList();
  populateEmojiTable(emojiList);

  document.getElementById("generateCardsBtn").addEventListener("click", () => {
    const cards = generateDobbleCards(emojiList);
    displayCards(cards);
  });

  document.getElementById("downloadPDFBtn").addEventListener("click", () => {
    const cards = document.querySelectorAll(".card");
    downloadCardsAsPDF(cards, localStorage.getItem("backCardImage"));
  });
}

function displayCards(cards) {
  const cardContainer = document.getElementById("cardContainer");
  cardContainer.innerHTML = "";

  cards.forEach(card => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardContainer.appendChild(cardDiv);
  });
}
