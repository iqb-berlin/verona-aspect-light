import { Section, SectionProperties } from './section';

import { VariableInfo } from '@iqb/responses';
import { UIElement } from 'common/models/elements/element';
import { StateVariable } from 'common/models/state-variable';
import { environment } from 'common/environment';
import { VersionManager } from 'common/services/version-manager';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { AbstractIDService } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export class Unit implements UnitProperties {
  type = 'aspect-unit-definition';
  version: string;
  stateVariables: StateVariable[] = [];
  sections: Section[] = [];
  showUnitNavNext: boolean = false;

  constructor(unit?: UnitProperties, idService?: AbstractIDService) {
    if (unit && isValid(unit)) {
      this.version = unit.version;
      this.stateVariables = unit.stateVariables
        .map(variable => new StateVariable(variable.id, variable.alias ?? variable.id, variable.value));
      this.sections = unit.sections
        .map(section => new Section(section, idService));
      this.showUnitNavNext = unit.showUnitNavNext;
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at unit instantiation');
      }
      this.version = VersionManager.getCurrentVersion();
      if (unit?.stateVariables !== undefined) {
        this.stateVariables = unit.stateVariables
          .map(variable => new StateVariable(variable.id, variable.alias ?? variable.id, variable.value));
      }
      this.sections = unit?.sections
        .map(section => new Section(section, idService)) || [new Section(undefined, idService)];
      if (unit?.showUnitNavNext !== undefined) this.showUnitNavNext = unit.showUnitNavNext;
    }
  }

  getAllElements(elementType?: string): UIElement[] {
    return this.sections.map(section => section.getAllElements(elementType)).flat();
  }

  getVariableInfos(): VariableInfo[] {
    const dropLists: DropListElement[] = [
      ...this.getAllElements('drop-list') as DropListElement[]
    ];
    return [
      ...this.stateVariables.map(variables => variables.getVariableInfo()),
      ...this.sections.map(section => section.getVariableInfos(dropLists)).flat()
    ];
  }
}

function isValid(blueprint?: UnitProperties): boolean {
  if (!blueprint) return false;
  if (blueprint.stateVariables !== undefined &&
      blueprint.stateVariables.length > 0 &&
      blueprint.stateVariables[0].alias === undefined) {
    return false;
  }
  return blueprint.version === VersionManager.getCurrentVersion() &&
    blueprint.stateVariables !== undefined &&
    blueprint.type !== undefined &&
    blueprint.sections !== undefined &&
    blueprint.showUnitNavNext !== undefined;
}

export interface UnitProperties {
  type: string;
  version: string;
  stateVariables: StateVariable[];
  sections: SectionProperties[];
  showUnitNavNext: boolean;
}
