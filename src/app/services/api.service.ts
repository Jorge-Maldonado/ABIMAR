// src/app/services/api.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService<T> {

  constructor(private http: HttpClient) {}

  post(url: string, data: T, headersObj?: { [key: string]: string }): Observable<any> {
    const headers = new HttpHeaders(headersObj || {
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(url, data, { headers });
  }

  // Puedes agregar más métodos como GET, PUT, DELETE si necesitas:
  // get<R>(url: string, headersObj?: { [key: string]: string }): Observable<R> { ... }
}
