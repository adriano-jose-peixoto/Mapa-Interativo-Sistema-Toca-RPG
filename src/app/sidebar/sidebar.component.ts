import { Component, OnInit } from '@angular/core';
import { MapService } from '../map.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  ativo = false;
  dados: any = null;

  constructor(private mapService: MapService) { }

  ngOnInit(): void {
    this.mapService.localSelecionado$.subscribe((dados: any) => {
      this.dados = dados;
      this.ativo = true;
    });
  }

  fechar() {
    this.ativo = false;
  }
}