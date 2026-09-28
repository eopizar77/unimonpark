import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportarExcel(filas: Record<string, unknown>[], nombreArchivo: string) {
  const hoja = XLSX.utils.json_to_sheet(filas);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Reporte");
  XLSX.writeFile(libro, `${nombreArchivo}.xlsx`);
}

export function exportarPdf(
  titulo: string,
  columnas: string[],
  filas: (string | number)[][],
  nombreArchivo: string
) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(titulo, 14, 15);
  autoTable(doc, {
    head: [columnas],
    body: filas,
    startY: 20,
    styles: { fontSize: 8 },
  });
  doc.save(`${nombreArchivo}.pdf`);
}