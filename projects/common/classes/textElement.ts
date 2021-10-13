import { initSurfaceElement, UIElement } from './uIElement';
import { SurfaceUIElement } from '../interfaces/UIElementInterfaces';

export class TextElement extends UIElement implements SurfaceUIElement {
  text: string = '<p>Lorem ipsum dolor sit amet</p>';
  highlightable: boolean = false;
  fontColor: string = 'black';
  font: string = 'Roboto';
  bold: boolean = false;
  italic: boolean = false;
  underline: boolean = false;

  backgroundColor: string = 'transparent';

  constructor(serializedElement: UIElement, coordinates?: { x: number; y: number }) {
    super(serializedElement, coordinates);
    Object.assign(this, serializedElement);
    Object.assign(this, initSurfaceElement());
    this.fontColor = serializedElement.fontColor as string || 'black';
    this.font = serializedElement.font as string || 'Roboto';
    this.bold = serializedElement.bold as boolean || false;
    this.italic = serializedElement.italic as boolean || false;
    this.underline = serializedElement.underline as boolean || false;

    this.height = 78;
    this.backgroundColor = 'transparent';
  }
}
