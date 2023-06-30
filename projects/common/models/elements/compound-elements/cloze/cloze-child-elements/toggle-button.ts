import {
  InputElement, UIElement
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  ToggleButtonComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/toggle-button.component';
import { BasicStyles } from 'common/models/elements/property-group-interfaces';
import { AnswerScheme, AnswerSchemeValue } from 'common/models/elements/answer-scheme-interfaces';
import { TextLabel } from 'common/models/elements/label-interfaces';

export class ToggleButtonElement extends InputElement {
  options: TextLabel[] = [];
  strikeOtherOptions: boolean = false;
  strikeSelectedOption: boolean = false;
  verticalOrientation: boolean = false;
  styling: BasicStyles & {
    lineHeight: number;
    selectionColor: string;
  };

  constructor(element: Partial<ToggleButtonElement>) {
    super({ dimensions: { height: 30 }, ...element });
    if (element.options) this.options = [...element.options];
    if (element.strikeOtherOptions) this.strikeOtherOptions = element.strikeOtherOptions;
    if (element.strikeSelectedOption) this.strikeSelectedOption = element.strikeSelectedOption;
    if (element.verticalOrientation) this.verticalOrientation = element.verticalOrientation;
    this.styling = {
      ...UIElement.initStylingProps({
        lineHeight: 100,
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
      .map((option, index) => ({
        value: (index + 1).toString(),
        label: InputElement.stripHTML(option.text)
      }));
  }

  getElementComponent(): Type<ElementComponent> {
    return ToggleButtonComponent;
  }

  getNewOptionLabel(optionText: string): TextLabel {
    return UIElement.createOptionLabel(optionText) as TextLabel;
  }
}
