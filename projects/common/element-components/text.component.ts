import { Component } from '@angular/core';
import { TextElement } from '../unit';
import { ElementComponent } from '../element-component.directive';

@Component({
  selector: 'app-text',
  template: `
      <div [style.width.px]="elementModel.width"
           [style.height.px]="elementModel.height"
           [style.background-color]="elementModel.backgroundColor"
           [style.color]="elementModel.fontColor"
           [style.font-family]="elementModel.font"
           [style.font-size.px]="elementModel.fontSize"
           [style.font-weight]="elementModel.bold ? 'bold' : ''"
           [style.font-style]="elementModel.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.underline ? 'underline' : ''"
           [style.white-space]="'pre-wrap'">
          {{elementModel.text}}
      </div>
  `
})
export class TextComponent extends ElementComponent {
  elementModel!: TextElement;
}
