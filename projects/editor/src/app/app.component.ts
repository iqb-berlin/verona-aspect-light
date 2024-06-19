import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { VeronaAPIService, StartCommand } from './services/verona-api.service';
import { UnitService } from './services/unit-services/unit.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'aspect-editor',
  template: `
    <div class="mainView fx-column-start-stretch">
      <aspect-toolbar *ngIf="isStandalone"></aspect-toolbar>
      <aspect-unit-view class="fx-flex"></aspect-unit-view>
    </div>
  `,
  styles: [`
    .mainView {
      height: 100%;
    }
  `]
})

export class AppComponent implements OnInit {
  isStandalone = window === window.parent;

  constructor(private unitService: UnitService,
              private translateService: TranslateService,
              private veronaApiService: VeronaAPIService,
              private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer) {
    translateService.addLangs(['de']);
    translateService.setDefaultLang('de');
    this.matIconRegistry.addSvgIcon('playlist_remove',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/playlist_remove.svg'));
  }

  ngOnInit(): void {
    this.veronaApiService.startCommand
      .subscribe((message: StartCommand): void => {
        this.unitService.loadUnitDefinition(message.unitDefinition);
      });
    this.veronaApiService.sendReady();
    registerLocaleData(localeDe);
  }
}
