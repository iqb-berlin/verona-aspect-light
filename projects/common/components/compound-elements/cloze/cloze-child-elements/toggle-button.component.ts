import { Component, Input } from '@angular/core';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import { ToggleButtonElement } from 'common/models/elements/compound-elements/cloze/cloze-child-elements/toggle-button';

@Component({
  selector: 'aspect-toggle-button',
  template: `
    <mat-button-toggle-group [class.errors]="elementFormControl.errors && elementFormControl.touched"
                             [formControl]="elementFormControl"
                             [isDisabled]="elementModel.readOnly"
                             [value]="elementModel.value"
                             [vertical]="elementModel.verticalOrientation"
                             [style.width]="elementModel.dynamicWidth ? 'unset' : '100%'"
                             [matTooltip]="elementFormControl.errors && elementFormControl.touched ?
                                           (elementFormControl.errors | errorTransform: elementModel) : ''"
                             (focusout)="elementFormControl.markAsTouched()">
      <mat-button-toggle *ngFor="let option of elementModel.options; let i = index"
                         [value]="i"
                         [ngClass]="{ 'strike-other-options' : elementModel.strikeOtherOptions,
                                      'strike-selected-option' : elementModel.strikeSelectedOption }"
                         [style.color]="elementModel.styling.fontColor"
                         [style.font-size.px]="elementModel.styling.fontSize"
                         [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
                         [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
                         [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
                         [style.font-family]="elementModel.styling.font"
                         [style.background-color]="elementFormControl.value !== null &&
                                                 elementFormControl.value === i ?
                                                 elementModel.styling.selectionColor :
                                                 elementModel.styling.backgroundColor"
                         [style.line-height.%]="elementModel.styling.lineHeight">
        <div [innerHTML]="option.text | safeResourceHTML"></div>
      </mat-button-toggle>
    </mat-button-toggle-group>
  `,
  styles: [
    '.errors {border: 2px solid #f44336 !important;}',
    '::ng-deep .mat-tooltip {border: 1px solid #f44336; margin-top: 8px !important;}',
    '::ng-deep .mat-tooltip {background-color: white; color: #f44336 !important;}',
    'mat-button-toggle-group {display: inline-flex; min-width: 70px; min-height: 20px; max-width: 100%;}',
    'mat-button-toggle-group {justify-content: center;}',
    ':host ::ng-deep .mat-button-toggle-label-content {line-height: unset}',
    ':host ::ng-deep .strike-selected-option.mat-button-toggle-checked .mat-button-toggle-label-content' +
    '{text-decoration: line-through}',
    ':host ::ng-deep .strike-other-options:not(.mat-button-toggle-checked) .mat-button-toggle-label-content' +
    '{text-decoration: line-through}'
  ]
})
export class ToggleButtonComponent extends FormElementComponent {
  @Input() elementModel!: ToggleButtonElement;
}
