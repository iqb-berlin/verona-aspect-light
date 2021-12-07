import {
  Component, ElementRef, Input, QueryList, ViewChild, ViewChildren
} from '@angular/core';
import { UnitService } from '../../../../services/unit.service';
import { Section } from '../../../../../../../common/models/section';
import { UIElementType } from '../../../../../../../common/models/uI-element';
import { SectionDynamicComponent } from './section-dynamic.component';
import { CanvasElementOverlay } from './overlays/canvas-element-overlay';

@Component({
  selector: 'app-section-static',
  template: `
    <div #sectionElement class="section-wrapper"
         [style.outline]="isSelected ? '2px solid #ff4081': '1px dotted'"
         [style.z-index]="isSelected ? 1 : 0"
         [style.height.px]="section.height"
         [style.background-color]="section.backgroundColor"
         (dragover)="$event.preventDefault()" (drop)="newElementDropped($event)">
      <app-static-canvas-overlay #elementComponent
        *ngFor="let element of section.elements"
        [element]="$any(element)">
      </app-static-canvas-overlay>
    </div>
  `,
  styles: [
    '.section-wrapper {position: relative; width: 100%; overflow: hidden;}'
  ]
})
export class SectionStaticComponent {
  @Input() section!: Section;
  @Input() isSelected!: boolean;
  @ViewChild('sectionElement') sectionElement!: ElementRef;
  @ViewChildren('elementComponent') childElementComponents!: QueryList<CanvasElementOverlay>;

  constructor(public unitService: UnitService) { }

  newElementDropped(event: DragEvent): void {
    event.preventDefault();
    const sectionRect = this.sectionElement.nativeElement.getBoundingClientRect();
    this.unitService.addElementToSection(
      event.dataTransfer?.getData('elementType') as UIElementType,
      this.section,
      { x: event.clientX - Math.round(sectionRect.left), y: event.clientY - Math.round(sectionRect.top) }
    );
  }
}
