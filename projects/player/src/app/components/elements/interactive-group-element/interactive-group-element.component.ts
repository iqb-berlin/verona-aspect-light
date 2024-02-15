import {
  AfterViewInit, Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ButtonElement, ButtonEvent, UnitNavParam } from 'common/models/elements/button/button';
import { TriggerActionEvent, TriggerElement } from 'common/models/elements/trigger/trigger';
import { ImageElement } from 'common/models/elements/media-elements/image';
import { UIElement, ValueChangeElement } from 'common/models/elements/element';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { AnchorService } from 'player/src/app/services/anchor.service';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { MathTableCell, MathTableElement, MathTableRow } from 'common/models/elements/input-elements/math-table';
import { KeypadService } from 'player/src/app/services/keypad.service';
import { KeyboardService } from 'player/src/app/services/keyboard.service';
import { DeviceService } from 'player/src/app/services/device.service';
import { Subscription } from 'rxjs';
import { MathTableComponent } from 'common/components/input-elements/math-table.component';
import { UnitStateService } from '../../../services/unit-state.service';
import { ElementGroupDirective } from '../../../directives/element-group.directive';
import { ElementModelElementCodeMappingService } from '../../../services/element-model-element-code-mapping.service';
import { NavigationService } from '../../../services/navigation.service';

