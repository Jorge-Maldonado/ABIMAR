// src/app/services/api.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService<T> {

  constructor(private http: HttpClient) { }

  url(path: string) {
    return `${environment.apiBase}/${path}`;
  }
  // 👉 POST
  post(url: string, data: T, headersObj?: { [key: string]: string }): Observable<any> {
    const headers = new HttpHeaders(headersObj || {
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(url, data, { headers });
  }

  // 👉 GET
  get<R>(url: string, headersObj?: { [key: string]: string }): Observable<R> {
    const headers = new HttpHeaders(headersObj || {
      'Content-Type': 'application/json'
    });
    return this.http.get<R>(url, { headers });
  }

  // 👉 PUT
  put(url: string, data: T, headersObj?: { [key: string]: string }): Observable<any> {
    const headers = new HttpHeaders(headersObj || {
      'Content-Type': 'application/json'
    });
    return this.http.put<any>(url, data, { headers });
  }

  // 👉 DELETE
  delete<R>(url: string, headersObj?: { [key: string]: string }): Observable<R> {
    const headers = new HttpHeaders(headersObj || {
      'Content-Type': 'application/json'
    });
    return this.http.delete<R>(url, { headers });
  }
}
