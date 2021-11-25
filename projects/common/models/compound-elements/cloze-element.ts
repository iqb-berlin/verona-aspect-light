import {
  CompoundElement, InputElement, InputElementValue, UIElement
} from '../uI-element';
import {
  ClozePart, FontElement, LikertColumn, LikertRow
} from '../../interfaces/UIElementInterfaces';
import { TextFieldElement } from '../text-field-element';
import { TextAreaElement } from '../text-area-element';
import { CheckboxElement } from '../checkbox-element';
import { DropdownElement } from '../dropdown-element';
import { DropListElement } from './drop-list';
import { initFontElement } from '../../util/unit-interface-initializer';
import { TextFieldSimpleElement } from '../text-field-simple-element';

// TODO styles like em dont continue after inserted components

export class ClozeElement extends CompoundElement implements FontElement {
  text: string = '<p>Lorem ipsum dolor \\z sdfsdf \\i sdfsdf</p>';

  parts: ClozePart[][] = [];
  childElements: InputElement[] = [];

  fontColor: string = 'black';
  font: string = 'Roboto';
  fontSize: number = 20;
  lineHeight: number = 120;
  bold: boolean = false;
  italic: boolean = false;
  underline: boolean = false;

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    Object.assign(this, initFontElement(serializedElement));
    this.height = 200;
    this.width = 500;
  }

  setProperty(property: string, value: InputElementValue | string[] | LikertColumn[] | LikertRow[]): void {
    super.setProperty(property, value);

    if (property === 'text') {
      this.createParts(value as string);
    }
  }

  private createParts(htmlText: string): void {
    const elementList = ClozeElement.readElementArray(htmlText);

    this.parts = [];
    elementList.forEach((element: HTMLParagraphElement | HTMLHeadingElement, i: number) => {
      this.parseParagraphs(element, i);
    });
    // console.log('PARTS:', this.parts);
  }

  private static readElementArray(htmlText: string): (HTMLParagraphElement | HTMLHeadingElement)[] {
    const el = document.createElement('html');
    el.innerHTML = htmlText;
    return Array.from(el.children[1].children) as (HTMLParagraphElement | HTMLHeadingElement)[];
  }

  private parseParagraphs(element: HTMLParagraphElement | HTMLHeadingElement, partIndex: number): void {
    this.parts[partIndex] = []; // init array to be able to push
    let [nextSpecialElementIndex, nextElementType] = ClozeElement.getNextSpecialElement(element.innerHTML);
    let indexOffset = 0;

    while (nextSpecialElementIndex !== -1) {
      nextSpecialElementIndex += indexOffset;
      this.parts[partIndex].push({
        type: element.localName,
        value: element.innerHTML.substring(indexOffset, nextSpecialElementIndex),
        style: element.style.cssText
      });

      const newElement = ClozeElement.createElement(nextElementType);
      this.childElements.push(newElement);
      this.parts[partIndex].push({ type: nextElementType, value: newElement });

      indexOffset = nextSpecialElementIndex + 2; // + 2 to get rid of the marker, i.e. '\b'
      [nextSpecialElementIndex, nextElementType] =
        ClozeElement.getNextSpecialElement(element.innerHTML.substring(indexOffset));
    }
    this.parts[partIndex].push({
      type: element.localName,
      value: element.innerHTML.substring(indexOffset),
      style: element.style.cssText
    });
  }

  private static getNextSpecialElement(p: string): [number, string] {
    const x = [];
    if (p.indexOf('\\d') > 0) {
      x.push(p.indexOf('\\d'));
    }
    if (p.indexOf('\\i') > 0) {
      x.push(p.indexOf('\\i'));
    }
    if (p.indexOf('\\z') > 0) {
      x.push(p.indexOf('\\z'));
    }

    const y = Math.min(...x);
    let nextElementType = '';
    switch (p[y + 1]) {
      case 'd': nextElementType = 'dropdown'; break;
      case 'i': nextElementType = 'text-field'; break;
      case 'z': nextElementType = 'drop-list'; break;
      default: return [-1, 'unknown'];
    }
    return [y, nextElementType];
  }

  private static createElement(elementType: string): InputElement {
    const elementModel: UIElement = { type: elementType } as UIElement;
    let newElement: InputElement;
    switch (elementModel.type) {
      case 'text-field':
        newElement = new TextFieldSimpleElement(elementModel);
        (newElement as TextFieldElement).label = '';
        break;
      case 'text-area':
        newElement = new TextAreaElement(elementModel);
        break;
      case 'checkbox':
        newElement = new CheckboxElement(elementModel);
        break;
      case 'dropdown':
        newElement = new DropdownElement(elementModel);
        break;
      case 'drop-list':
        newElement = new DropListElement(elementModel);
        newElement.height = 30;
        newElement.width = 100;
        newElement.onlyOneItem = true;
        break;
      default:
        throw new Error(`ElementType ${elementModel.type} not found!`);
    }
    return newElement;
  }
}
