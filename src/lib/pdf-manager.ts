import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface QuotePDFData {
    quoteNumber: string;
    date: string;
    senderName: string;
    recipientName: string;
    productName: string;
    quantity: string;
    unitPrice: string;
    totalAmount: string;
    currency: string;
    status: string;
    notes?: string;
}

export const generateQuotePDF = (data: QuotePDFData) => {
    const doc = new jsPDF();

    // 1. Header (Branding)
    doc.setFillColor(22, 163, 74); // Green 600
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("AGRIMAR", 20, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Plateforme de Mise en Relation Agricole", 20, 32);

    // 2. Document Title & Info
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("DEVIS COMMERCIAL", 20, 60);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Référence : ${data.quoteNumber}`, 20, 70);
    doc.text(`Date : ${new Date(data.date).toLocaleDateString('fr-FR')}`, 20, 75);
    doc.text(`Statut : ${data.status.toUpperCase()}`, 140, 70);

    // 3. Participants
    doc.setDrawColor(241, 245, 249);
    doc.line(20, 85, 190, 85);

    doc.setFont("helvetica", "bold");
    doc.text("DE :", 20, 95);
    doc.setFont("helvetica", "normal");
    doc.text(data.senderName, 20, 100);

    doc.setFont("helvetica", "bold");
    doc.text("À :", 110, 95);
    doc.setFont("helvetica", "normal");
    doc.text(data.recipientName, 110, 100);

    // 4. Details Table
    autoTable(doc, {
        startY: 115,
        head: [['PRODUIT', 'QUANTITÉ', 'PRIX UNITAIRE', 'TOTAL']],
        body: [
            [
                data.productName,
                data.quantity,
                `${data.unitPrice} ${data.currency}`,
                `${data.totalAmount} ${data.currency}`
            ]
        ],
        headStyles: {
            fillColor: [30, 41, 59],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 10,
            halign: 'center',
            cellPadding: 8
        },
        columnStyles: {
            0: { halign: 'left', fontStyle: 'bold' }
        }
    });

    // 5. Total Section
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("MONTANT TOTAL :", 110, finalY + 10);
    doc.setTextColor(22, 163, 74);
    doc.text(`${data.totalAmount} ${data.currency}`, 160, finalY + 10);

    // 6. Notes
    if (data.notes) {
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text("Notes :", 20, finalY + 30);
        doc.text(data.notes, 20, finalY + 35);
    }

    // 7. Footer
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Document généré automatiquement par AgriMar. Ceci n'est pas une facture fiscale.", 105, 285, { align: "center" });

    doc.save(`Devis_AgriMar_${data.quoteNumber}.pdf`);
};
