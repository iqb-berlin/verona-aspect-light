import { Type } from '@angular/core';
import {
  InputElement, PositionedUIElement, UIElement
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { CheckboxComponent } from 'common/components/input-elements/checkbox.component';
import { AnswerScheme, AnswerSchemeValue } from 'common/models/elements/answer-scheme-interfaces';
import { BasicStyles, PositionProperties } from 'common/models/elements/property-group-interfaces';

export class CheckboxElement extends InputElement implements PositionedUIElement {
  position: PositionProperties;
  styling: BasicStyles;

  constructor(element: Partial<CheckboxElement>) {
    super({ dimensions: { width: 215 }, ...element });
    this.position = UIElement.initPositionProps(element.position);
    this.styling = UIElement.initStylingProps(element.styling);
  }

  hasAnswerScheme(): boolean {
    return Boolean(this.getAnswerScheme);
  }

  getAnswerScheme(): AnswerScheme {
    return {
      id: this.id,
      type: 'boolean',
      format: '',
      multiple: false,
      nullable: false,
      values: this.getAnswerSchemeValues(),
      valuesComplete: true
    };
  }

  private getAnswerSchemeValues(): AnswerSchemeValue[] {
    return [
      { value: 'true', label: `Angekreuzt: ${this.label}` },
      { value: 'false', label: `Nicht Angekreuzt: ${this.label}` }
    ];
  }

  getElementComponent(): Type<ElementComponent> {
    return CheckboxComponent;
  }
}
