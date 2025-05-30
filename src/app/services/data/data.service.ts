import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private data: any = {};

  constructor() {}

  // Set data for the current page
  setData(key: string, value: any): void {
    this.data[key] = value;
  }

  displayData(): void {
    return this.data;
  }

  // Get data for the current page
  getData(key: string): any {
    return this.data[key];
  }

  // Get all data
  getAllData(): any {
    return this.data;
  }
}