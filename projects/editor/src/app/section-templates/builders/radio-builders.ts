import { TextImageLabel, TextLabel } from 'common/interfaces';
import { Section } from 'common/models/section';
import { TemplateService } from 'editor/src/app/section-templates/template.service';
import { IDService } from 'editor/src/app/services/id.service';

export function createRadioSection(label1: string, label2: string, options: TextLabel[],
                                   idService: IDService): Section {
  const sectionElements = [
    TemplateService.createElement(
      'text',
      { gridRow: 1, gridColumn: 1, marginBottom: { value: 10, unit: 'px' } },
      { text: label1 },
      idService),
    TemplateService.createElement(
      'radio',
      { gridRow: 2, gridColumn: 1, marginBottom: { value: 30, unit: 'px' } },
      { label: label2, options: options },
      idService)
  ];
  const section = new Section(undefined, idService);
  sectionElements.forEach(el => section.addElement(el));
  return section;
}

export function createRadioImagesSection(label1: string, options: TextLabel[], itemsPerRow: number,
                                         idService: IDService): Section {
  const sectionElements = [
    TemplateService.createElement(
      'text',
      { gridRow: 1, gridColumn: 1, marginBottom: { value: 5, unit: 'px' } },
      { text: label1 },
      idService),
    TemplateService.createElement(
      'radio-group-images',
      { gridRow: 2, gridColumn: 1 },
      { label: '', options: options, itemsPerRow: itemsPerRow },
      idService)
  ];
  const section = new Section(undefined, idService);
  sectionElements.forEach(el => section.addElement(el));
  return section;
}

export function createLikertSection(text1: string, text2: string, options: TextImageLabel[], rows: TextImageLabel[],
                                    idService: IDService): Section {
  const sectionElements = [
    TemplateService.createElement(
      'text',
      { gridRow: 1, gridColumn: 1, marginBottom: { value: 10, unit: 'px' } },
      { text: text1 },
      idService),
    TemplateService.createElement(
      'likert',
      { gridRow: 2, gridColumn: 1, marginBottom: { value: 35, unit: 'px' } },
      {
        options: options,
        rows: rows.map(row => ({
          rowLabel: {
            ...row
          },
          columnCount: options.length
        })),
        label: text2,
        label2: '',
        stickyHeader: true,
        firstColumnSizeRatio: 3
      },
      idService)
  ];
  const section = new Section(undefined, idService);
  sectionElements.forEach(el => section.addElement(el));
  return section;
}
