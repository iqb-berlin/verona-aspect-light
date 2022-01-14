import {
  Component, EventEmitter, Input, Output, QueryList, ViewChildren
} from '@angular/core';
import { ClozeElement } from './cloze-element';
import { CompoundElementComponent } from '../../directives/compound-element.directive';
import { ClozeDocumentParagraph, ClozeDocumentPart, InputElement } from '../../models/uI-element';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'app-cloze',
  template: `
    <ng-container *ngIf="elementModel.document.content.length == 0">
      Kein Dokument vorhanden
    </ng-container>
    <div [class.center-content]="elementModel.positionProps.dynamicPositioning &&
                                 elementModel.positionProps.fixedSize"
         [style.width]="elementModel.positionProps.fixedSize ? elementModel.width + 'px' : '100%'"
         [style.height]="elementModel.positionProps.fixedSize ? elementModel.height + 'px' : 'auto'">
      <ng-container *ngFor="let part of elementModel.document.content">
        <ul *ngIf="part.type === 'bulletList'">
          <li *ngFor="let listItem of part.content">
            <ng-container *ngFor="let listItemPart of $any(listItem).content"
                          [ngTemplateOutlet]="paragraphs"
                          [ngTemplateOutletContext]="{ $implicit: listItemPart }"></ng-container>
          </li>
        </ul>
        <ol *ngIf="part.type === 'orderedList'">
          <li *ngFor="let listItem of part.content">
            <ng-container *ngFor="let listItemPart of $any(listItem).content"
                          [ngTemplateOutlet]="paragraphs"
                          [ngTemplateOutletContext]="{ $implicit: listItemPart }"></ng-container>
          </li>
        </ol>
        <ng-container *ngIf="part.type !== 'bulletList'"
                      [ngTemplateOutlet]="paragraphs"
                      [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </ng-container>
    </div>

    <ng-template #paragraphs let-part>
      <p *ngIf="part.type === 'paragraph'"
         [style.line-height.%]="elementModel.fontProps.lineHeight"
         [style.color]="elementModel.fontProps.fontColor"
         [style.font-family]="elementModel.fontProps.font"
         [style.font-size.px]="elementModel.fontProps.fontSize"
         [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
         [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''"
         [style.margin-bottom]="part.attrs.margin + 'px'"
         [style.margin-left]="part.attrs.hangingIndent ? '' :
               ($any(part.attrs.indentSize) * $any(part.attrs.indent)) + 'px'"
         [style.text-align]="part.attrs.textAlign"
         [style.text-indent]="part.attrs.hangingIndent ?
               ($any(part.attrs.indentSize) * $any(part.attrs.indent)) + 'px' :
               ''">
        <ng-container [ngTemplateOutlet]="paragraphChildren"
                      [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </p>
      <h1 *ngIf="part.type === 'heading' && part.attrs.level === 1"
          [style.display]="'inline'"
          [style.line-height.%]="elementModel.fontProps.lineHeight"
          [style.color]="elementModel.fontProps.fontColor"
          [style.font-family]="elementModel.fontProps.font"
          [style.font-size.px]="elementModel.fontProps.fontSize"
          [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
          [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
          [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''">
        <ng-container [ngTemplateOutlet]="paragraphChildren"
                      [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </h1>
      <h2 *ngIf="part.type === 'heading' && part.attrs.level === 2"
          [style.display]="'inline'"
          [style.line-height.%]="elementModel.fontProps.lineHeight"
          [style.color]="elementModel.fontProps.fontColor"
          [style.font-family]="elementModel.fontProps.font"
          [style.font-size.px]="elementModel.fontProps.fontSize"
          [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
          [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
          [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''">
        <ng-container [ngTemplateOutlet]="paragraphChildren"
                      [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </h2>
      <h3 *ngIf="part.type === 'heading' && part.attrs.level === 3"
          [style.display]="'inline'"
          [style.line-height.%]="elementModel.fontProps.lineHeight"
          [style.color]="elementModel.fontProps.fontColor"
          [style.font-family]="elementModel.fontProps.font"
          [style.font-size.px]="elementModel.fontProps.fontSize"
          [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
          [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
          [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''">
        <ng-container [ngTemplateOutlet]="paragraphChildren"
                      [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </h3>
      <h4 *ngIf="part.type === 'heading' && part.attrs.level === 4"
          [style.display]="'inline'"
          [style.line-height.%]="elementModel.fontProps.lineHeight"
          [style.color]="elementModel.fontProps.fontColor"
          [style.font-family]="elementModel.fontProps.font"
          [style.font-size.px]="elementModel.fontProps.fontSize"
          [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
          [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
          [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''">
        <ng-container [ngTemplateOutlet]="paragraphChildren"
                      [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </h4>
      <h5 *ngIf="part.type === 'heading' && part.attrs.level === 5"
          [style.display]="'inline'"
          [style.line-height.%]="elementModel.fontProps.lineHeight"
          [style.color]="elementModel.fontProps.fontColor"
          [style.font-family]="elementModel.fontProps.font"
          [style.font-size.px]="elementModel.fontProps.fontSize"
          [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
          [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
          [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''">
        <ng-container [ngTemplateOutlet]="paragraphChildren"
                      [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </h5>
      <h6 *ngIf="part.type === 'heading' && part.attrs.level === 6"
          [style.display]="'inline'"
          [style.line-height.%]="elementModel.fontProps.lineHeight"
          [style.color]="elementModel.fontProps.fontColor"
          [style.font-family]="elementModel.fontProps.font"
          [style.font-size.px]="elementModel.fontProps.fontSize"
          [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
          [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
          [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''">
        <ng-container [ngTemplateOutlet]="paragraphChildren"
                      [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </h6>
    </ng-template>

    <ng-template #paragraphChildren let-part>
      <ng-container *ngFor="let subPart of part.content">
        <ng-container *ngIf="$any(subPart).type === 'text'">
          <span [ngStyle]="subPart.marks | styleMarks">
            {{subPart.text}}
          </span>
        </ng-container>
        <ng-container *ngIf="$any(subPart).type === 'image'">
          <img [src]="subPart.attrs.src" [alt]="subPart.attrs.alt"
               [style.display]="'inline-block'"
               [style.height]="'1em'"
               [style.vertical-align]="'middle'">
        </ng-container>
        <span *ngIf="['ToggleButton', 'DropList', 'TextField'].includes(subPart.type)"
              (click)="selectElement($any(subPart.attrs).model, $event)">
                <app-toggle-button *ngIf="subPart.type === 'ToggleButton'" #radioComponent
                                   [parentForm]="parentForm"
                                   [style.display]="'inline-block'"
                                   [style.vertical-align]="'middle'"
                                   [style.pointerEvents]="allowClickThrough ? 'auto' : 'none'"
                                   [elementModel]="$any(subPart.attrs).model"
                                   (elementValueChanged)="elementValueChanged.emit($event)">
                </app-toggle-button>
                <app-text-field-simple *ngIf="subPart.type === 'TextField'" #textfieldComponent
                                       [parentForm]="parentForm"
                                       [style.display]="'inline-block'"
                                       [style.pointerEvents]="allowClickThrough ? 'auto' : 'none'"
                                       [elementModel]="$any(subPart.attrs).model"
                                       (elementValueChanged)="elementValueChanged.emit($event)">
                </app-text-field-simple>
                <app-drop-list-simple *ngIf="subPart.type === 'DropList'" #droplistComponent
                                      [parentForm]="parentForm"
                                      [style.display]="'inline-block'"
                                      [style.vertical-align]="'middle'"
                                      [style.pointerEvents]="allowClickThrough ? 'auto' : 'none'"
                                      [elementModel]="$any(subPart.attrs).model"
                                      (elementValueChanged)="elementValueChanged.emit($event)">
                </app-drop-list-simple>
            </span>
      </ng-container>
    </ng-template>
  `,
  styles: [
    ':host ::ng-deep app-text-field {vertical-align: middle}',
    ':host ::ng-deep app-text-field .mat-form-field-wrapper {height: 100%; padding-bottom: 0; margin: 0}',
    ':host ::ng-deep app-text-field .mat-form-field {height: 100%}',
    ':host ::ng-deep app-text-field .mat-form-field-flex {height: 100%}',
    'p {margin: 0}',
    ':host ::ng-deep p strong {letter-spacing: 0.04em; font-weight: 600;}', // bold less bold
    ':host ::ng-deep p:empty::after {content: "\\00A0"}', // render empty p
    'p span {font-size: inherit}'
  ]
})
export class ClozeComponent extends CompoundElementComponent {
  @Input() elementModel!: ClozeElement;
  @Output() elementSelected = new EventEmitter<{ element: ClozeElement, event: MouseEvent }>();
  @ViewChildren('drowdownComponent, textfieldComponent, droplistComponent, radioComponent')
  compoundChildren!: QueryList<FormElementComponent>;

  getFormElementModelChildren(): InputElement[] {
    return this.elementModel.document.content
      .filter((paragraph: ClozeDocumentParagraph) => paragraph.content) // filter empty paragraphs
      .map((paragraph: ClozeDocumentParagraph) => paragraph.content // get custom paragraph parts
        .filter((word: ClozeDocumentPart) => ['TextField', 'DropList', 'ToggleButton'].includes(word.type)))
      .reduce((accumulator: any[], currentValue: any) => accumulator // put all collected paragraph parts into one list
        .concat(currentValue.map((node: ClozeDocumentPart) => node.attrs?.model)), []); // model is in node.attrs.model
  }

  selectElement(element: ClozeElement, event: MouseEvent): void {
    this.elementSelected.emit({ element: element, event: event });
  }
}
