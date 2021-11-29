import {
  FontElement,
  FontProperties,
  InputElement,
  SurfaceElement,
  SurfaceProperties,
  UIElement
} from '../../models/uI-element';
import { initFontElement, initSurfaceElement } from '../../util/unit-interface-initializer';

export class TextFieldSimpleElement extends InputElement implements FontElement, SurfaceElement{
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.fontProps = initFontElement(serializedElement);
    this.surfaceProps = initSurfaceElement(serializedElement);

    this.height = serializedElement.height || 25;
  }
}
