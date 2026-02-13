import { Component, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from '../map.service';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss']
})
export class MapaComponent implements AfterViewInit, OnDestroy {
  private map: any;
  private currentTileLayer: any;
  private markersLayer = new L.LayerGroup();
  
  private mapCenter: L.LatLngExpression = [2048, 2048];
  private mapBounds = L.latLngBounds([0, 0], [4096, 4096]);

  public localAtivo: any = null;
  public estaTrocandoMapa: boolean = false;
  public mapaAtual: 'terra' | 'oceano' = 'terra';
  public mostrarPergaminho: boolean = false;

  constructor(private mapService: MapService, private cdr: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    // Timeout para garantir que o container do mapa esteja pronto no HTML
    setTimeout(() => { this.initMap(); }, 300);
  }

  private initMap(): void {
    const factor = 256 / 4096;
    (L.CRS.Simple as any).transformation = new L.Transformation(factor, 0, factor, 0);

    this.map = L.map('map', {
      crs: L.CRS.Simple,
      minZoom: 1, 
      maxZoom: 4, // Diminuído para evitar buscar tiles inexistentes
      zoomControl: false,
      zoomAnimation: true,
      fadeAnimation: true
    });

    this.map.setView(this.mapCenter, 2);
    
    this.carregarCamadaMapa(this.mapaAtual === 'terra' ? 'assets/mapa' : 'assets/mapa_oceano');
    this.markersLayer.addTo(this.map);
    this.carregarLocais();

    // Comando vital contra a tela branca: força o Leaflet a se redesenhar
    setTimeout(() => { this.map.invalidateSize(); }, 500);
  }

  private carregarCamadaMapa(caminho: string) {
    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }

    // RESOLUÇÃO DOS ERROS 404 E DE COMPILAÇÃO:
    this.currentTileLayer = L.tileLayer(`${caminho}/{z}/{x}/{y}.png`, {
      tileSize: 256,
      noWrap: true,
      bounds: this.mapBounds,
      maxNativeZoom: 2, // IMPORTANTE: Impede o erro 404 ao buscar pastas nível 3
      maxZoom: 4
    }).addTo(this.map);
  }

  private carregarLocais() {
    this.markersLayer.clearLayers();
    this.mapService.getLocais().subscribe(locais => {
      const pinsParaMostrar = this.mapaAtual === 'terra' 
        ? locais.filter(l => l.mapa !== 'oceano') 
        : locais.filter(l => l.mapa === 'oceano');
      this.renderMarkers(pinsParaMostrar);
    });
  }

  private renderMarkers(locais: any[]): void {
    locais.forEach(point => {
      const cssIcon = L.divIcon({
        html: `<img src="assets/icones/${point.icone}" class="pin-imagem">`,
        className: 'custom-div-icon',
        iconSize: [120, 120],
        iconAnchor: [60, 120]
      });

      const marker = L.marker([point.coords[0], point.coords[1]], { icon: cssIcon });

      marker.on('click', () => {
        // ID 7 = Ir para o Mar | ID 9 = Voltar para a Terra
        if (point.id == 7 && this.mapaAtual === 'terra') {
          this.executarTransicao(point, 'oceano', 'assets/mapa_oceano');
        } else if (point.id == 9 && this.mapaAtual === 'oceano') {
          this.executarTransicao(point, 'terra', 'assets/mapa');
        } else {
          // Abre o pergaminho para TODOS os outros pins
          this.abrirPergaminho(point);
        }
      });
      marker.addTo(this.markersLayer);
    });
  }

  private abrirPergaminho(point: any) {
    this.localAtivo = point;
    this.mostrarPergaminho = false;
    
    this.map.flyTo([point.coords[0], point.coords[1]], 4, { animate: true, duration: 1.2 });

    setTimeout(() => {
      this.mostrarPergaminho = true;
      this.cdr.detectChanges(); // Força o Angular a mostrar o pop-up
    }, 700);
  }

  fecharPergaminho() {
    this.mostrarPergaminho = false;
    setTimeout(() => {
      this.localAtivo = null;
      this.map.flyTo(this.mapCenter, 2, { animate: true, duration: 1.2 });
      this.cdr.detectChanges();
    }, 500);
  }

  private executarTransicao(point: any, novoDestino: 'terra' | 'oceano', caminhoAssets: string) {
    this.map.flyTo([point.coords[0], point.coords[1]], 4, { animate: true, duration: 1.0 });
    setTimeout(() => { this.estaTrocandoMapa = true; }, 800);

    setTimeout(() => {
      this.mapaAtual = novoDestino;
      this.carregarCamadaMapa(caminhoAssets);
      this.carregarLocais();
      this.map.setView(this.mapCenter, 2);
    }, 1800);

    setTimeout(() => { this.estaTrocandoMapa = false; }, 3200);
  }

  voltarParaContinente() {
    this.mostrarPergaminho = false;
    setTimeout(() => {
      this.localAtivo = null;
      this.executarTransicao({coords: [2048, 2048], id: 9}, 'terra', 'assets/mapa');
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.map) { this.map.remove(); }
  }
}