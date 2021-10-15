import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.css']
})
export class KeyboardComponent {
  @Input() preset!: 'french' | 'numbers' | 'numbersAndOperators' | 'none';

  onMouseDown = (event: MouseEvent): void => {
    event.preventDefault();
  };
}
