import {
  ChangeDetectorRef, Component, Input, OnDestroy, OnInit
} from '@angular/core';
import {
  FormArray, FormBuilder, FormControl, FormGroup
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { VeronaSubscriptionService } from '../../services/verona-subscription.service';
import { VeronaPostService } from '../../services/verona-post.service';
import { MessageService } from '../../../../../common/services/message.service';
import { MetaDataService } from '../../services/meta-data.service';
import {
  FormControlElement, FormControlValidators, ChildFormGroup
} from '../../models/form';
import {
  PlayerConfig, Progress, UnitState, VopNavigationDeniedNotification
} from '../../models/verona';
import { UnitStateService } from '../../services/unit-state.service';
import { MediaPlayerService } from '../../services/media-player.service';
import { Page } from '../../../../../common/interfaces/unit';

@Component({
  selector: 'aspect-unit-state',
  templateUrl: './unit-state.component.html'
})
export class UnitStateComponent implements OnInit, OnDestroy {
  @Input() pages: Page[] = [];
  @Input() playerConfig!: PlayerConfig;

  form!: FormGroup;

  private validationControls: FormControl[] = [];
  private ngUnsubscribe = new Subject<void>();

  constructor(private formBuilder: FormBuilder,
              private unitStateService: UnitStateService,
              private mediaPlayerService: MediaPlayerService,
              private veronaSubscriptionService: VeronaSubscriptionService,
              private veronaPostService: VeronaPostService,
              private messageService: MessageService,
              private metaDataService: MetaDataService,
              private translateService: TranslateService,
              private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      pages: this.formBuilder.array([])
    });
    this.initSubscriptions();
  }

  private initSubscriptions(): void {
    // this.formService.groupAdded
    //   .pipe(takeUntil(this.ngUnsubscribe))
    //   .subscribe((group: ChildFormGroup): void => this.addGroup(group));
    // this.formService.controlAdded
    //   .pipe(takeUntil(this.ngUnsubscribe))
    //   .subscribe((control: FormControlElement): void => this.addControl(control));
    // this.formService.validatorsAdded
    //   .pipe(takeUntil(this.ngUnsubscribe))
    //   .subscribe((validations: FormControlValidators): void => this.setValidators(validations));
    this.mediaPlayerService.mediaStatusChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((): void => this.onMediaStatusChanged());
    this.unitStateService.presentedPageAdded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((): void => this.onPresentedPageAdded());
    this.unitStateService.unitStateElementCodeChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((): void => this.onUnitStateElementCodeChanged());
    this.veronaSubscriptionService.vopNavigationDeniedNotification
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((message: VopNavigationDeniedNotification): void => this.onNavigationDenied(message));
  }

  private get responseProgress(): Progress {
    if (this.form.valid) {
      return 'complete';
    }
    return this.validationControls.some(control => control.valid) ? 'some' : 'none';
  }

  private get presentationProgress(): Progress {
    const mediaStatus = this.mediaPlayerService.mediaStatus;
    return mediaStatus === this.unitStateService.presentedPagesProgress ? mediaStatus : 'some';
  }

  private addControl = (control: FormControlElement): void => {
    control.formGroup.addControl(control.id, control.formControl);
  };

  private registerValidationControl(control: FormControl): void {
    if (!this.validationControls.includes(control)) {
      this.validationControls.push(control);
    }
  }

  private setValidators = (validators: FormControlValidators): void => {
    validators.formGroup.controls[validators.id].setValidators(validators.validators);
    validators.formGroup.controls[validators.id].updateValueAndValidity();
    this.registerValidationControl(validators.formGroup.controls[validators.id] as FormControl);
    this.changeDetectorRef.detectChanges();
  };

  private onNavigationDenied(message: VopNavigationDeniedNotification): void {
    // eslint-disable-next-line no-console
    console.log('player: onNavigationDenied', message);
    const reasons = message.reason?.map((reason: string) => this.translateService.instant(reason));
    this.messageService.showWarning(reasons?.join(', ') || this.translateService.instant('noReason'));
    if (message.reason && message.reason.find(reason => reason === 'responsesIncomplete')) {
      this.form.markAllAsTouched();
    }
  }

  private addGroup = (group: ChildFormGroup): void => {
    const formArray: FormArray = group.parentForm.get(group.parentArray) as FormArray;
    if (group.parentArrayIndex < formArray.length) {
      formArray.insert(group.parentArrayIndex, group.formGroup);
    } else {
      formArray.push(group.formGroup);
    }
  };

  private onUnitStateElementCodeChanged(): void {
    // eslint-disable-next-line no-console
    console.log('player: onUnitStateElementCodeChanged', this.unitStateService.unitStateElementCodes);
    this.sendVopStateChangedNotification();
  }

  private onPresentedPageAdded(): void {
    // eslint-disable-next-line no-console
    console.log('player: onPresentedPageAdded');
    this.sendVopStateChangedNotification();
  }

  private onMediaStatusChanged(): void {
    // eslint-disable-next-line no-console
    console.log('player: onMediaStatusChanged', this.mediaPlayerService.mediaStatus);
    this.sendVopStateChangedNotification();
  }

  private sendVopStateChangedNotification(): void {
    // give the form time to change its valid status
    Promise.resolve().then(() => {
      // eslint-disable-next-line no-console
      console.log('player: this.unitStateService.unitStateElementCodes',
        this.unitStateService.unitStateElementCodes);
      const unitState: UnitState = {
        dataParts: {
          elementCodes: JSON.stringify(this.unitStateService.unitStateElementCodes)
        },
        presentationProgress: this.presentationProgress,
        responseProgress: this.responseProgress,
        unitStateDataType: 'iqb-standard@1.0'
      };
      // eslint-disable-next-line no-console
      console.log('player: unitState sendVopStateChangedNotification', unitState);
      this.veronaPostService.sendVopStateChangedNotification({ unitState });
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
