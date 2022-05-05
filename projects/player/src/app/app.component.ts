import { Component, OnInit } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { TranslateService } from '@ngx-translate/core';
import { PlayerConfig, VopStartCommand } from 'verona/models/verona';
import { ElementModelElementCodeMappingService } from './services/element-model-element-code-mapping.service';
import { VeronaSubscriptionService } from 'verona/services/verona-subscription.service';
import { VeronaPostService } from 'verona/services/verona-post.service';
import { NativeEventService } from './services/native-event.service';
import { MetaDataService } from './services/meta-data.service';
import { UnitStateService } from './services/unit-state.service';
import { MediaPlayerService } from './services/media-player.service';
import { Page, Unit } from 'common/interfaces/unit';
import { ValidationService } from './services/validation.service';
import { UnitFactory } from 'common/util/unit.factory';
import { SanitizationService } from 'common/services/sanitization.service';
import { UnitUtils } from 'common/util/unit-utils';
import { DragNDropValueObject, UIElement } from 'common/interfaces/elements';

@Component({
  selector: 'aspect-player',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isStandalone: boolean;
  pages: Page[] = [];
  playerConfig: PlayerConfig | null = null;

  constructor(private translateService: TranslateService,
              private veronaSubscriptionService: VeronaSubscriptionService,
              private veronaPostService: VeronaPostService,
              private metaDataService: MetaDataService,
              private nativeEventService: NativeEventService,
              private unitStateService: UnitStateService,
              private mediaPlayerService: MediaPlayerService,
              private elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
              private validatorService: ValidationService,
              private sanitizationService: SanitizationService) {
    this.isStandalone = window === window.parent;
  }

  ngOnInit(): void {
    this.initSubscriptions();
    this.initVeronaPostService();
    this.setLocales();
  }

  private initSubscriptions(): void {
    this.veronaSubscriptionService.vopStartCommand
      .subscribe((message: VopStartCommand): void => this.onStart(message));
    this.nativeEventService.focus
      .subscribe((focused: boolean): void => this.onFocus(focused));
  }

  private initVeronaPostService(): void {
    this.veronaPostService.isStandalone = this.isStandalone;
    this.veronaPostService.sendVopReadyNotification(this.metaDataService.playerMetadata);
  }

  private setLocales(): void {
    this.translateService.addLangs(['de']);
    this.translateService.setDefaultLang('de');
    registerLocaleData(localeDe);
  }

  private onStart(message: VopStartCommand): void {
    this.reset();
    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log('player: onStart', message);
      if (message.unitDefinition) {
        const unitDefinition: Unit = UnitFactory.createUnit(
          this.sanitizationService.sanitizeUnitDefinition(JSON.parse(message.unitDefinition))
        );
        this.configureSession(message, unitDefinition);
      } else {
        // eslint-disable-next-line no-console
        console.warn('player: message has no unitDefinition');
      }
    });
  }

  private configureSession(message: VopStartCommand, unitDefinition: Unit): void {
    this.configureServices(message, unitDefinition.pages);
    this.configureUnit(message, unitDefinition.pages);
    // eslint-disable-next-line no-console
    console.log('player: unitStateElementCodes', this.unitStateService.elementCodes);
  }

  private configureServices(message: VopStartCommand, pages: Page[]): void {
    this.configureElementModelElementCodeMappingService(pages);
    this.unitStateService.elementCodes = message.unitState?.dataParts?.elementCodes ?
      JSON.parse(message.unitState.dataParts.elementCodes) : [];
    this.veronaPostService.sessionId = message.sessionId;
    this.veronaPostService.stateReportPolicy = message.playerConfig?.stateReportPolicy || 'none';
  }

  configureUnit(message: VopStartCommand, pages: Page[]): void {
    this.pages = pages;
    this.playerConfig = message.playerConfig || {};
  }

  private configureElementModelElementCodeMappingService(pages: Page[]): void {
    this.elementModelElementCodeMappingService.dragNDropValueObjects = (
      UnitUtils.findUIElements(pages, 'drop-list')
        .concat(UnitUtils.findUIElements(pages, 'drop-list-simple')).reduce(
          (accumulator: DragNDropValueObject[], currentValue: UIElement) => (
            (currentValue.value && (currentValue.value as DragNDropValueObject[]).length) ?
              accumulator.concat(currentValue.value as DragNDropValueObject) : accumulator), []));
  }

  private onFocus(focused: boolean): void {
    // eslint-disable-next-line no-console
    console.log('player: onFocus', focused);
    this.veronaPostService.sendVopWindowFocusChangedNotification(focused);
  }

  private reset(): void {
    // eslint-disable-next-line no-console
    console.log('player: reset');
    this.pages = [];
    this.playerConfig = null;
    this.unitStateService.reset();
    this.mediaPlayerService.reset();
    this.validatorService.reset();
    this.elementModelElementCodeMappingService.reset();
  }
}
