import { Component, Input } from '@angular/core';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { DimensionProperties, PositionProperties } from 'common/models/elements/property-group-interfaces';

@Component({
  selector: 'aspect-dimension-field-set',
  template: `
    <fieldset>
      <legend>Dimensionen</legend>
      <mat-checkbox *ngIf="dimensions.dynamicWidth !== undefined"
                    [checked]="$any(dimensions.dynamicWidth)"
                    (change)="updateDimensionProperty('dynamicWidth', $event.checked)">
        {{'propertiesPanel.dynamicWidth' | translate }}
      </mat-checkbox>

      <ng-container *ngIf="!positionProperties?.dynamicPositioning">
        <mat-form-field appearance="fill">
          <mat-label>{{'propertiesPanel.width' | translate }}</mat-label>
          <input matInput type="number" min="0"
                 [ngModel]="dimensions.width"
                 (ngModelChange)="updateDimensionProperty('width', $event)">
        </mat-form-field>
        <mat-form-field>
          <mat-label>
            {{'propertiesPanel.height' | translate }}
          </mat-label>
          <input matInput type="number" min="0"
                 [ngModel]="dimensions.height"
                 (ngModelChange)="updateDimensionProperty('height', $event)">
        </mat-form-field>
      </ng-container>

      <ng-container *ngIf="positionProperties?.dynamicPositioning">
        <mat-checkbox #fixedWidth [checked]="$any(dimensions.isWidthFixed)"
                      (change)="updateDimensionProperty('isWidthFixed', $event.checked)">
          {{'propertiesPanel.isWidthFixed' | translate }}
        </mat-checkbox>
        <mat-form-field appearance="fill">
          <mat-label>{{'propertiesPanel.width' | translate }}</mat-label>
          <input matInput type="number" min="0"
                 [disabled]="!fixedWidth.checked"
                 [ngModel]="dimensions.width"
                 (ngModelChange)="updateDimensionProperty('width', $event)">
        </mat-form-field>

        <mat-checkbox #fixedHeight [checked]="$any(dimensions.isHeightFixed)"
                      (change)="updateDimensionProperty('isHeightFixed', $event.checked)">
          {{'propertiesPanel.isHeightFixed' | translate }}
        </mat-checkbox>
        <mat-form-field>
          <mat-label>
            {{'propertiesPanel.height' | translate }}
          </mat-label>
          <input matInput type="number" min="0"
                 [disabled]="!fixedHeight.checked"
                 [ngModel]="dimensions.height"
                 (ngModelChange)="updateDimensionProperty('height', $event)">
        </mat-form-field>

        <mat-checkbox #minWidthEnabled [checked]="dimensions.minWidth !== null"
                      (change)="toggleProperty('minWidth', $event.checked)">
          {{'propertiesPanel.minWidthEnabled' | translate }}
        </mat-checkbox>
        <mat-form-field>
          <mat-label>
            {{'propertiesPanel.minWidth' | translate }}
          </mat-label>
          <input matInput type="number" min="0"
                 [disabled]="!minWidthEnabled.checked"
                 [ngModel]="dimensions.minWidth"
                 (ngModelChange)="updateDimensionProperty('minWidth', $event)">
        </mat-form-field>

        <mat-checkbox #maxWidthEnabled [checked]="dimensions.maxWidth !== null"
                      (change)="toggleProperty('maxWidth', $event.checked)">
          {{'propertiesPanel.maxWidthEnabled' | translate }}
        </mat-checkbox>
        <mat-form-field>
          <mat-label>
            {{'propertiesPanel.maxWidth' | translate }}
          </mat-label>
          <input matInput type="number" min="0"
                 [disabled]="!maxWidthEnabled.checked"
                 [ngModel]="dimensions.maxWidth"
                 (ngModelChange)="updateDimensionProperty('maxWidth', $event)">
        </mat-form-field>

        <mat-checkbox #minHeightEnabled [checked]="dimensions.minHeight !== null"
                      (change)="toggleProperty('minHeight', $event.checked)">
          {{'propertiesPanel.minHeightEnabled' | translate }}
        </mat-checkbox>
        <mat-form-field>
          <mat-label>
            {{'propertiesPanel.minHeight' | translate }}
          </mat-label>
          <input matInput type="number" min="0"
                 [disabled]="!minHeightEnabled.checked"
                 [ngModel]="dimensions.minHeight"
                 (ngModelChange)="updateDimensionProperty('minHeight', $event)">
        </mat-form-field>

        <mat-checkbox #maxHeightEnabled [checked]="dimensions.maxHeight !== null"
                      (change)="toggleProperty('maxHeight', $event.checked)">
          {{'propertiesPanel.maxHeightEnabled' | translate }}
        </mat-checkbox>
        <mat-form-field>
          <mat-label>
            {{'propertiesPanel.maxHeight' | translate }}
          </mat-label>
          <input matInput type="number" min="0"
                 [disabled]="!maxHeightEnabled.checked"
                 [ngModel]="dimensions.maxHeight"
                 (ngModelChange)="updateDimensionProperty('maxHeight', $event)">
        </mat-form-field>
      </ng-container>
    </fieldset>
  `
})

export class DimensionFieldSetComponent {
  @Input() positionProperties: PositionProperties | undefined;
  @Input() dimensions!: DimensionProperties;

  constructor(public unitService: UnitService, public selectionService: SelectionService) { }

  updateDimensionProperty(property: string, value: any): void {
    this.unitService.updateElementsDimensionsProperty(this.selectionService.getSelectedElements(), property, value);
  }

  toggleProperty(property: string, checked:boolean): void {
    if (!checked) {
      this.unitService.updateElementsDimensionsProperty(this.selectionService.getSelectedElements(), property, null);
    }
  }
}
