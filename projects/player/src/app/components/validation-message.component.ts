import { Component, OnInit } from '@angular/core';
import {
  FormControl, FormGroup, ValidatorFn, Validators
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  InputUIElement, NumberFieldElement, TextFieldElement, UnitUIElement
} from '../../../../common/unit';
import { FormService } from '../../../../common/form.service';

@Component({
  selector: 'app-error-message',
  template: `
      <ng-container *ngIf="formElementControl && formElementControl.touched">
          <mat-error *ngIf="formElementControl.errors?.required">
              {{requiredMessage}}
          </mat-error>
          <mat-error *ngIf="formElementControl.errors?.requiredTrue">
              {{requiredMessage}}
          </mat-error>
          <mat-error *ngIf="formElementControl.errors?.minlength">
              {{minLengthMessage}}
          </mat-error>
          <mat-error *ngIf="formElementControl.errors?.maxlength">
              {{maxLengthMessage}}
          </mat-error>
          <mat-error *ngIf="formElementControl.errors?.min">
              {{minMessage}}
          </mat-error>
          <mat-error *ngIf="formElementControl.errors?.max">
              {{maxMessage}}
          </mat-error>
      </ng-container>
  `
})

export class ValidationMessageComponent implements OnInit {
  elementModel!: UnitUIElement;
  parentForm!: FormGroup;
  formElementControl!: FormControl;

  constructor(private formService: FormService, private translateService: TranslateService) {}

  ngOnInit(): void {
    this.formElementControl = this.parentForm.controls[this.elementModel.id] as FormControl;
    this.formService.setValidators({
      id: this.elementModel.id,
      validators: this.validators,
      formGroup: this.parentForm
    });
  }

  private get validators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (this.elementModel.required) {
      if (this.elementModel.type === 'checkbox') {
        validators.push(Validators.requiredTrue);
      } else {
        validators.push(Validators.required);
      }
    }
    if (this.elementModel.min) {
      if (this.elementModel.type === 'number-field') {
        validators.push(Validators.min(<number> this.elementModel.min));
      } else {
        validators.push(Validators.minLength(<number> this.elementModel.min));
      }
    }
    if (this.elementModel.max) {
      if (this.elementModel.type === 'number-field') {
        validators.push(Validators.max(<number> this.elementModel.max));
      } else {
        validators.push(Validators.maxLength(<number> this.elementModel.max));
      }
    }
    return validators;
  }

  get requiredMessage(): string {
    return (this.elementModel as InputUIElement).requiredWarnMessage ||
      this.translateService.instant('validators.inputRequired');
  }

  get minLengthMessage(): string {
    return (this.elementModel as TextFieldElement).minWarnMessage ||
      this.translateService.instant('validators.inputTooShort');
  }

  get maxLengthMessage(): string {
    return (this.elementModel as TextFieldElement).maxWarnMessage ||
      this.translateService.instant('validators.inputTooLong');
  }

  get minMessage(): string {
    return (this.elementModel as NumberFieldElement).minWarnMessage ||
      this.translateService.instant('validators.valueTooSmall');
  }

  get maxMessage(): string {
    return (this.elementModel as NumberFieldElement).maxWarnMessage ||
      this.translateService.instant('validators.valueTooBig');
  }
}
