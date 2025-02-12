import {
  CompoundElement,
  UIElement
} from 'common/models/elements/element';
import { VariableInfo } from '@iqb/responses';
import { VisibilityRule } from 'common/models/visibility-rule';
import { ElementFactory } from 'common/util/element.factory';
import { environment } from 'common/environment';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import {
  AbstractIDService,
  Measurement,
  PositionedUIElement,
  UIElementProperties,
  UIElementValue
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export class Section {
  [index: string]: unknown;
  elements: PositionedUIElement[] = [];

  idService?: AbstractIDService;

  constructor(section?: SectionProperties, idService?: AbstractIDService) {
    this.idService = idService;
    if (section && isValid(section)) {
      this.elements = section.elements
        .map(element => ElementFactory.createElement(element, idService)) as PositionedUIElement[];
      this.ignoreNumbering = section.ignoreNumbering;
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Section instantiation');
      }
      this.elements = section?.elements !== undefined ?
        section.elements.map(element => ElementFactory.createElement(element, idService)) as PositionedUIElement[] :
        [];
      if (section?.ignoreNumbering !== undefined) this.ignoreNumbering = section.ignoreNumbering;
    }
  }

  setProperty(property: string, value: UIElementValue): void {
    this[property] = value;
  }

  addElement(element: PositionedUIElement): void {
    this.elements.push(element);
  }

  deleteElement(id: string): void {
    this.elements = this.elements.filter(el => el.id !== id);
  }

  /* Includes children of children, i.e. compound children. */
  getAllElements(elementType?: string): UIElement[] {
    let allElements: UIElement[] =
      this.elements.map(element => [element, ...(element as CompoundElement).getChildElements() || []])
        .flat();
    if (elementType) {
      allElements = allElements.filter(element => element.type === elementType);
    }
    return allElements;
  }

  getVariableInfos(dropLists: DropListElement[]): VariableInfo[] {
    return this.getAllElements()
      .map(element => ((element.type === 'drop-list') ?
        element.getVariableInfos(dropLists) :
        element.getVariableInfos()))
      .flat();
  }

  getLastRowIndex(): number {
    const x: number[] = this.elements
      .map(el => el.position.gridRow)
      .filter((gridRow: number | null): gridRow is number => gridRow !== null);
    return Math.max(...x, 0);
  }

  isEmpty(): boolean {
    return this.elements.length === 0;
  }

  getDuplicate(): Section {
    return new Section({
      ...this,
      elements: this.elements.map(el => el.getBlueprint())
    }, this.idService);
  }

  connectAllDropLists(): void {
    const dropLists: DropListElement[] = this.getAllElements('drop-list') as DropListElement[];
    const dropListIDs = dropLists.map(list => list.id);
    dropLists.forEach(dropList => {
      dropList.connectedTo = [...dropListIDs];
      dropList.connectedTo.splice(dropListIDs.indexOf(dropList.id), 1);
    });
  }
}

export interface SectionProperties {
  elements: UIElementProperties[];
}

function isValid(blueprint?: SectionProperties): boolean {
  if (!blueprint) return false;
  return blueprint.elements !== undefined;
}
