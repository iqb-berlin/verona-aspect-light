import { Component, Input } from '@angular/core';
import { Unit } from '../../../common/unit';

interface StartData {
  unitDefinition: string;
  unitStateData: string;
}

@Component({
  selector: 'player-aspect',
  template: `
    <mat-tab-group mat-align-tabs="start">
      <mat-tab *ngFor="let page of unitJSON.pages; let i = index" label="Seite {{i+1}}">
        <app-page [page]="page"></app-page>
      </mat-tab>
    </mat-tab-group>
    `
})
export class AppComponent {
  unitJSON: Unit = {
    pages: []
  };

  @Input()
  set startData(startData: StartData) {
    this.unitJSON = JSON.parse(startData.unitDefinition);
  }

  exampleUnit = {
    pages: [
      {
        sections: [
          {
            elements: [
              {
                label: 'Label Dropdown',
                options: [
                  'op1',
                  'op2'
                ],
                type: 'dropdown',
                id: 'dummyID',
                xPosition: 124,
                yPosition: 26,
                width: 180,
                height: 60,
                backgroundColor: 'grey',
                fontColor: 'blue',
                font: 'Arial',
                fontSize: 18,
                bold: true,
                italic: false,
                underline: false
              }
            ],
            width: 1200,
            height: 200,
            backgroundColor: '#FFFAF0'
          },
          {
            elements: [
              {
                label: 'Button Text',
                type: 'button',
                id: 'dummyID',
                xPosition: 440,
                yPosition: 77,
                width: 180,
                height: 60,
                backgroundColor: 'grey',
                fontColor: 'blue',
                font: 'Arial',
                fontSize: 18,
                bold: true,
                italic: false,
                underline: false
              }
            ],
            width: 1200,
            height: 200,
            backgroundColor: '#FFFAF0'
          }
        ],
        width: 1200,
        height: 550,
        backgroundColor: '#FFFAF0'
      },
      {
        sections: [
          {
            elements: [],
            width: 1200,
            height: 200,
            backgroundColor: '#FFFAF0'
          }
        ],
        width: 1200,
        height: 550,
        backgroundColor: '#FFFAF0'
      }
    ]
  };
}
