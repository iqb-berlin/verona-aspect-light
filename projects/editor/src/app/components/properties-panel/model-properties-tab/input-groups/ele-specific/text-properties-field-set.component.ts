import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SharedModule } from 'common/shared.module';
import { TextElement } from 'common/models/elements/text/text';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import {
  HighlightPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-groups/highlight-properties.component';
import { SelectionService } from '../../../../../services/selection.service';
import { DialogService } from '../../../../../services/dialog.service';

@Component({
  selector: 'aspect-text-props',
  standalone: true,
  imports: [
    NgIf,
    SharedModule,
    MatInputModule,
    MatCheckboxModule,
    MatOptionModule,
    MatSelectModule,
    HighlightPropertiesComponent
  ],
  template: `
    <div *ngIf="combinedProperties.text !== undefined" class="fx-column-start-stretch">
      Text
      <div class="text-text"
           [innerHTML]="combinedProperties.text | safeResourceHTML">
      </div>
      <button mat-fab color="primary" [style.align-self]="'center'" [style.margin-bottom.px]="20"
              [matTooltip]="'Text bearbeiten'"
              (click)="showTextEditDialog()">
        <mat-icon>edit</mat-icon>
      </button>
      <mat-form-field *ngIf="combinedProperties.columnCount != null"
                      appearance="fill" class="mdInput textsingleline">
        <mat-label>{{ 'propertiesPanel.columnCount' | translate }}</mat-label>
        <input matInput type="number" [value]="$any(combinedProperties.columnCount)"
               (input)="updateModel.emit({ property: 'columnCount', value: $any($event.target).value })"
               (change)="combinedProperties.columnCount = combinedProperties.columnCount ?
                                                            combinedProperties.columnCount : 0">
      </mat-form-field>

      <fieldset class="fx-column-start-stretch">
        <legend>{{ 'propertiesPanel.marking' | translate }}</legend>

        <aspect-highlight-properties [combinedProperties]="combinedProperties"
                                     (updateModel)="updateModel.emit($event)">
        </aspect-highlight-properties>

        <mat-form-field *ngIf="combinedProperties.markingBars !== undefined"
                        [style.margin-top.px]="5"
                        appearance="fill">
          <mat-label>{{ 'propertiesPanel.markingBars' | translate }}</mat-label>
          <mat-select multiple
                      [disabled]="markingBarIds.length === 0 &&
                                  !combinedProperties.highlightableYellow &&
                                  !combinedProperties.highlightableTurquoise &&
                                  !combinedProperties.highlightableOrange"
                      [ngModel]="combinedProperties.markingBars"
                      (ngModelChange)="toggleConnectedMarkingBars($event)">
            <mat-select-trigger>
              {{ 'propertiesPanel.markingBars' | translate }} ({{ $any(combinedProperties.markingBars).length }})
            </mat-select-trigger>
            <mat-option *ngFor="let id of markingBarIds" [value]="id">
              {{ id }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field *ngIf="combinedProperties.markingMode !== undefined"
                        [style.margin-top.px]="5"
                        appearance="fill">
          <mat-label>{{ 'propertiesPanel.markingMode' | translate }}</mat-label>
          <mat-select [value]="combinedProperties.markingMode"
                      [disabled]="combinedProperties.markingBars!.length === 0 &&
                                  (!combinedProperties.highlightableYellow &&
                                  !combinedProperties.highlightableTurquoise &&
                                  !combinedProperties.highlightableOrange)"
                      (selectionChange)="updateModel.emit({ property: 'markingMode', value: $event.value })">
            <mat-option *ngFor="let option of ['selection', 'word', 'range']"
                        [value]="option">
              {{ 'propertiesPanel.markingMode-' + option | translate }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-checkbox *ngIf="unitService.expertMode && combinedProperties.hasSelectionPopup !== undefined"
                      [disabled]="combinedProperties.markingMode !== 'selection' &&
                                  (combinedProperties.markingBars!.length === 0 ||
                                  (!combinedProperties.highlightableYellow &&
                                  !combinedProperties.highlightableTurquoise &&
                                  !combinedProperties.highlightableOrange))"
                      [checked]="$any(combinedProperties.hasSelectionPopup)"
                      (change)="updateModel.emit({ property: 'hasSelectionPopup', value: $event.checked })">
          {{ 'propertiesPanel.hasSelectionPopup' | translate }}
        </mat-checkbox>
      </fieldset>
    </div>
  `,
  styles: [`
    .text-text {
      margin-bottom: 10px;
      padding: 10px;
      max-height: 200px;
      overflow: scroll;
    }
  `]
})
export class TextPropsComponent {
  markingBarIds: string[];
  @Input() combinedProperties!: any;
  @Output() updateModel =
    new EventEmitter<{
      property: string;
      value: string | number | boolean | string[],
      isInputValid?: boolean | null
    }>();

  constructor(public unitService: UnitService,
              public dialogService: DialogService,
              public selectionService: SelectionService) {
    this.markingBarIds = this.unitService.unit.getAllElements('remote-control').map(element => element.id);
  }

  showTextEditDialog(): void {
    const selectedElement = this.selectionService.getSelectedElements()[0];
    this.dialogService.showRichTextEditDialog(
      (selectedElement as TextElement).text,
      (selectedElement as TextElement).styling.fontSize
    ).subscribe((result: string) => {
      if (result) {
        this.updateModel.emit({ property: 'text', value: result });
      }
    });
  }

  toggleConnectedMarkingBars(markingBars: string[]) {
    this.updateModel.emit({
      property: 'markingBars',
      value: [...markingBars]
    });
  }
}
