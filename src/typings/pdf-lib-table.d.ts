declare module 'pdf-lib-table' {
  import { PDFPage, PDFFont } from 'pdf-lib';

  interface TableStyles {
    fillColor?: [r: number, g: number, b: number];
    textColor?: [r: number, g: number, b: number];
    fontSize?: number;
  }

  interface TableOptions {
    headers: string[];
    rows: string[][];
    headerStyles?: TableStyles;
    rowStyles?: TableStyles;
    alternateRowStyles?: TableStyles;
  }

  interface TableDrawerOptions {
    x: number;
    y: number;
    width: number;
    font: PDFFont;
    boldFont: PDFFont;
  }

  export class TableDrawer {
    constructor(page: PDFPage, options: TableDrawerOptions);
    drawTable(options: TableOptions): void;
  }
}
