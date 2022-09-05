import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles, InputElement, AnswerScheme, AnswerSchemeValue, TextLabel
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  ToggleButtonComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/toggle-button.component';

export class ToggleButtonElement extends InputElement {
  options: TextLabel[] = [];
  strikeOtherOptions: boolean = false;
  strikeSelectedOption: boolean = false;
  verticalOrientation: boolean = false;
  dynamicWidth: boolean = true;
  styling: BasicStyles & {
    lineHeight: number;
    selectionColor: string;
  };

  constructor(element: Partial<ToggleButtonElement>, ...args: unknown[]) {
    super({ height: 25, ...element }, ...args);
    if (element.options) this.options = element.options;
    if (element.strikeOtherOptions) this.strikeOtherOptions = element.strikeOtherOptions;
    if (element.strikeSelectedOption) this.strikeSelectedOption = element.strikeSelectedOption;
    if (element.verticalOrientation) this.verticalOrientation = element.verticalOrientation;
    if (element.dynamicWidth !== undefined) this.dynamicWidth = element.dynamicWidth;
    this.styling = {
      ...ElementFactory.initStylingProps({
        lineHeight: 135,
        selectionColor: '#c7f3d0',
        backgroundColor: 'transparent',
        ...element.styling
      })
    };
  }

  hasAnswerScheme(): boolean {
    return Boolean(this.getAnswerScheme);
  }

  getAnswerScheme(): AnswerScheme {
    return {
      id: this.id,
      type: 'integer',
      format: '',
      multiple: false,
      nullable: !this.value && this.value === 0,
      values: this.getAnswerSchemeValues(),
      valuesComplete: true
    };
  }

  private getAnswerSchemeValues(): AnswerSchemeValue[] {
    return this.options
      .map((option, index) => ({ value: (index + 1).toString(), label: option.text }));
  }

  getElementComponent(): Type<ElementComponent> {
    return ToggleButtonComponent;
  }

  getNewOptionLabel(optionText: string): TextLabel {
    return ElementFactory.createOptionLabel(optionText) as TextLabel;
  }
}
