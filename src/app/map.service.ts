import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private localSelecionadoSource = new Subject<any>();
  localSelecionado$ = this.localSelecionadoSource.asObservable();

  constructor(private http: HttpClient) { }

  // Carrega os dados do arquivo JSON na pasta assets
  getLocais(): Observable<any[]> {
    return this.http.get<any[]>('assets/data/locais.json');
  }

  selecionarLocal(dados: any) {
    this.localSelecionadoSource.next(dados);
  }
}