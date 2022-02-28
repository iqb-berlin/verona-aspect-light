import { Component, Input } from '@angular/core';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { CheckboxElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-checkbox',
  template: `
    <div class="mat-form-field"
         [style.width.%]="100"
         [style.height.%]="100"
         [style.background-color]="elementModel.styles.backgroundColor">
      <mat-checkbox #checkbox class="example-margin"
                    [formControl]="elementFormControl"
                    [checked]="$any(elementModel.value)"
                    [style.color]="elementModel.styles.fontColor"
                    [style.font-family]="elementModel.styles.font"
                    [style.font-size.px]="elementModel.styles.fontSize"
                    [style.font-weight]="elementModel.styles.bold ? 'bold' : ''"
                    [style.font-style]="elementModel.styles.italic ? 'italic' : ''"
                    [style.text-decoration]="elementModel.styles.underline ? 'underline' : ''"
                    (click)="elementModel.readOnly ? $event.preventDefault() : null">
        <div [innerHTML]="elementModel.label"></div>
      </mat-checkbox>
      <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
                 class="error-message">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </div>
  `,
  styles: [
    ':host ::ng-deep .mat-checkbox-layout {white-space: normal !important}',
    '.error-message { position: absolute; display: block; margin-top: 5px; font-size: 75% }'
  ]
})
export class CheckboxComponent extends FormElementComponent {
  @Input() elementModel!: CheckboxElement;
}
