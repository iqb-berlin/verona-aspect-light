import { Type } from '@angular/core';
import {
  PositionedUIElement, UIElement, TextInputElement
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextFieldComponent } from 'common/components/input-elements/text-field.component';
import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';
import { BasicStyles, PositionProperties } from 'common/models/elements/property-group-interfaces';

export class TextFieldElement extends TextInputElement implements PositionedUIElement {
  appearance: 'fill' | 'outline' = 'outline';
  minLength: number | null = null;
  minLengthWarnMessage: string = 'Eingabe zu kurz';
  maxLength: number | null = null;
  maxLengthWarnMessage: string = 'Eingabe zu lang';
  isLimitedToMaxLength: boolean = false;
  pattern: string | null = null;
  patternWarnMessage: string = 'Eingabe entspricht nicht der Vorgabe';
  hasKeyboardIcon: boolean = false;
  clearable: boolean = false;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: Partial<TextFieldElement>) {
    super({ dimensions: { width: 180, height: 120 }, ...element });
    if (element.appearance) this.appearance = element.appearance;
    if (element.minLength !== undefined) this.minLength = element.minLength;
    if (element.minLengthWarnMessage !== undefined) this.minLengthWarnMessage = element.minLengthWarnMessage;
    if (element.maxLength !== undefined) this.maxLength = element.maxLength;
    if (element.maxLengthWarnMessage !== undefined) this.maxLengthWarnMessage = element.maxLengthWarnMessage;
    if (element.isLimitedToMaxLength) this.isLimitedToMaxLength = element.isLimitedToMaxLength;
    if (element.pattern !== undefined) this.pattern = element.pattern;
    if (element.patternWarnMessage !== undefined) this.patternWarnMessage = element.patternWarnMessage;
    if (element.clearable) this.clearable = element.clearable;
    if (element.hasKeyboardIcon) this.hasKeyboardIcon = element.hasKeyboardIcon;
    this.position = UIElement.initPositionProps(element.position);
    this.styling = {
      ...UIElement.initStylingProps({
        backgroundColor: 'transparent',
        lineHeight: 135,
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
      type: 'string',
      format: '',
      multiple: false,
      nullable: !this.value && this.value !== '',
      values: [],
      valuesComplete: false
    };
  }

  getElementComponent(): Type<ElementComponent> {
    return TextFieldComponent;
  }
}
