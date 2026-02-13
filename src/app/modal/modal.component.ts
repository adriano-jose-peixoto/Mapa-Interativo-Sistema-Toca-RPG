import { Component, OnInit } from '@angular/core';
import { MapService } from '../map.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  ativo = false;
  dados: any = null;
  imagemAtualIndex = 0;

  constructor(private mapService: MapService) { }

  ngOnInit(): void {
    // Fica ouvindo: se alguém clicar no mapa, o serviço avisa e o modal abre
    this.mapService.localSelecionado$.subscribe((dados: any) => {
      this.dados = dados;
      this.imagemAtualIndex = 0; // Reseta para a primeira foto
      this.ativo = true;
    });
  }

  fechar() {
    this.ativo = false;
    this.dados = null;
  }

  proximaImagem() {
    if (this.dados && this.dados.imagens) {
      this.imagemAtualIndex = (this.imagemAtualIndex + 1) % this.dados.imagens.length;
    }
  }

  imagemAnterior() {
    if (this.dados && this.dados.imagens) {
      this.imagemAtualIndex = (this.imagemAtualIndex - 1 + this.dados.imagens.length) % this.dados.imagens.length;
    }
  }
}