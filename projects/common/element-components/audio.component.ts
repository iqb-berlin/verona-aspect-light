import { Component } from '@angular/core';
import { ElementComponent } from '../element-component.directive';
import { AudioElement } from '../models/audio-element';

@Component({
  selector: 'app-audio',
  template: `
    <div [style.width.%]="100"
         [style.height.%]="100">
      <audio #player
             [style.width.%]="100"
             [src]="elementModel.src | safeResourceUrl">
      </audio>
      <app-control-bar [player]="player"
                       [elementModel]="elementModel">
      </app-control-bar>
    </div>
  `
})
export class AudioComponent extends ElementComponent {
  elementModel!: AudioElement;
}
