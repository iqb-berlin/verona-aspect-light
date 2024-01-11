import { Injectable } from '@angular/core';
import { TextInputComponentType } from 'player/src/app/models/text-input-component.type';
import { InputService } from './input-service';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService extends InputService {
  addInputAssistanceToKeyboard: boolean = false;

  async toggleAsync(focusedTextInput: { inputElement: HTMLElement; focused: boolean },
                    elementComponent: TextInputComponentType,
                    isMobileWithoutHardwareKeyboard: boolean): Promise<boolean> {
    this.willToggle.emit(this.isOpen);
    return new Promise(resolve => {
      setTimeout(() => resolve(
        this.toggle(focusedTextInput, elementComponent, isMobileWithoutHardwareKeyboard)), 100
      );
    });
  }

  private toggle(focusedTextInput: { inputElement: HTMLElement; focused: boolean },
                 elementComponent: TextInputComponentType,
                 isMobileWithoutHardwareKeyboard: boolean): boolean {
    if (focusedTextInput.focused && isMobileWithoutHardwareKeyboard) {
      this.open(focusedTextInput.inputElement, elementComponent);
    } else {
      this.close();
    }
    return this.isOpen;
  }

  open(inputElement: HTMLElement, elementComponent: TextInputComponentType): void {
    this.addInputAssistanceToKeyboard = elementComponent.elementModel.addInputAssistanceToKeyboard;
    this.preset = elementComponent.elementModel.inputAssistancePreset;
    this.setCurrentKeyInputElement(inputElement, elementComponent);
    this.isOpen = true;
  }

  scrollElement(): void {
    if (this.isOpen && this.isElementHiddenByKeyboard()) {
      const scrollPositionTarget = this.isViewHighEnoughToCenterElement() ? 'start' : 'center';
      this.elementComponent.domElement.scrollIntoView({ block: scrollPositionTarget });
    }
  }

  private isViewHighEnoughToCenterElement(): boolean {
    return window.innerHeight < this.getKeyboardHeight() * 2;
  }

  private isElementHiddenByKeyboard(): boolean {
    return window.innerHeight - this.elementComponent.domElement.getBoundingClientRect().top < this.getKeyboardHeight();
  }

  private getKeyboardHeight(): number {
    return this.addInputAssistanceToKeyboard ? 400 : 350;
  }
}
