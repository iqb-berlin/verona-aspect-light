import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';

import { SharedModule, APIService } from 'common/shared.module';
import { KeyInputModule } from 'player/modules/key-input/key-input.module';
import { UnitMenuModule } from 'player/modules/unit-menu/unit-menu.module';

import { MetaDataService } from 'player/src/app/services/meta-data.service';
import { ErrorService } from 'player/src/app/services/error.service';

import { AppComponent } from "./app.component";
import { SectionComponent } from "./components/section/section.component";
import { UnitComponent } from "./components";


@NgModule({
  declarations: [
    AppComponent,
    UnitComponent,
    SectionComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    SharedModule,
    KeyInputModule,
    UnitMenuModule
  ],
  providers: [
    provideExperimentalZonelessChangeDetection(),
    { provide: APIService, useExisting: MetaDataService },
    { provide: ErrorHandler, useClass: ErrorService }
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
