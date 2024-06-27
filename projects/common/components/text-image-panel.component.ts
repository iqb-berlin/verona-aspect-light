import {
  Component, Input
} from '@angular/core';
import { DragNDropValueObject, TextImageLabel } from 'common/models/elements/label-interfaces';

@Component({
  selector: 'aspect-text-image-panel',
  template: `
    <div *ngIf="$any(label).audioSrc"
         class="audio-button"
         (click)="player.play()">
      <audio #player
             [src]="$any(label).audioSrc | safeResourceUrl">
      </audio>
      <mat-icon data-draggable-audio="true">play_arrow</mat-icon>
    </div>
    <div class="image-wrapper" [ngClass]="{'column': label.imgPosition === 'above',
                                     'column-reverse': label.imgPosition === 'below',
                                     'row': label.imgPosition === 'left',
                                     'row-reverse': label.imgPosition === 'right'}">
      <img *ngIf="label.imgSrc"
           [style.object-fit]="'scale-down'"
           [style.max-width.%]="100"
           imageFullscreen [imgSrc]="label.imgSrc | safeResourceUrl"
           [src]="label.imgSrc | safeResourceUrl" alt="Image Placeholder">
      <div *ngIf="label.text !== ''" class="text" [innerHTML]="label.text | safeResourceHTML"></div>
    </div>
  `,
  styles: [`
    :host {
      align-self: center;
      justify-content: inherit;
      display: flex;
      max-height: 100%;
    }
    .image-wrapper {
      display: flex;
      justify-content: inherit;
      max-height: 100%;
    }
    .column {flex-direction: column;}
    .column-reverse {flex-direction: column-reverse;}
    .row {flex-direction: row;}
    .row-reverse {flex-direction: row-reverse;}
    .text {
      display: flex;
      align-items: center;
      color: inherit;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      font-style: inherit;
      text-decoration: inherit;
      background-color: inherit;
      margin: 10px;
    }
    .column .text, .column-reverse .text {
      justify-content: center;
    }
    .audio-button {
      cursor: pointer;
      align-self: center;
      padding: 0 5px;
      display: flex; flex-direction: row; align-items: center; justify-content: flex-start;
    }
    .audio-button:hover {
      color: #006064;
    }
  `]
})
export class TextImagePanelComponent {
  @Input() label!: TextImageLabel | DragNDropValueObject;
}
