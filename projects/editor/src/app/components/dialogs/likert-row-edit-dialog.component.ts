import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LikertRowElement } from '../../../../../common/interfaces/elements';
import { LikertColumn } from '../../../../../common/interfaces/likert';

@Component({
  selector: 'aspect-likert-row-edit-dialog',
  template: `
    <mat-dialog-content fxLayout="column">
      <mat-form-field>
        <mat-label>{{'text' | translate }}</mat-label>
        <input #textField matInput type="text" [value]="data.row.text">
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{'id' | translate }}</mat-label>
        <input #idField matInput type="text" [value]="data.row.id">
      </mat-form-field>
      {{'preset' | translate }}
      <mat-select #valueField [value]="data.row.value">
        <mat-option [value]="null">{{'propertiesPanel.undefined' | translate }}</mat-option>
        <mat-option *ngFor="let column of data.columns; let i = index" [value]="i + 1">
          {{column.text}} (Index: {{i + 1}})
        </mat-option>
      </mat-select>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button
              [mat-dialog-close]="{ text: textField.value, id: idField.value, value: valueField.value }">
        {{'save' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `
})
export class LikertRowEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { row: LikertRowElement, columns: LikertColumn[] }) { }
}
