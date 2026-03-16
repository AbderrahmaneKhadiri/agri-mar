import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function generateTraceabilityPDF(logs: any[], farmName: string) {
    const doc = new jsPDF();
    const dateStr = format(new Date(), "dd/MM/yyyy", { locale: fr });

    // Header
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // Emerald 500
    doc.text("RAPPORT DE TRAÇABILITÉ — AGRIMAR", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Exploitation : ${farmName}`, 14, 30);
    doc.text(`Généré le : ${dateStr}`, 14, 35);

    doc.setDrawColor(230);
    doc.line(14, 40, 196, 40);

    // Table
    const tableData = logs.map(log => [
        format(new Date(log.date), "dd/MM/yyyy HH:mm", { locale: fr }),
        log.actionType,
        log.description,
        log.quantity ? `${log.quantity} ${log.unit || ""}` : "--",
        log.productUsed || "--",
        "CONFORME"
    ]);

    (doc as any).autoTable({
        startY: 45,
        head: [['Date', 'Action', 'Description', 'Quantité', 'Produit', 'Statut']],
        body: tableData,
        headStyles: {
            fillColor: [16, 185, 129],
            fontSize: 10,
            fontStyle: 'bold'
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [50, 50, 50]
        },
        alternateRowStyles: {
            fillColor: [245, 253, 250]
        },
        margin: { top: 45 },
        styles: { font: 'helvetica' }
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Ce document est généré par la plateforme AgriMar et fait foi de carnet de bord numérique certifié. Page ${i} sur ${pageCount}`,
            14,
            doc.internal.pageSize.height - 10
        );
    }

    doc.save(`Tracabilite_AgriMar_${farmName.replace(/\s/g, "_")}_${dateStr.replace(/\//g, "-")}.pdf`);
}
