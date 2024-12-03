import { Component, OnInit } from '@angular/core';
import { Workbook, Cell } from 'exceljs';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-gestexcel',
  templateUrl: './gestexcel.component.html',
  styleUrl: './gestexcel.component.css'
})
export class GestexcelComponent implements OnInit {
  firstFileColumns: string[] = [];
  secondFileColumns: string[] = [];
  firstFileData: any[] = [];
  secondFileData: any[] = [];
  selectedFirstFileColumns: string[] = [];
  selectedSecondFileColumns: string[] = [];
  showSpinner: boolean = false;

  ngOnInit() {
    const firstFileBase64 = localStorage.getItem('firstFile');
    const secondFileBase64 = localStorage.getItem('secondFile');

    if (firstFileBase64) {
      this.loadFileFromBase64(firstFileBase64, 'first');
    }

    if (secondFileBase64) {
      this.loadFileFromBase64(secondFileBase64, 'second');
    }
  }
  splitColumnsIntoChunks(columns: string[], chunkSize: number): string[][] {
    const chunks = [];
    for (let i = 0; i < columns.length; i += chunkSize) {
      chunks.push(columns.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private async loadFileFromBase64(base64: string, fileType: string) {
    const binaryString = window.atob(base64.split(',')[1]);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const workbook = new Workbook();
    await workbook.xlsx.load(bytes.buffer);

    const worksheet = workbook.worksheets[0];
    const data = worksheet.getSheetValues();

    if (data.length > 1 && Array.isArray(data[1])) {
      const columns = data[1]
        .map((col: any, index: number) => index > 0 ? col : null)
        .filter((col: any) => col);

      if (fileType === 'first') {
        this.firstFileColumns = columns;
        this.firstFileData = data.slice(2); // Skip the first row which contains headers
      } else if (fileType === 'second') {
        this.secondFileColumns = columns;
        this.secondFileData = data.slice(2); // Skip the first row which contains headers
      }
    } else {
      console.error('El archivo no contiene datos válidos o está vacío.');
    }

    if (this.firstFileColumns.length && this.secondFileColumns.length) {
      this.showSpinner = true;
      setTimeout(() => {
        this.showSpinner = false;
      }, 2000);
    }
  }

  async onFileChange(event: any, fileType: string) {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const file = target.files[0];
    const base64File = await this.fileToBase64(file);
    localStorage.setItem(fileType === 'first' ? 'firstFile' : 'secondFile', base64File);

    const buffer = await file.arrayBuffer();
    const workbook = new Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    const data = worksheet.getSheetValues();

    if (data.length > 1 && Array.isArray(data[1])) {
      const columns = data[1]
        .map((col: any, index: number) => index > 0 ? col : null)
        .filter((col: any) => col);

      if (fileType === 'first') {
        this.firstFileColumns = columns;
        this.firstFileData = data.slice(2); // Skip the first row which contains headers
      } else if (fileType === 'second') {
        this.secondFileColumns = columns;
        this.secondFileData = data.slice(2); // Skip the first row which contains headers
      }
    } else {
      console.error('El archivo no contiene datos válidos o está vacío.');
    }

    if (this.firstFileColumns.length && this.secondFileColumns.length) {
      this.showSpinner = true;
      setTimeout(() => {
        this.showSpinner = false;
      }, 2000);
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  onSelectColumn(event: any, fileType: string) {
    const value = event.target.value;
    if (event.target.checked) {
      if (fileType === 'first') {
        this.selectedFirstFileColumns.push(value);
      } else if (fileType === 'second') {
        this.selectedSecondFileColumns.push(value);
      }
    } else {
      if (fileType === 'first') {
        this.selectedFirstFileColumns = this.selectedFirstFileColumns.filter(col => col !== value);
      } else if (fileType === 'second') {
        this.selectedSecondFileColumns = this.selectedSecondFileColumns.filter(col => col !== value);
      }
    }
  }

  markAll(fileType: string) {
    if (fileType === 'first') {
      this.selectedFirstFileColumns = [...this.firstFileColumns];
    } else if (fileType === 'second') {
      this.selectedSecondFileColumns = [...this.secondFileColumns];
    }
  }

  unmarkAll(fileType: string) {
    if (fileType === 'first') {
      this.selectedFirstFileColumns = [];
    } else if (fileType === 'second') {
      this.selectedSecondFileColumns = [];
    }
  }

  async transferColumns() {
    try {
      const newWorkbook = new Workbook();
      const mainWorksheet = newWorkbook.addWorksheet('Sheet1');
      const unmatchedWorksheet = newWorkbook.addWorksheet('NO COINCIDEN');
  
      // Encabezados combinados para la hoja principal
      const combinedHeaders = [...this.selectedFirstFileColumns, ...this.selectedSecondFileColumns];
      const headerRow = mainWorksheet.addRow(combinedHeaders);
  
      // Aplicar formato a los encabezados de la hoja principal
      headerRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0070C0' } }; // Fondo azul
        cell.alignment = { horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
  
      // Encabezados para la hoja de "Unmatched"
      const unmatchedHeaders = this.selectedSecondFileColumns;
      const unmatchedHeaderRow = unmatchedWorksheet.addRow(unmatchedHeaders);
  
      // Aplicar formato a los encabezados de la hoja de "Unmatched"
      unmatchedHeaderRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0070C0' } }; // Fondo azul
        cell.alignment = { horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
  
      const firstFileColumnIndices = this.selectedFirstFileColumns.map(col => this.firstFileColumns.indexOf(col) + 1);
      const secondFileColumnIndices = this.selectedSecondFileColumns.map(col => this.secondFileColumns.indexOf(col) + 1);
  
      const firstFileSerialIndex = this.firstFileColumns.indexOf('NUMERO SERIE') + 1;
      const secondFileSerialIndex = this.secondFileColumns.indexOf('NUMERO SERIE') + 1;
  
      if (firstFileSerialIndex === 0 || secondFileSerialIndex === 0) {
        throw new Error('La columna "Numero de Serie" no se encuentra en uno o ambos archivos.');
      }
  
      const dataMap: { [key: string]: any[] } = {};
      const unmatchedData: any[] = [];
  
      // Mapeo de datos del primer archivo
      this.firstFileData.forEach((row) => {
        const serialNumber = row[firstFileSerialIndex];
        if (serialNumber) {
          if (!dataMap[serialNumber]) {
            dataMap[serialNumber] = new Array(this.selectedFirstFileColumns.length + this.selectedSecondFileColumns.length).fill('');
          }
          firstFileColumnIndices.forEach((index, i) => {
            dataMap[serialNumber][i] = row[index] || '';
          });
        }
      });
  
      // Mapeo de datos del segundo archivo
      this.secondFileData.forEach((row) => {
        const serialNumber = row[secondFileSerialIndex];
        if (serialNumber) {
          if (!dataMap[serialNumber]) {
            unmatchedData.push(row);
          } else {
            secondFileColumnIndices.forEach((index, i) => {
              dataMap[serialNumber][this.selectedFirstFileColumns.length + i] = row[index] || '';
            });
          }
        }
      });
  
      // Ordenar los datos por "Numero de Serie"
      const sortedKeys = Object.keys(dataMap).sort();
  
      // Agregar las filas combinadas al nuevo archivo
      sortedKeys.forEach(serialNumber => {
        mainWorksheet.addRow(dataMap[serialNumber]);
      });
  
      // Agregar los datos no coincidentes a la hoja "Unmatched"
      unmatchedData.forEach(row => {
        const newRow: any[] = [];
        secondFileColumnIndices.forEach(index => newRow.push(row[index] || ''));
        unmatchedWorksheet.addRow(newRow);
      });
  
      const buffer = await newWorkbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      saveAs(blob, 'NuevoArchivo.xlsx');
    } catch (error) {
      console.error('Error al transferir columnas:', error);
    }
  }
}




