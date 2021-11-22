import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { FormElementComponent } from '../form-element-component.directive';
import { TextFieldElement } from '../models/text-field-element';

@Component({
  selector: 'app-text-field',
  template: `
    <mat-form-field *ngIf="elementModel.label !== ''"
                    [style.width.%]="100"
                    [style.height.%]="100"
                    [style.color]="elementModel.fontColor"
                    [style.font-family]="elementModel.font"
                    [style.font-size.px]="elementModel.fontSize"
                    [style.font-weight]="elementModel.bold ? 'bold' : ''"
                    [style.font-style]="elementModel.italic ? 'italic' : ''"
                    [style.text-decoration]="elementModel.underline ? 'underline' : ''"
                    appInputBackgroundColor [backgroundColor]="elementModel.backgroundColor"
                    [appearance]="$any(elementModel.appearance)">
      <mat-label>{{elementModel.label}}</mat-label>
      <input matInput type="text" #input autocomplete="off"
             [formControl]="elementFormControl"
             [value]="elementModel.value"
             [pattern]="elementModel.pattern"
             [readonly]="elementModel.readOnly"
             (focus)="elementModel.inputAssistancePreset !== 'none' ? onFocusChanged.emit(input) : null"
             (blur)="elementModel.inputAssistancePreset !== 'none' ? onFocusChanged.emit(null): null">
      <button *ngIf="elementModel.clearable"
              type="button"
              matSuffix mat-icon-button aria-label="Clear"
              (click)="this.elementFormControl.setValue('')">
        <mat-icon>close</mat-icon>
      </button>
      <mat-error *ngIf="elementFormControl.errors">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </mat-form-field>
    <mat-form-field *ngIf="elementModel.label === ''" class="small-input"
                    [style.width.%]="100"
                    [style.height.%]="100"
                    [style.color]="elementModel.fontColor"
                    [style.font-family]="elementModel.font"
                    [style.font-size.px]="elementModel.fontSize"
                    [style.font-weight]="elementModel.bold ? 'bold' : ''"
                    [style.font-style]="elementModel.italic ? 'italic' : ''"
                    [style.text-decoration]="elementModel.underline ? 'underline' : ''"
                    appInputBackgroundColor [backgroundColor]="elementModel.backgroundColor"
                    [appearance]="$any(elementModel.appearance)">
      <input matInput type="text" #input autocomplete="off"
             [formControl]="elementFormControl"
             [value]="elementModel.value"
             [readonly]="elementModel.readOnly"
             [pattern]="elementModel.pattern"
             (focus)="elementModel.inputAssistancePreset !== 'none' ? onFocusChanged.emit(input) : null"
             (blur)="elementModel.inputAssistancePreset !== 'none' ? onFocusChanged.emit(null): null">
      <button *ngIf="elementModel.clearable"
              type="button"
              matSuffix mat-icon-button aria-label="Clear"
              (click)="this.elementFormControl.setValue('')">
        <mat-icon>close</mat-icon>
      </button>
      <mat-error *ngIf="elementFormControl.errors">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </mat-form-field>
  `,
  styles: [
    '::ng-deep app-text-field .small-input div.mat-form-field-infix {border-top: none; padding: 0.75em 0 0.25em 0;}'
  ]
})
export class TextFieldComponent extends FormElementComponent {
  @Input() elementModel!: TextFieldElement;
  @Output() onFocusChanged = new EventEmitter<HTMLElement | null>();

  get validators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (this.elementModel.required) {
      validators.push(Validators.required);
    }
    if (this.elementModel.minLength) {
      validators.push(Validators.minLength(<number> this.elementModel.minLength));
    }
    if (this.elementModel.maxLength) {
      validators.push(Validators.maxLength(<number> this.elementModel.maxLength));
    }
    if (this.elementModel.pattern) {
      validators.push(Validators.pattern(<string> this.elementModel.pattern));
    }
    return validators;
  }
}
