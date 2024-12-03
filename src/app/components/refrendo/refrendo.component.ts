import { Component } from '@angular/core';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

@Component({
  selector: 'app-refrendo',
  templateUrl: './refrendo.component.html',
  styleUrls: ['./refrendo.component.css']
})
export class RefrendoComponent {
  data: { sheetName: string; rowData: { [key: string]: any }; rowIndex: number }[] = [];
  loading: boolean = false;
  progress: number = 0;

  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) throw new Error('No se puede cargar varios archivos a la vez');

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const allData: { sheetName: string; rowData: { [key: string]: any }; rowIndex: number }[] = [];

      wb.SheetNames.forEach(sheetName => {
        const ws: XLSX.WorkSheet = wb.Sheets[sheetName];
        const sheetData: { [key: string]: any }[] = XLSX.utils.sheet_to_json(ws);

        for (let rowIndex = 0; rowIndex < sheetData.length; rowIndex++) {
          const row = sheetData[rowIndex];

          if (row['MUNICIPIO'] && row['MUNICIPIO'].toString().toUpperCase() === 'TERMINA') {
            break;
          }

          const hasData = Object.values(row).some(value => value !== null && value !== '');
          if (hasData) {
            allData.push({ sheetName, rowData: row, rowIndex: rowIndex + 1 });
          }
        }
      });

      this.data = allData;
    };
    reader.readAsBinaryString(target.files[0]);
  }

  onGenerateDocuments() {
    this.generateDocumentsZip(this.data);
  }

  async generateDocumentsZip(data: { sheetName: string; rowData: { [key: string]: any }; rowIndex: number }[]) {
    this.loading = true;
    this.progress = 0;

    const zip = new JSZip();

    for (let i = 0; i < data.length; i++) {
      const entry = data[i];
      const { sheetName, rowData, rowIndex } = entry;

      const content = await this.generateWordDocument(rowData);

      const periodos = Number(rowData['PERIODOS ADEUDO']);
      const tipoDocumento = periodos > 2 ? 'replaqueo' : 'refrendo';

      zip.file(`${sheetName}-${tipoDocumento}-fila-${rowIndex}.docx`, content, { binary: true });

      this.progress = Math.round(((i + 1) / data.length) * 100);
    }

    zip.generateAsync({ type: 'blob' }).then((blob: Blob) => {
      saveAs(blob, 'oficios.zip');
      this.loading = false;
    });
  }

  getTodayDate(): string {
    const today = new Date();
    return `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
  }

  async generateWordDocument(data: { [key: string]: any }): Promise<Blob> {
    let templatePath = '/assets/refrendoss.docx';

    if (data['PERIODOS ADEUDO'] > 2) {
      templatePath = '/assets/replaqueoo.docx';
    }

    const response = await fetch(templatePath);
    const content = await response.arrayBuffer();

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Añadir la fecha actual al objeto de datos
    data['fechaActual'] = this.getTodayDate();
    doc.setData(data);

    try {
      doc.render();
    } catch (error) {
      console.error(error);
    }

    return doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  }
}
