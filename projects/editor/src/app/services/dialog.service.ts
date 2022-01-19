import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { LikertElementRow } from '../../../../common/ui-elements/likert/likert-element-row';
import { ConfirmationDialogComponent } from '../components/dialogs/confirmation-dialog.component';
import { TextEditDialogComponent } from '../components/dialogs/text-edit-dialog.component';
import { TextEditMultilineDialogComponent } from '../components/dialogs/text-edit-multiline-dialog.component';
import { RichTextEditDialogComponent } from '../components/dialogs/rich-text-edit-dialog.component';
import { PlayerEditDialogComponent } from '../components/dialogs/player-edit-dialog.component';
import { LikertColumnEditDialogComponent } from '../components/dialogs/likert-column-edit-dialog.component';
import { LikertRowEditDialogComponent } from '../components/dialogs/likert-row-edit-dialog.component';
import {
  ClozeDocument,
  DragNDropValueObject, LikertColumn, PlayerProperties
} from '../../../../common/models/uI-element';
import { DropListOptionEditDialogComponent } from '../components/dialogs/drop-list-option-edit-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) { }

  showConfirmDialog(text: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { text }
    });
    return dialogRef.afterClosed();
  }

  showTextEditDialog(text: string): Observable<string> {
    const dialogRef = this.dialog.open(TextEditDialogComponent, {
      data: { text }
    });
    return dialogRef.afterClosed();
  }

  showDropListOptionEditDialog(value: DragNDropValueObject): Observable<DragNDropValueObject> {
    const dialogRef = this.dialog.open(DropListOptionEditDialogComponent, {
      data: { value }
    });
    return dialogRef.afterClosed();
  }

  showMultilineTextEditDialog(text: string): Observable<string> {
    const dialogRef = this.dialog.open(TextEditMultilineDialogComponent, {
      data: { text }
    });
    return dialogRef.afterClosed();
  }

  showRichTextEditDialog(text: string, defaultFontSize: number, width: number): Observable<string> {
    const dialogRef = this.dialog.open(RichTextEditDialogComponent, {
      data: {
        content: text,
        defaultFontSize,
        clozeMode: false
      },
      autoFocus: false,
      width: `${width}px`
    });
    return dialogRef.afterClosed();
  }

  showClozeTextEditDialog(document: ClozeDocument, defaultFontSize: number, width: number): Observable<string> {
    const dialogRef = this.dialog.open(RichTextEditDialogComponent, {
      data: { content: document, defaultFontSize, clozeMode: true },
      autoFocus: false,
      width: `${Math.max(870, width)}px`
    });
    return dialogRef.afterClosed();
  }

  showPlayerEditDialog(playerProps: PlayerProperties): Observable<PlayerProperties> {
    const dialogRef = this.dialog.open(PlayerEditDialogComponent, {
      data: { playerProps }
    });
    return dialogRef.afterClosed();
  }

  showLikertColumnEditDialog(column: LikertColumn): Observable<LikertColumn> {
    const dialogRef = this.dialog.open(LikertColumnEditDialogComponent, {
      data: { column }
    });
    return dialogRef.afterClosed();
  }

  showLikertRowEditDialog(row: LikertElementRow, columns: LikertColumn[]): Observable<LikertElementRow> {
    const dialogRef = this.dialog.open(LikertRowEditDialogComponent, {
      data: { row, columns }
    });
    return dialogRef.afterClosed();
  }
}
