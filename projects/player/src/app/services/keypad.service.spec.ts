import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KeyInputModule } from 'player/modules/key-input/key-input.module';
import { TextFieldComponent } from 'common/components/input-elements/text-field.component';
import { TextAreaComponent } from 'common/components/input-elements/text-area.component';
import {
  TextFieldSimpleComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/text-field-simple.component';
import { SpellCorrectComponent } from 'common/components/input-elements/spell-correct.component';

import * as textField_130 from 'test-data/element-models/text-field_130.json';
import * as textFieldSimple_131 from 'test-data/element-models/text-field-simple_131.json';
import * as textArea_130 from 'test-data/element-models/text-area_130.json';
import * as spellCorrect_130 from 'test-data/element-models/spell-correct_130.json';
import { APIService } from 'common/shared.module';
import { KeypadService } from './keypad.service';

describe('KeypadService', () => {
  let service: KeypadService;
  let textFieldComponentFixture: ComponentFixture<TextFieldComponent>;
  let textFieldComponent: TextFieldComponent;
  let textFieldSimpleComponentFixture: ComponentFixture<TextFieldSimpleComponent>;
  let textFieldSimpleComponent: TextFieldSimpleComponent;
  let textAreaComponentFixture: ComponentFixture<TextAreaComponent>;
  let textAreaComponent: TextAreaComponent;
  let spellCorrectComponentFixture: ComponentFixture<SpellCorrectComponent>;
  let spellCorrectComponent: SpellCorrectComponent;

  class ApiStubService {
    // eslint-disable-next-line class-methods-use-this
    getResourceURL(): string {
      return 'assets';
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        KeyInputModule
      ],
      providers: [{ provide: APIService, useClass: ApiStubService }]
    });
    service = TestBed.inject(KeypadService);

    textFieldComponentFixture = TestBed.createComponent(TextFieldComponent);
    textFieldComponent = textFieldComponentFixture.componentInstance;
    textFieldComponent.elementModel = JSON.parse(JSON.stringify(textField_130));

    textFieldSimpleComponentFixture = TestBed.createComponent(TextFieldSimpleComponent);
    textFieldSimpleComponent = textFieldSimpleComponentFixture.componentInstance;
    textFieldSimpleComponent.elementModel = JSON.parse(JSON.stringify(textFieldSimple_131));

    textAreaComponentFixture = TestBed.createComponent(TextAreaComponent);
    textAreaComponent = textAreaComponentFixture.componentInstance;
    textAreaComponent.elementModel = JSON.parse(JSON.stringify(textArea_130));

    spellCorrectComponentFixture = TestBed.createComponent(SpellCorrectComponent);
    spellCorrectComponent = spellCorrectComponentFixture.componentInstance;
    spellCorrectComponent.elementModel = JSON.parse(JSON.stringify(spellCorrect_130));

    textFieldComponentFixture.detectChanges();
    textFieldSimpleComponentFixture.detectChanges();
    textAreaComponentFixture.detectChanges();
    spellCorrectComponentFixture.detectChanges();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // textField

  it('should toggle keypad to open', async () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldComponent).then(value => {
      expect(value).toBeTruthy();
    });
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keypad to close', async () => {
    service.isOpen = true;
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: false };
    await service.toggleAsync(input, textFieldComponent);
    expect(service.isOpen).toBeFalse();
  });

  it('preset should be set to "french"', async () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldComponent);
    expect(service.preset).toEqual('french');
  });

  it('position should be set to "floating"', async () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldComponent);
    expect(service.position).toEqual('floating');
  });

  // textFieldSimple

  it('should toggle keypad to open', async () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldSimpleComponent).then(value => {
      expect(value).toBeTruthy();
    });
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keypad to close', async () => {
    service.isOpen = true;
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: false };
    await service.toggleAsync(input, textFieldSimpleComponent);
    expect(service.isOpen).toBeFalse();
  });

  it('preset should be set to "french"', async () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldSimpleComponent);
    expect(service.preset).toEqual('french');
  });

  it('position should be set to "floating"', async () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldSimpleComponent);
    expect(service.position).toEqual('floating');
  });

  // textArea

  it('should toggle keypad to open', async () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textAreaComponent).then(value => {
      expect(value).toBeTruthy();
    });
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keypad to close', async () => {
    service.isOpen = true;
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: false };
    await service.toggleAsync(input, textAreaComponent);
    expect(service.isOpen).toBeFalse();
  });

  it('preset should be set to "french"', async () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textAreaComponent);
    expect(service.preset).toEqual('french');
  });

  it('position should be set to "floating"', async () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textAreaComponent);
    expect(service.position).toEqual('floating');
  });

  // spellCorrect

  it('should toggle keypad to open', async () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, spellCorrectComponent).then(value => {
      expect(value).toBeTruthy();
    });
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keypad to close', async () => {
    service.isOpen = true;
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: false };
    await service.toggleAsync(input, spellCorrectComponent);
    expect(service.isOpen).toBeFalse();
  });

  it('preset should be set to "french"', async () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = {
      inputElement: element,
      focused: true
    };
    await service.toggleAsync(input, spellCorrectComponent);
    expect(service.preset)
      .toEqual('french');
  });

  it('position should be set to "floating"', async () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, spellCorrectComponent);
    expect(service.position).toEqual('floating');
  });
});