@Component({
  selector: 'aspect-interactive-group-element',
  templateUrl: './interactive-group-element.component.html',
  styleUrls: ['./interactive-group-element.component.scss']
})
export class InteractiveGroupElementComponent
  extends ElementGroupDirective implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  ButtonElement!: ButtonElement;
  ImageElement!: ImageElement;
  MathTableElement!: MathTableElement;
  TriggerElement!: TriggerElement;

  tableModel: MathTableRow[] = [];

  isKeypadOpen: boolean = false;
  keypadEnterKeySubscription!: Subscription;
  keypadDeleteCharactersSubscription!: Subscription;
  keypadSelectSubscription!: Subscription;

  keyboardEnterKeySubscription!: Subscription;
  keyboardDeleteCharactersSubscription!: Subscription;

  constructor(
    public unitStateService: UnitStateService,
    public veronaPostService: VeronaPostService,
    public navigationService: NavigationService,
    private elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
    private anchorService: AnchorService,
    private stateVariableStateService: StateVariableStateService,
    public keypadService: KeypadService,
    private keyboardService: KeyboardService,
    private deviceService: DeviceService
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.elementModel.type === 'math-table') {
      this.tableModel = this.elementModelElementCodeMappingService.mapToElementModelValue(
        this.unitStateService.getElementCodeById(this.elementModel.id)?.value, this.elementModel
      ) as MathTableRow[];
    }
  }

  ngAfterViewInit(): void {
    let initialValue;
    switch (this.elementModel.type) {
      case 'image':
        initialValue = ElementModelElementCodeMappingService.mapToElementCodeValue(
          (this.elementModel as ImageElement).magnifierUsed, this.elementModel.type);
        break;
      case 'math-table':
        initialValue = ElementModelElementCodeMappingService.mapToElementCodeValue(
          [], this.elementModel.type);
        break;
      default:
        initialValue = null;
    }
    this.registerAtUnitStateService(
      this.elementModel.id,
      initialValue,
      this.elementComponent,
      this.pageIndex);
  }

  applyButtonAction(buttonEvent: ButtonEvent): void {
    switch (buttonEvent.action) {
      case 'unitNav':
        this.veronaPostService.sendVopUnitNavigationRequestedNotification(
          (buttonEvent.param as UnitNavParam)
        );
        break;
      case 'pageNav':
        this.navigationService.setPage(buttonEvent.param as number);
        break;
      case 'highlightText':
        this.anchorService.toggleAnchor(buttonEvent.param as string);
        break;
      default:
        this.applyTriggerAction(buttonEvent as TriggerActionEvent);
    }
  }

  applyTriggerAction(triggerActionEvent: TriggerActionEvent): void {
    switch (triggerActionEvent.action) {
      case 'highlightText':
        this.anchorService.showAnchor(triggerActionEvent.param as string);
        break;
      case 'stateVariableChange':
        this.stateVariableStateService.changeElementCodeValue(
          triggerActionEvent.param as { id: string, value: string }
        );
        break;
      default:
    }
  }

  changeElementCodeValue(value: ValueChangeElement): void {
    this.unitStateService.changeElementCodeValue({
      id: value.id,
      value: ElementModelElementCodeMappingService
        .mapToElementCodeValue(value.value, this.elementModel.type)
    });
  }

  async toggleKeyInput(
    focusedTextInput: {
      inputElement: HTMLElement;
      row: MathTableRow;
      cell: MathTableCell;
      focused: boolean
    }
  ): Promise<void> {
    const promises: Promise<boolean>[] = [];
    if (this.elementModel.showSoftwareKeyboard && !this.elementModel.readOnly) {
      promises.push(this.keyboardService
        .toggleAsync(focusedTextInput,
          this.elementComponent as MathTableComponent,
          this.deviceService.isMobileWithoutHardwareKeyboard));
    }
    if (this.shallOpenKeypad(this.elementModel)) {
      promises.push(this.keypadService
        .toggleAsync(focusedTextInput,
          this.elementComponent as MathTableComponent));
    }
    if (promises.length) {
      await Promise.all(promises).then(() => {
        if (this.keyboardService.isOpen) {
          this.subscribeForKeyboardEvents(focusedTextInput.row, focusedTextInput.cell);
        } else {
          this.unsubscribeFromKeyboardEvents();
        }
        if (this.keypadService.isOpen) {
          this.subscribeForKeypadEvents(focusedTextInput.row, focusedTextInput.cell);
        } else {
          this.unsubscribeFromKeypadEvents();
        }
        this.isKeypadOpen = this.keypadService.isOpen;
      });
    }
  }

  private shallOpenKeypad(elementModel: UIElement): boolean {
    return !!elementModel.inputAssistancePreset &&
      !(elementModel.showSoftwareKeyboard &&
        elementModel.addInputAssistanceToKeyboard &&
        this.deviceService.isMobileWithoutHardwareKeyboard);
  }

  private subscribeForKeypadEvents(
    row: MathTableRow,
    cell: MathTableCell
  ): void {
    this.keypadEnterKeySubscription = this.keypadService.enterKey
      .subscribe(key => this.enterKey(key, row, cell));
    this.keypadDeleteCharactersSubscription = this.keypadService.deleteCharacters
      .subscribe(() => this.enterKey('Delete', row, cell));
    this.keypadSelectSubscription = this.keypadService.select
      .subscribe(key => this.enterKey(key, row, cell));
  }

  private unsubscribeFromKeypadEvents(): void {
    if (this.keypadEnterKeySubscription) this.keypadEnterKeySubscription.unsubscribe();
    if (this.keypadDeleteCharactersSubscription) this.keypadDeleteCharactersSubscription.unsubscribe();
    if (this.keypadSelectSubscription) this.keypadSelectSubscription.unsubscribe();
  }

  private subscribeForKeyboardEvents(
    row: MathTableRow,
    cell: MathTableCell
  ): void {
    this.keyboardEnterKeySubscription = this.keyboardService.enterKey
      .subscribe(key => this.enterKey(key, row, cell));
    this.keyboardDeleteCharactersSubscription = this.keyboardService.deleteCharacters
      .subscribe(() => this.enterKey('Delete', row, cell));
  }

  private unsubscribeFromKeyboardEvents(): void {
    if (this.keyboardEnterKeySubscription) this.keyboardEnterKeySubscription.unsubscribe();
    if (this.keyboardDeleteCharactersSubscription) this.keyboardDeleteCharactersSubscription.unsubscribe();
  }

  private enterKey(
    key: string,
    row: MathTableRow,
    cell: MathTableCell
  ): void {
    const char = key === '·' ? '*' : key;
    (this.elementComponent as MathTableComponent).setCellValue(char, cell, row);
  }

  detectHardwareKeyboard(): void {
    if (this.elementModel.showSoftwareKeyboard) {
      this.deviceService.hasHardwareKeyboard = true;
      this.keyboardService.close();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeFromKeypadEvents();
    this.unsubscribeFromKeyboardEvents();
  }
}
