import {
  Component, EventEmitter, HostListener, Input, Output
} from '@angular/core';
import { ValueChangeElement } from '../models/uI-element';

@Component({
  selector: 'app-magnifier',
  template: `
    <div class="hide-cursor">
      <div class="magnifier-glass"
           [style.backgroundImage]="'url(' + image.src + ')'"
           [style.backgroundPosition]="backgroundPosition"
           [style.left.px]="left"
           [style.top.px]="top"
           [style.width.px]="size"
           [style.height.px]="size"
           [style.backgroundSize]="(image.width * zoom) + 'px ' + (image.height * zoom) + 'px'"
           [style.backgroundRepeat]="'no-repeat'">
      </div>
    </div>
  `,
  styles: [
    ':host { position: absolute; top: 0; bottom: 0; right: 0; left: 0; }',
    '.magnifier-glass{ position: absolute; border: 1px solid #000; pointer-events: none;}',
    '.hide-cursor{ width: 100%; height: 100%; cursor: none }'
  ]
})
export class Magnifier {
  @Input() image!: HTMLImageElement;
  @Input() imageId!: string;
  @Input() zoom!: number;
  @Input() size!: number;
  @Input() used!: boolean;
  @Output() magnifierUsed = new EventEmitter<ValueChangeElement>();

  left!: number;
  top!: number;
  backgroundPosition!: string;

  @HostListener('mousemove', ['$event'])
  onMousemove(event: MouseEvent): void {
    if (!this.used) {
      this.used = true;
      this.magnifierUsed.emit({ id: this.imageId, values: [false, true] });
    }
    this.left = this.calculateGlassPosition(this.image.width, event.offsetX);
    this.top = this.calculateGlassPosition(this.image.height, event.offsetY);
    this.backgroundPosition =
      `-${
        this.calculateBackgroundPosition(this.image.width, event.offsetX)
      }px -${
        this.calculateBackgroundPosition(this.image.height, event.offsetY)
      }px`;
  }

  private calculateGlassPosition(max: number, value: number): number {
    return ((max - this.size) / (max)) * value;
  }

  private calculateBackgroundPosition(max: number, value: number): number {
    return value * this.zoom - (value / max) * this.size;
  }
}
