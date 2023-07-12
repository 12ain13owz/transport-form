import { Index, Shop } from "./../models/kerry.model";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { KerryModel, Order } from "../models/kerry.model";

@Injectable({
  providedIn: "root"
})
export class HttpService {
  constructor(private http: HttpClient) {}

  private local: string = "http://localhost:3200/api/v1/";

  requestPost(body: KerryModel) {
    return this.http.post(`${this.local}create`, body).toPromise();
  }

  requestPut(body: KerryModel) {
    return this.http.put(`${this.local}update`, body).toPromise();
  }

  requestDelete(id: number) {
    return this.http.delete(`${this.local}delete/${id}`).toPromise();
  }

  requestUpdateTable() {
    return this.http.get(`${this.local}table`).toPromise();
  }

  getShop() {
    return this.http.get<Shop[]>(`${this.local}shop`).toPromise();
  }

  getAllShop() {
    return this.http.get<Shop[]>(`${this.local}allshop`).toPromise();
  }

  addShop(body) {
    return this.http.post(`${this.local}shop`, body).toPromise();
  }

  updateShop(body: Shop[]) {
    return this.http.put(`${this.local}shop`, body).toPromise();
  }

  getIndex(date: string, shop: number) {
    return this.http
      .get<Index>(`${this.local}index/${date}/${shop}`)
      .toPromise();
  }

  getAllOrder() {
    return this.http.get<Order[]>(`${this.local}all`).toPromise();
  }

  getOrderByID(id: number) {
    return this.http.get<Order>(`${this.local}id/${id}`).toPromise();
  }

  exportExcel(data) {
    return this.http.post(`${this.local}excel`, data).toPromise();
  }

  exportWord(data) {
    return this.http.post(`${this.local}word`, data).toPromise();
  }

  exportReport(data) {
    return this.http.post(`${this.local}report`, data).toPromise();
  }
}
