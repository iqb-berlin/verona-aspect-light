// eslint-disable-next-line max-classes-per-file
import {
  AfterViewInit,
  Component, ElementRef, Input, OnDestroy, OnInit, Pipe, PipeTransform, ViewChild
} from '@angular/core';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { DragNDropValueObject } from 'common/models/elements/element';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'aspect-drop-list',
  template: `
    <div class="list" [id]="elementModel.id"
         [fxLayout]="elementModel.orientation | droplistLayout"
         [fxLayoutAlign]="elementModel.orientation |  droplistLayoutAlign"
         [ngClass]="{ 'vertical-orientation' : elementModel.orientation === 'vertical',
                       'horizontal-orientation' : elementModel.orientation === 'horizontal',
                       'clozeContext': clozeContext}"
         [style.min-height.px]="elementModel.position?.useMinHeight ? elementModel.height : undefined"
         [style.color]="elementModel.styling.fontColor"
         [style.font-family]="elementModel.styling.font"
         [style.font-size.px]="elementModel.styling.fontSize"
         [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
         [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
         [style.backgroundColor]="elementModel.styling.backgroundColor"
         [class.errors]="elementFormControl.errors && elementFormControl.touched"
         [style.border-color]="elementModel.highlightReceivingDropListColor"
         [class.highlight-valid-drop]="highlightValidDrop"
         [class.highlight-as-receiver]="highlightAsReceiver"
         tabindex="0"
         (focusout)="elementFormControl.markAsTouched()"
         (drop)="drop($event)" (dragenter)="dragEnterList($event)" (dragleave)="dragLeaveList($event)"
         (dragover)="$event.preventDefault()">
      <ng-container *ngFor="let dropListValueElement of viewModel let index = index;">
        <div *ngIf="!dropListValueElement.imgSrc"
             class="list-item"
             draggable="true"
             (dragstart)="dragStart($event, dropListValueElement, index)" (dragend)="dragEnd($event)"
             (dragenter)="dragEnterItem($event)"
             [class.show-as-placeholder]="showAsPlaceholder && placeHolderIndex === index"
             [class.show-as-hidden]="hidePlaceholder && placeHolderIndex === index"
             [style.pointer-events]="dragging && elementModel.isSortList === false ? 'none' : ''"
             [style.background-color]="elementModel.styling.itemBackgroundColor">
          <span>{{dropListValueElement.text}}</span>
        </div>
        <img *ngIf="dropListValueElement.imgSrc"
             class="list-item"
             [src]="dropListValueElement.imgSrc | safeResourceUrl" alt="Image Placeholder"
             [id]="dropListValueElement.id"
             draggable="true"
             (dragstart)="dragStart($event, dropListValueElement, index)" (dragend)="dragEnd($event)"
             (dragenter)="dragEnterItem($event)"
             [class.show-as-placeholder]="showAsPlaceholder && placeHolderIndex === index"
             [class.show-as-hidden]="hidePlaceholder && placeHolderIndex === index"
             [style.pointer-events]="dragging && elementModel.isSortList === false ? 'none' : ''">
      </ng-container>
    </div>
    <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
               class="error-message">
      {{elementFormControl.errors | errorTransform: elementModel}}
    </mat-error>
  `,
  styles: [
    '.list {width: 100%; height: 100%; background-color: rgb(244, 244, 242); border-radius: 5px;}',
    '.list {padding: 2px;}',
    '.list-item {border-radius: 5px;}',
    ':not(.clozeContext) .list-item {padding: 10px;}',
    '.clozeContext .list-item {padding: 0 5px; text-align: center; line-height: 130%;}',
    'img.list-item {align-self: start; padding: 2px !important;}',
    '.vertical-orientation .list-item:not(:last-child) {margin-bottom: 5px;}',
    '.horizontal-orientation .list-item:not(:last-child) {margin-right: 5px;}',
    '.errors {border: 2px solid #f44336;}',
    '.error-message {font-size: 75%; margin-top: 10px; margin-left: 3px;}',
    '.error-message {position: absolute; bottom: 3px; pointer-events: none;}',
    '.list-item {cursor: grab;}',
    '.list-item:active {cursor: grabbing}',
    '.show-as-placeholder {opacity: 0.5 !important; pointer-events: none;}',
    '.highlight-valid-drop {background-color: lightblue !important;}',
    '.highlight-as-receiver {padding: 0; border: 2px solid;}',
    '.show-as-hidden {visibility: hidden;}'
  ]
})
export class DropListComponent extends FormElementComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() elementModel!: DropListElement;
  @Input() clozeContext: boolean = false;
  @ViewChild('placeholder') placeholder!: ElementRef<HTMLElement>;
  static dragAndDropComponents: { [id: string]: DropListComponent } = {};

  viewModel: DragNDropValueObject[] = [];
  placeHolderIndex?: number;
  highlightAsReceiver = false;

  dragging = false;

  showAsPlaceholder = false;
  hidePlaceholder = false;
  highlightValidDrop = false;

  static draggedElement?: DragNDropValueObject;
  static sourceList?: DropListComponent;

  ngOnInit() {
    super.ngOnInit();
    this.viewModel = [...this.elementFormControl.value];
  }

  ngAfterViewInit() {
    DropListComponent.dragAndDropComponents[this.elementModel.id] = this;
  }

  // TODO method names
  // TODO elemente flackern manchmal beim aufnehmen; iwas stimmt mit highlightAsReceiver nicht
  dragStart(dragEvent: DragEvent,
            dropListValueElement: DragNDropValueObject,
            sourceListIndex: number) {
    if (dragEvent.dataTransfer) {
      dragEvent.dataTransfer.effectAllowed = 'copyMove';
      dragEvent.dataTransfer.setDragImage(
        this.createDragImage(dragEvent.target as HTMLElement, dropListValueElement.id), 0, 0);
    }

    // Timeout is necessary for Chrome, which does not allow DOM manipulation on dragstart
    setTimeout(() => {
      DropListComponent.draggedElement = dropListValueElement;
      DropListComponent.sourceList = this;
      this.placeHolderIndex = sourceListIndex;
      if (this.elementModel.isSortList) {
        this.showAsPlaceholder = true;
      } else {
        this.hidePlaceholder = true;
        this.highlightValidDrop = true;
      }

      /* Let all droplists know when drag is going on, so they can potentially disable their pointer effects.
      *  This is to prevent unwanted dragOver events of list items. */
      Object.entries(DropListComponent.dragAndDropComponents)
        .forEach(([, value]) => {
          value.dragging = true;
        });

      if (this.elementModel.highlightReceivingDropList) {
        this.highlightReceiverLists();
      }
    });
  }

  highlightReceiverLists(): void {
    this.highlightAsReceiver = true;
    this.elementModel.connectedTo.forEach(connectedDropListID => {
      DropListComponent.dragAndDropComponents[connectedDropListID].highlightAsReceiver = true;
    });
  }

  createDragImage(baseElement: HTMLElement, baseID: string): HTMLElement {
    const dragImage: HTMLElement = baseElement.cloneNode(true) as HTMLElement;
    dragImage.id = `${baseID}-dragimage`;
    dragImage.style.display = 'inline-block';
    dragImage.style.maxWidth = `${(baseElement as HTMLElement).offsetWidth}px`;
    dragImage.style.fontSize = `${this.elementModel.styling.fontSize}px`;
    dragImage.style.borderRadius = '5px';
    dragImage.style.padding = '10px';
    document.body.appendChild(dragImage);
    return dragImage;
  }

  dragEnterItem(event: DragEvent) {
    event.preventDefault();
    if (this.elementModel.isSortList && DropListComponent.sourceList === this) {
      this.moveListItem(
        this.placeHolderIndex as number,
        Array.from((event.target as any).parentNode.children).indexOf(event.target)
      );
    }
  }

  moveListItem(sourceIndex: number, targetIndex: number): void {
    const removedElement = this.viewModel.splice(sourceIndex, 1)[0];
    this.viewModel.splice(targetIndex, 0, removedElement);
    this.placeHolderIndex = targetIndex;
  }

  dragEnterList(event: DragEvent) {
    event.preventDefault();

    if (!this.isDropAllowed((DropListComponent.sourceList as DropListComponent).elementModel.connectedTo)) return;

    if (!this.elementModel.isSortList) {
      this.highlightValidDrop = true;
    } else if (DropListComponent.sourceList !== this) {
      this.viewModel.push(DropListComponent.draggedElement as DragNDropValueObject);
      const sourceList = DropListComponent.sourceList as DropListComponent;
      DropListComponent.removeElementFromList(sourceList, sourceList.placeHolderIndex as number);
      sourceList.placeHolderIndex = undefined;
      DropListComponent.sourceList = this;
      this.placeHolderIndex = this.viewModel.length > 0 ? this.viewModel.length - 1 : 0;
    }
  }

  dragLeaveList(event: DragEvent) {
    event.preventDefault();
    this.highlightValidDrop = false;
  }

  drop(event: DragEvent): void {
    event.preventDefault();

    // SortList viewModel already gets manipulated while dragging. Just set the value.
    if (DropListComponent.sourceList === this && this.elementModel.isSortList) {
      this.elementFormControl.setValue(this.viewModel);
      this.dragEnd();
      return;
    }
    // if drop is allowed that means item transfer between non-sort lists
    if (this.isDropAllowed((DropListComponent.sourceList as DropListComponent).elementModel.connectedTo)) {
      if (!this.isIDAlreadyPresent()) {
        if (this.elementModel.onlyOneItem &&
            this.viewModel.length > 0 &&
            this.viewModel[0].returnToOriginOnReplacement) { // move replaced item back to origin
          const originListComponent = DropListComponent.dragAndDropComponents[this.viewModel[0].originListID as string];
          DropListComponent.addElementToList(originListComponent, this.viewModel[0]);
          DropListComponent.removeElementFromList(this, 0);
        }
        if (!DropListComponent.sourceList?.elementModel.copyOnDrop) { // remove source item if not copy
          DropListComponent.removeElementFromList(DropListComponent.sourceList as DropListComponent,
            DropListComponent.sourceList?.placeHolderIndex as number);
        }
        DropListComponent.addElementToList(this, DropListComponent.draggedElement as DragNDropValueObject);
      } else if (this.elementModel.deleteDroppedItemWithSameID) { // put back (return) item
        DropListComponent.removeElementFromList(DropListComponent.sourceList as DropListComponent,
          DropListComponent.sourceList?.placeHolderIndex as number);
      }
    }
    this.dragEnd();
  }

  /* When
  - same list
  - connected list
  - onlyOneItem && itemcount = 0 ||
  onlyOneItem && itemcount = 1 && this.viewModel[0].returnToOriginOnReplacement)  // verdraengen
  - (! id already present) || id already present && deleteDroppedItemWithSameID // zuruecklegen
   */
  isDropAllowed(connectedDropLists: string[]): boolean {
    const sameList = DropListComponent.sourceList === this;
    const isConnectedList = (connectedDropLists as string[]).includes(this.elementModel.id);
    return (sameList) || (isConnectedList &&
                             !this.isOnlyOneItemAndNoReplacingOrReturning() &&
                             !this.isIDPresentAndNoReturning());
  }

  isIDPresentAndNoReturning(): boolean {
    return this.isIDAlreadyPresent() && !(this.elementModel.deleteDroppedItemWithSameID);
  }

  /* No replacement in sort lists: operation should only move the placeholder
     until the actual drop. By allowing elements to transfer while dragging we create
     all kinds of problems and unwanted behaviour, like having all touched lists generate change events.
   */
  isOnlyOneItemAndNoReplacingOrReturning(): boolean {
    return this.elementModel.onlyOneItem && this.viewModel.length > 0 &&
      !((this.viewModel[0].returnToOriginOnReplacement && !this.elementModel.isSortList) ||
       (this.elementModel.deleteDroppedItemWithSameID &&
         DropListComponent.draggedElement?.id === this.viewModel[0].id));
  }

  isIDAlreadyPresent(): boolean {
    const listValueIDs = this.elementFormControl.value.map((valueValue: DragNDropValueObject) => valueValue.id);
    return listValueIDs.includes(DropListComponent.draggedElement?.id);
  }

  static addElementToList(listComponent: DropListComponent, element: DragNDropValueObject, targetIndex?: number): void {
    if (targetIndex) {
      listComponent.viewModel.splice(
        Math.min(listComponent.viewModel.length, element.originListIndex || 0),
        0,
        element
      );
    } else {
      listComponent.viewModel.push(element);
    }
    listComponent.elementFormControl.setValue(listComponent.viewModel);
  }

  static removeElementFromList(listComponent: DropListComponent, index: number): void {
    listComponent.viewModel.splice(index, 1);
    listComponent.elementFormControl.setValue(listComponent.viewModel);
  }

  dragEnd(event?: DragEvent): void {
    event?.preventDefault();

    Object.entries(DropListComponent.dragAndDropComponents)
      .forEach(([, value]) => {
        value.highlightAsReceiver = false;
        value.dragging = false;
        value.highlightValidDrop = false;
      });
    if (DropListComponent.sourceList) DropListComponent.sourceList.placeHolderIndex = undefined;
    this.placeHolderIndex = undefined;

    document.getElementById(`${DropListComponent.draggedElement?.id}-dragimage`)?.remove();
  }

  ngOnDestroy(): void {
    delete DropListComponent.dragAndDropComponents[this.elementModel.id];
  }
}

@Pipe({
  name: 'droplistLayout'
})
export class DropListLayoutPipe implements PipeTransform {
  transform(orientation: string): string {
    switch (orientation) {
      case 'horizontal':
        return 'row';
      case 'vertical':
        return 'column';
      case 'flex':
        return 'row wrap';
      default:
        throw Error(`droplist orientation invalid: ${orientation}`);
    }
  }
}

@Pipe({
  name: 'droplistLayoutAlign'
})
export class DropListLayoutAlignPipe implements PipeTransform {
  transform(orientation: string): string {
    switch (orientation) {
      case 'horizontal':
      case 'vertical':
        return 'start stretch';
      case 'flex':
        return 'space-around center';
      default:
        throw Error(`droplist orientation invalid: ${orientation}`);
    }
  }
}
