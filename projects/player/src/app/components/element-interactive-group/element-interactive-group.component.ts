import {
  AfterViewInit, Component, ViewChild
} from '@angular/core';
import {
  ButtonElement, FrameElement, ImageElement, InputElementValue
} from 'common/interfaces/elements';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { UnitStateService } from '../../services/unit-state.service';
import { ElementGroupDirective } from '../../directives/element-group.directive';
import { ElementComponent } from 'common/directives/element-component.directive';
import { NavigationService } from '../../services/navigation.service';
import { ElementModelElementCodeMappingService } from '../../services/element-model-element-code-mapping.service';

@Component({
  selector: 'aspect-element-interactive-group',
  templateUrl: './element-interactive-group.component.html',
  styleUrls: ['./element-interactive-group.component.scss']
})
export class ElementInteractiveGroupComponent extends ElementGroupDirective implements AfterViewInit {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  ButtonElement!: ButtonElement;
  FrameElement!: FrameElement;
  ImageElement!: ImageElement;

  constructor(
    public unitStateService: UnitStateService,
    public veronaPostService: VeronaPostService,
    public navigationService: NavigationService,
    private elementModelElementCodeMappingService: ElementModelElementCodeMappingService
  ) {
    super();
  }

  ngAfterViewInit(): void {
    const initialValue: InputElementValue = this.elementModel.type === 'image' ?
      this.elementModelElementCodeMappingService.mapToElementCodeValue(
        (this.elementModel as ImageElement).magnifierUsed, this.elementModel.type) :
      null;
    this.registerAtUnitStateService(
      this.elementModel.id,
      initialValue,
      this.elementComponent,
      this.pageIndex);
  }
}
