import { Section, SectionProperties } from './section';
import { VariableInfo } from '@iqb/responses';
import { UIElement } from './elements/element';
import { DropListElement } from './elements/input-elements/drop-list';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export class Page {
  [index: string]: unknown;
  sections: Section[] = [];

  idService?: AbstractIDService;

  constructor(page?: PageProperties, idService?: AbstractIDService) {
    this.idService = idService;
    if (page && isValid(page)) {
      this.sections = page.sections.map(section => new Section(section, idService));
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Page instantiation');
      }
      if (page?.sections !== undefined) {
        this.sections = page.sections.map(section => new Section(section, idService));
      } else {
        this.sections = [new Section(undefined, idService)];
      }
    }
  }

  getAllElements(elementType?: string): UIElement[] {
    return this.sections.map(section => section.getAllElements(elementType)).flat();
  }

  getVariableInfos(dropLists: DropListElement[]): VariableInfo[] {
    return this.sections.map(section => section.getVariableInfos(dropLists)).flat();
  }

  addSection(section?: Section, sectionIndex?: number): void {
    if (sectionIndex !== undefined) {
      this.sections.splice(sectionIndex, 0, section || new Section(undefined, this.idService));
    } else {
      this.sections.push(section || new Section());
    }
  }

  replaceSection(sectionIndex: number, section: Section): void {
    this.sections.splice(sectionIndex, 1, section);
  }

  deleteSection(sectionIndex: number): Section {
    return this.sections.splice(sectionIndex, 1)[0];
  }

  duplicateSection(sectionIndex: number): void {
    const newSection = this.sections[sectionIndex].getDuplicate();
    this.addSection(newSection, sectionIndex + 1);
  }
}

export interface PageProperties {
  sections: SectionProperties[];
}

function isValid(blueprint?: PageProperties): boolean {
  if (!blueprint) return false;
  return blueprint.sections !== undefined;
}
