import { UIElement, UIElementProperties, UIElementType } from 'common/models/elements/element';
import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { MathTableComponent } from 'common/components/input-elements/math-table.component';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';
import {
  BasicStyles,
  PropertyGroupGenerators,
  PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';

export class MathTableElement extends UIElement implements MathTableProperties {
  type: UIElementType = 'math-table';
  operation: 'addition' | 'subtraction' | 'multiplication' = 'addition';
  terms: string[] = ['123', '456', '789'];
  result: string = '';
  styling: BasicStyles;

  constructor(element?: MathTableProperties) {
    super(element);
    if (element && isValid(element)) {
      this.operation = element.operation;
      this.terms = [...element.terms];
      this.result = element.result;
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at MathTable instantiation', element);
      }
      if (element?.operation !== undefined) this.operation = element.operation;
      if (element?.terms !== undefined) this.terms = [...element.terms];
      if (element?.result !== undefined) this.result = element.result;
      this.styling = PropertyGroupGenerators.generateBasicStyleProps(element?.styling);
    }
  }

  hasAnswerScheme(): boolean {
    return Boolean(this.getAnswerScheme);
  }

  getAnswerScheme(): AnswerScheme {
    return {
      id: this.id,
      type: 'string',
      format: 'math-table',
      multiple: false,
      nullable: false,
      values: [], // TODO: list of all possibilities?
      valuesComplete: this.operation !== 'multiplication'
    };
  }

  getElementComponent(): Type<ElementComponent> {
    return MathTableComponent;
  }

  getDuplicate(): MathTableElement {
    return new MathTableElement(this);
  }
}

export interface MathTableProperties extends UIElementProperties {
  operation: 'addition' | 'subtraction' | 'multiplication';
  terms: string[];
  result: string;
  styling: BasicStyles;
}

function isValid(blueprint?: MathTableProperties): boolean {
  if (!blueprint) return false;
  return blueprint.operation !== undefined &&
         blueprint.terms !== undefined &&
         blueprint.result !== undefined &&
         PropertyGroupValidators.isValidBasicStyles(blueprint.styling);
}

export interface MathTableCell {
  value: string;
  canBeCrossedOut?: boolean;
  isCrossedOut?: boolean;
  isSmallCell?: boolean;
  isEditable?: boolean;
}

export interface MathTableRow {
  rowType: 'normal' | 'result' | 'helper';
  cells: MathTableCell[];
}
