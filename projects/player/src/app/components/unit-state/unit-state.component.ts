import {
  ChangeDetectorRef, Component, Input, OnDestroy, OnInit
} from '@angular/core';
import {
  AbstractControl,
  FormArray, FormBuilder, FormGroup
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { FormService } from '../../../../../common/form.service';
import { VeronaSubscriptionService } from '../../services/verona-subscription.service';
import { VeronaPostService } from '../../services/verona-post.service';
import { MessageService } from '../../../../../common/message.service';
import { MetaDataService } from '../../services/meta-data.service';
import {
  FormControlElement, FormControlValidators, ChildFormGroup
} from '../../../../../common/form';
import {
  PlayerConfig, Progress, UnitState, VopNavigationDeniedNotification
} from '../../models/verona';
import { UnitPage } from '../../../../../common/unit';

@Component({
  selector: 'app-unit-state',
  templateUrl: './unit-state.component.html'
})
export class UnitStateComponent implements OnInit, OnDestroy {
  @Input() pages: UnitPage[] = [];
  @Input() playerConfig!: PlayerConfig;
  form!: FormGroup;
  presentedPages: number[] = [];

  private ngUnsubscribe = new Subject<void>();

  constructor(private formBuilder: FormBuilder,
              private formService: FormService,
              private veronaSubscriptionService: VeronaSubscriptionService,
              private veronaPostService: VeronaPostService,
              private messageService: MessageService,
              private metaDataService: MetaDataService,
              private translateService: TranslateService,
              protected changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      pages: this.formBuilder.array([])
    });
    this.initSubscriptions();
  }

  private initSubscriptions(): void {
    this.formService.groupAdded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((group: ChildFormGroup): void => this.addGroup(group));
    this.formService.controlAdded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((control: FormControlElement): void => this.addControl(control));
    this.formService.validatorsAdded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((validations: FormControlValidators): void => this.setValidators(validations));
    this.formService.presentedPageAdded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((presentedPage: number): void => this.onPresentedPageAdded(presentedPage));
    this.form.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((): void => this.onFormChanges());
    this.veronaSubscriptionService.vopNavigationDeniedNotification
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((message: VopNavigationDeniedNotification): void => this.onNavigationDenied(message));
  }

  private get responseProgress(): Progress {
    if (this.form.valid) {
      return 'complete';
    }
    const pages: FormArray = this.form.get('pages') as FormArray;
    return (pages.controls.some((control: AbstractControl): boolean => control.value)) ? 'some' : 'none';
  }

  private get presentationProgress(): Progress {
    if (this.presentedPages.length === 0) {
      return 'none';
    }
    return (this.pages.length === this.presentedPages.length) ? 'complete' : 'some';
  }

  private addControl = (control: FormControlElement): void => {
    control.formGroup.addControl(control.id, control.formControl);
  };

  private setValidators = (validators: FormControlValidators): void => {
    validators.formGroup.controls[validators.id].setValidators(validators.validators);
    validators.formGroup.controls[validators.id].updateValueAndValidity();
    this.changeDetectorRef.detectChanges();
  };

  private onNavigationDenied(message: VopNavigationDeniedNotification): void {
    // eslint-disable-next-line no-console
    console.log('player: onNavigationDenied', message);
    const reasons = message.reason?.map((reason: string) => this.translateService.instant(reason));
    this.messageService.showWarning(reasons?.join(', ') || this.translateService.instant('noReason'));
    this.form.markAllAsTouched();
  }

  private addGroup = (group: ChildFormGroup): void => {
    const formArray: FormArray = group.parentForm.get(group.parentArray) as FormArray;
    if (group.parentArrayIndex < formArray.length) {
      formArray.insert(group.parentArrayIndex, group.formGroup);
    } else {
      formArray.push(group.formGroup);
    }
  };

  private onFormChanges(): void {
    // eslint-disable-next-line no-console
    console.log('player: onFormChanges', this.form.value);
    this.sendVopStateChangedNotification();
  }

  private onPresentedPageAdded(pagePresented: number): void {
    if (!this.presentedPages.includes(pagePresented)) {
      this.presentedPages.push(pagePresented);
    }
    // eslint-disable-next-line no-console
    console.log('player: onPresentedPageAdded', this.presentedPages);
    this.sendVopStateChangedNotification();
  }

  private sendVopStateChangedNotification(): void {
    const unitState: UnitState = {
      dataParts: {
        pages: JSON.stringify(this.form.value.pages)
      },
      presentationProgress: this.presentationProgress,
      responseProgress: this.responseProgress,
      unitStateDataType: this.metaDataService.playerMetadata.supportedUnitStateDataTypes
    };
    this.veronaPostService.sendVopStateChangedNotification({ unitState });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
