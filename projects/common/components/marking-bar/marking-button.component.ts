import {
  Component, EventEmitter, Input, Output
} from '@angular/core';

@Component({
  selector: 'aspect-marking-button',
  template: `
    <button type="button"
            class="marking-button"
            [style.border-color]="selected ? 'black' : color"
            mat-mini-fab
            [style.background-color]="color"
            (mousedown)="emitSelectedChanged($event)"
            (touchstart)="emitSelectedChanged($event)">
      <mat-icon *ngIf="mode === 'mark'"
                class="marking-icon">border_color
      </mat-icon>
      <mat-icon *ngIf="mode === 'delete'"
                class="marking-icon"
                svgIcon="rubber-black">
      </mat-icon>
    </button>`,
  styles: [
    '.marking-button {color: #333; margin-left: 5px; margin-top: 2px; border: 2px solid;}',
    '.marking-icon {margin-top: -4px}'
  ]
})
export class MarkingButtonComponent {
  @Input() selected!: boolean;
  @Input() color!: string;
  @Input() mode!: 'mark' | 'delete';
  @Input() element!: HTMLElement;
  @Output() selectedChanged = new EventEmitter<{
    selected: boolean,
    mode: 'mark' | 'delete',
    color: string,
  }>();

  emitSelectedChanged(event: TouchEvent | MouseEvent): void {
    if (event instanceof TouchEvent && event.cancelable) {
      event.preventDefault();
    }
    event.stopPropagation();
    this.selected = !this.selected;
    this.selectedChanged.emit({ selected: this.selected, mode: this.mode, color: this.color });
  }
}
