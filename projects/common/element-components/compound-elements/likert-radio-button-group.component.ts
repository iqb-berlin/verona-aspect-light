import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormElementComponent } from '../../form-element-component.directive';
import { LikertElementRow } from '../../models/compound-elements/likert-element-row';

@Component({
  selector: 'app-likert-radio-button-group',
  template: `
    <mat-radio-group [style.display]="'grid'"
                     [style.grid-template-columns]="'2fr ' + '1fr '.repeat(elementModel.columnCount)"
                     [formControl]="elementFormControl">
      <div [style.grid-column-start]="1"
           [style.grid-column-end]="2"
           [style.grid-row-start]="1"
           [style.grid-row-end]="2">
        {{elementModel.text}}
        {{elementModel.id}}
      </div>

      <mat-radio-button *ngFor="let answer of [].constructor(elementModel.columnCount); let j = index"
                        [value]="j"
                        [style.grid-column-start]="2 + j"
                        [style.grid-column-end]="3 + j"
                        [style.grid-row-start]="1"
                        [style.grid-row-end]="2">
      </mat-radio-button>
    </mat-radio-group>
  `
})
export class LikertRadioButtonGroupComponent extends FormElementComponent {
  @Input() elementModel!: LikertElementRow;
  @Input() parentForm!: FormGroup;
}
