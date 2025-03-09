// exportManager.js
import html2canvas from "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
import { jsPDF } from "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js";
import JSZip from "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

export async function downloadCardsAsPDF(cards, backCardImage) {
  const pdf = new jsPDF("portrait", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const cardSize = 85.53;

  let currentCardIndex = 0;

  for (const card of cards) {
    const canvas = await html2canvas(card, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const x = (currentCardIndex % 2) * (cardSize + 5);
    const y = Math.floor(currentCardIndex / 2) * (cardSize + 5);

    pdf.addImage(imgData, "PNG", x, y, cardSize, cardSize);

    currentCardIndex++;
    if (currentCardIndex % 6 === 0) pdf.addPage();
  }

  pdf.save("dobble_cards.pdf");
}
