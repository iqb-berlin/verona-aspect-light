import {
  Component, HostListener,
  Input, OnDestroy,
  OnInit, QueryList, ViewChildren
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { UnitPage, UnitPageSection } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';
import { CanvasSectionComponent } from './canvas-section.component';
import { CanvasDragOverlayComponent } from './canvas-drag-overlay.component';

@Component({
  selector: 'app-page-canvas',
  templateUrl: './page-canvas.component.html',
  styles: [
    '.canvasFrame {background-color: lightgrey; height: 69vh; overflow: auto; width: 100%}',
    '.section {position: relative;}'
  ]
})
export class PageCanvasComponent implements OnInit, OnDestroy {
  @Input() pageObservable!: Observable<UnitPage>;
  @ViewChildren('section_component') canvasSections!: QueryList<CanvasSectionComponent>;
  private pageSubscription!: Subscription;
  private pageSwitchSubscription!: Subscription;
  page!: UnitPage;
  sectionEditMode: boolean = false;
  selectedSectionIndex = 0;
  selectedComponentElements: CanvasDragOverlayComponent[] = [];

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Delete') {
      this.unitService.deleteSelectedElements();
    }
  }

  constructor(public unitService: UnitService) { }

  ngOnInit(): void {
    this.pageSubscription = this.pageObservable.subscribe((page: UnitPage) => {
      this.page = page;
      this.canvasSections?.toArray().forEach((sectionComponent: CanvasSectionComponent) => {
        sectionComponent.renderSection();
        sectionComponent.updateSelection(this.unitService.getSelectedElements());
      });
    });
    this.pageSwitchSubscription = this.unitService.selectedPageIndex.subscribe( // TODO name properly
      () => {
        this.clearSelection();
      }
    );
    this.pageSwitchSubscription = this.unitService.selectedPageSectionIndex.subscribe(
      (index: number) => {
        this.selectedSectionIndex = index;
      }
    );
  }

  selectSection(id: number): void {
    this.unitService.selectPageSection(Number(id));
  }

  elementSelected(event: { componentElement: CanvasDragOverlayComponent; multiSelect: boolean }): void {
    if (!event.multiSelect) {
      this.clearSelection();
    }
    this.selectedComponentElements.push(event.componentElement);
    this.unitService.selectElement(event.componentElement.element);
    event.componentElement.selected = true;
  }

  private clearSelection() {
    this.selectedComponentElements = [];
    this.canvasSections?.toArray().forEach((sectionComponent: CanvasSectionComponent) => {
      sectionComponent.clearSelection();
    });
    this.unitService.clearSelectedElements();
  }

  // TODO use updateSelectedElementProperty
  elementDropped(event: CdkDragDrop<UnitPageSection>): void {
    const sourceItemModel = event.item.data;

    if (event.previousContainer !== event.container) {
      transferArrayItem(event.previousContainer.data.elements,
        event.container.data.elements,
        event.previousIndex,
        event.currentIndex);
      this.canvasSections?.toArray().forEach((sectionComponent: CanvasSectionComponent) => {
        sectionComponent.renderSection();
        sectionComponent.updateSelection(this.unitService.getSelectedElements());
      });
    } else {
      sourceItemModel.xPosition += event.distance.x;
      if (sourceItemModel.xPosition < 0) {
        sourceItemModel.xPosition = 0;
      }
      if (sourceItemModel.xPosition > event.container.data.width - sourceItemModel.width) {
        sourceItemModel.xPosition = event.container.data.width - sourceItemModel.width;
      }
      sourceItemModel.yPosition += event.distance.y;
      if (sourceItemModel.yPosition < 0) {
        sourceItemModel.yPosition = 0;
      }
      if (sourceItemModel.yPosition > this.getPageHeight() - sourceItemModel.height) {
        sourceItemModel.yPosition = this.getPageHeight() - sourceItemModel.height;
      }
    }
  }

  dropSection(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.page.sections, event.previousIndex, event.currentIndex);
    this.unitService.selectPageSection(0);
  }

  getPageHeight(): number { // TODO weg
    const reduceFct = (accumulator: number, currentValue: UnitPageSection) => accumulator + currentValue.height;
    return this.page.sections.reduce(reduceFct, 0);
  }

  alignElements(event: 'left' | 'right' | 'top' | 'bottom'):void {
    let newValue: number;
    switch (event) {
      case 'left':
        newValue = Math.min(...this.selectedComponentElements.map(el => el.element.xPosition));
        this.selectedComponentElements.forEach((element: CanvasDragOverlayComponent) => {
          element.element.xPosition = newValue;
        });
        break;
      case 'right':
        newValue = Math.max(...this.selectedComponentElements.map(
          el => el.element.xPosition + el.element.width
        ));
        this.selectedComponentElements.forEach((element: CanvasDragOverlayComponent) => {
          element.element.xPosition = newValue - element.element.width;
        });
        break;
      case 'top':
        newValue = Math.min(...this.selectedComponentElements.map(el => el.element.yPosition));
        this.selectedComponentElements.forEach((element: CanvasDragOverlayComponent) => {
          element.element.yPosition = newValue;
        });
        break;
      case 'bottom':
        newValue = Math.max(...this.selectedComponentElements.map(
          el => el.element.yPosition + el.element.height
        ));
        this.selectedComponentElements.forEach((element: CanvasDragOverlayComponent) => {
          element.element.yPosition = newValue - element.element.height;
        });
        break;
      // no default
    }
  }

  ngOnDestroy(): void {
    this.pageSubscription.unsubscribe();
    this.pageSwitchSubscription.unsubscribe();
  }
}
