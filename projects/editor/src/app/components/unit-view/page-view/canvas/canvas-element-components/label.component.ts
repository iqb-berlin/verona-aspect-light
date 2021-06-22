import { Component } from '@angular/core';
import { CanvasElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-label',
  template: `
    <div *ngIf="!manualPositioning"
         cdkDrag [cdkDragData]="this"
         (click)="click($event)"
         [ngStyle]="style">
      {{$any(elementModel).label}}
    </div>
    <div *ngIf="manualPositioning"
         (click)="click($event)"
         [ngStyle]="style">
      {{$any(elementModel).label}}
    </div>
  `,
  styles: [
    'div {position: absolute}'
  ]
})
export class LabelComponent extends CanvasElementComponent { }
