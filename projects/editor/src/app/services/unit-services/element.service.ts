import { Injectable } from '@angular/core';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { IDService } from 'editor/src/app/services/id.service';
import {
  UIElement, CompoundElement, InputElement, PlayerElement, PositionedUIElement,
  UIElementProperties, UIElementType, UIElementValue
} from 'common/models/elements/element';
import { Section } from 'common/models/section';
import { GeometryProperties } from 'common/models/elements/geometry/geometry';
import { firstValueFrom } from 'rxjs';
import { FileService } from 'common/services/file.service';
import { AudioProperties } from 'common/models/elements/media-elements/audio';
import { VideoProperties } from 'common/models/elements/media-elements/video';
import { ImageProperties } from 'common/models/elements/media-elements/image';
import {
  PlayerProperties, PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { ElementFactory } from 'common/util/element.factory';
import { ReferenceManager } from 'editor/src/app/services/reference-manager';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { TextElement } from 'common/models/elements/text/text';
import { ClozeDocument, ClozeElement } from 'common/models/elements/compound-elements/cloze/cloze';
import { DomSanitizer } from '@angular/platform-browser';
import { DragNDropValueObject } from 'common/models/elements/label-interfaces';
import { TableElement } from 'common/models/elements/compound-elements/table/table';

@Injectable({
  providedIn: 'root'
})
export class ElementService {
  constructor(private unitService: UnitService,
              private selectionService: SelectionService,
              private dialogService: DialogService,
              private messageService: MessageService,
              private idService: IDService,
              private sanitizer: DomSanitizer) { }

  async addElementToSection(elementType: UIElementType, sectionParam?: Section,
                            coordinates?: { x: number, y: number }): Promise<void> {
    const section = sectionParam || this.unitService.getSelectedSection();
    this.unitService.updateUnitDefinition({
      title: `Element hinzugefügt (${elementType})`,
      command: async () => {
        let newElementProperties: Partial<UIElementProperties> = {};
        try {
          newElementProperties = await this.prepareElementProps(elementType, section, coordinates);
        } catch (e) {
          if (e === 'dialogCanceled') return {};
        }
        const newElementID = this.idService.getAndRegisterNewID(elementType);
        section.addElement(ElementFactory.createElement({
          type: elementType,
          position: PropertyGroupGenerators.generatePositionProps(newElementProperties.position),
          ...newElementProperties,
          id: newElementID
        }) as PositionedUIElement);
        return { newElementID };
      },
      rollback: (deletedData: Record<string, unknown>) => {
        this.idService.unregisterID(deletedData.newElementID as string);
        section.deleteElement(deletedData.newElementID as string);
      }
    });
  }

  private async prepareElementProps(elementType: UIElementType,
                                    section: Section,
                                    coordinates?: { x: number, y: number }): Promise<Partial<UIElementProperties>> {
    const newElementProperties: Partial<UIElementProperties> = {};

    switch (elementType) {
      case 'geometry':
        (newElementProperties as GeometryProperties).appDefinition =
          await firstValueFrom(this.dialogService.showGeogebraAppDefinitionDialog());
        if (!(newElementProperties as GeometryProperties).appDefinition) {
          return Promise.reject('dialogCanceled');
        }
        break;
      case 'audio':
        (newElementProperties as AudioProperties).src = await FileService.loadAudio();
        break;
      case 'video':
        (newElementProperties as VideoProperties).src = await FileService.loadVideo();
        break;
      case 'image':
      case 'hotspot-image':
        (newElementProperties as ImageProperties).src = await FileService.loadImage();
        break;
      case 'frame':
        newElementProperties.position = {
          zIndex: -1,
          ...newElementProperties.position
        } as PositionProperties;
        break;
      // no default
    }

    /* Coordinates are given if an element is dragged directly onto the canvas.
       x and y have different meaning depending on the layouting of the section, being either absolute
       or grid coordinates. */
    if (section.dynamicPositioning) {
      newElementProperties.position = {
        gridRow: coordinates ? coordinates.x : section.getLastRowIndex() + 1,
        gridColumn: coordinates ? coordinates.y : 1,
        ...newElementProperties.position
      } as PositionProperties;
    } else {
      newElementProperties.position = {
        xPosition: coordinates ? coordinates.x : 0,
        yPosition: coordinates ? coordinates.y : 0,
        ...newElementProperties.position
      } as PositionProperties;
    }
    return newElementProperties;
  }

  async deleteElements(elements: UIElement[]): Promise<void> {
    this.unitService.updateUnitDefinition({
      title: elements.length > 1 ? 'Elemente gelöscht' : `Element ${elements[0].id} gelöscht`,
      command: async () => {
        if (await this.unitService.prepareDelete('elements', elements)) {
          this.unitService.unregisterIDs(elements);
          const elementSections = this.findElementsInSections(elements);
          elementSections.forEach(x => {
            this.unitService.unit.pages[this.selectionService.selectedPageIndex].sections[x.sectionIndex]
              .deleteElement(x.element.id);
          });
          return { elementSections };
        }
        return {};
      },
      rollback: (deletedData: Record<string, unknown>) => {
        this.unitService.registerIDs(elements);
        (deletedData.elementSections as { sectionIndex: number, element: UIElement }[]).forEach(x => {
          this.unitService.unit
            .pages[this.selectionService.selectedPageIndex]
            .sections[x.sectionIndex]
            .addElement(x.element as PositionedUIElement); // TODO order check
        });
      }
    });
  }

  private findElementsInSections(elements: UIElement[]): { sectionIndex: number, element: UIElement }[] {
    const elementSections: { sectionIndex: number, element: UIElement }[] = [];
    elements.forEach(element => {
      this.unitService.unit.pages[this.selectionService.selectedPageIndex].sections.forEach((section, i) => {
        if (section.elements.map(el => el.id).includes(element.id)) {
          elementSections.push({ sectionIndex: i, element });
        }
      });
    });
    return elementSections;
  }

  updateElementsProperty(elements: UIElement[], property: string, value: unknown): void {
    // console.log('updateElementsProperty ', elements, property, value);
    elements.forEach(element => {
      if (property === 'id') {
        if (this.idService.validateAndAddNewID(value as string, element.id)) {
          element.setProperty('id', value);
        }
      } else if (element.type === 'text' && property === 'text') {
        this.handleTextElementChange(element as TextElement, value as string);
      } else if (property === 'document') {
        this.handleClozeDocumentChange(element as ClozeElement, value as ClozeDocument);
      } else {
        element.setProperty(property, value);
        if (element.type === 'geometry' && property !== 'trackedVariables') {
          this.unitService.geometryElementPropertyUpdated.next(element.id);
        }
        if (element.type === 'math-table') this.unitService.mathTableElementPropertyUpdated.next(element.id);
        if (element.type === 'table') this.unitService.tablePropUpdated.next(element.id);
      }
    });

    this.unitService.elementPropertyUpdated.next();
    this.unitService.updateUnitDefinition();
  }

  private handleTextElementChange(element: TextElement, value: string): void {
    const deletedAnchorIDs = ElementService.getRemovedTextAnchorIDs(element, value);
    const refs = this.unitService.referenceManager.getTextAnchorReferences(deletedAnchorIDs);
    if (refs.length > 0) {
      this.dialogService.showDeleteReferenceDialog(refs)
        .subscribe((result: boolean) => {
          if (result) {
            ReferenceManager.deleteReferences(refs);
            element.setProperty('text', value);
          } else {
            this.messageService.showReferencePanel(refs);
          }
        });
    } else {
      element.setProperty('text', value);
    }
  }

  private handleClozeDocumentChange(element: ClozeElement, newValue: ClozeDocument): void {
    const deletedElements = ElementService.getRemovedClozeElements(element, newValue);
    const refs = this.unitService.referenceManager.getElementsReferences(deletedElements);
    if (refs.length > 0) {
      this.dialogService.showDeleteReferenceDialog(refs)
        .subscribe((result: boolean) => {
          if (result) {
            ReferenceManager.deleteReferences(refs);
            this.applyClozeDocumentChange(element, newValue);
          } else {
            this.messageService.showReferencePanel(refs);
          }
        });
    } else {
      this.applyClozeDocumentChange(element, newValue);
    }
  }

  private applyClozeDocumentChange(element: ClozeElement, value: ClozeDocument): void {
    element.setProperty('document', value);
    ClozeElement.getDocumentChildElements(value as ClozeDocument).forEach(clozeChild => {
      if (clozeChild.id === 'cloze-child-id-placeholder') {
        clozeChild.id = this.idService.getAndRegisterNewID(clozeChild.type);
        delete clozeChild.position;
      }
    });
  }

  alignElements(elements: PositionedUIElement[], alignmentDirection: 'left' | 'right' | 'top' | 'bottom'): void {
    switch (alignmentDirection) {
      case 'left':
        this.updateElementsProperty(
          elements,
          'xPosition',
          Math.min(...elements.map(element => element.position.xPosition))
        );
        break;
      case 'right':
        this.updateElementsProperty(
          elements,
          'xPosition',
          Math.max(...elements.map(element => element.position.xPosition))
        );
        break;
      case 'top':
        this.updateElementsProperty(
          elements,
          'yPosition',
          Math.min(...elements.map(element => element.position.yPosition))
        );
        break;
      case 'bottom':
        this.updateElementsProperty(
          elements,
          'yPosition',
          Math.max(...elements.map(element => element.position.yPosition))
        );
        break;
      // no default
    }
    this.unitService.elementPropertyUpdated.next();
    this.unitService.updateUnitDefinition();
  }

  showDefaultEditDialog(elementParam?: UIElement): void {
    const element = elementParam || this.selectionService.getSelectedElements()[0];
    switch (element.type) {
      case 'button':
      case 'dropdown':
      case 'checkbox':
      case 'radio':
        this.dialogService.showTextEditDialog(element.label as string).subscribe((result: string) => {
          if (result) {
            this.updateElementsProperty([element], 'label', result);
          }
        });
        break;
      case 'text':
        this.dialogService.showRichTextEditDialog(
          (element as TextElement).text,
          (element as TextElement).styling.fontSize
        ).subscribe((result: string) => {
          if (result) {
            // TODO add proper sanitization
            this.updateElementsProperty(
              [element],
              'text',
              (this.sanitizer.bypassSecurityTrustHtml(result) as any).changingThisBreaksApplicationSecurity as string
            );
          }
        });
        break;
      case 'cloze':
        this.dialogService.showClozeTextEditDialog(
          (element as ClozeElement).document,
          (element as ClozeElement).styling.fontSize
        ).subscribe((result: string) => {
          if (result) {
            // TODO add proper sanitization
            this.updateElementsProperty(
              [element],
              'document',
              (this.sanitizer.bypassSecurityTrustHtml(result) as any).changingThisBreaksApplicationSecurity as string
            );
          }
        });
        break;
      case 'text-field':
        this.dialogService.showTextEditDialog((element as InputElement).value as string)
          .subscribe((result: string) => {
            if (result) {
              this.updateElementsProperty([element], 'value', result);
            }
          });
        break;
      case 'text-area':
        this.dialogService.showMultilineTextEditDialog((element as InputElement).value as string)
          .subscribe((result: string) => {
            if (result) {
              this.updateElementsProperty([element], 'value', result);
            }
          });
        break;
      case 'audio':
      case 'video':
        if (this.unitService.expertMode) {
          this.dialogService.showPlayerEditDialog(element.id, (element as PlayerElement).player)
            .subscribe((result: PlayerProperties) => {
              if (!result) return;
              Object.keys(result).forEach(
                key => this.updateElementsPlayerProperty([element], key, result[key] as UIElementValue)
              );
            });
        }
        break;
      case 'table':
        this.dialogService.showTableEditDialog(element as TableElement)
          .subscribe((result: UIElement[]) => {
            if (result) {
              result.forEach(el => {
                if (el.id === 'id-placeholder') el.id = this.idService.getAndRegisterNewID(el.type);
              });
              this.updateElementsProperty([element], 'elements', result);
            }
          });
        break;
      // no default
    }
  }

  updateSelectedElementsStyleProperty(property: string, value: UIElementValue): void {
    const elements = this.selectionService.getSelectedElements();
    elements.forEach(element => {
      element.setStyleProperty(property, value);
    });
    this.unitService.elementPropertyUpdated.next();
    this.unitService.updateUnitDefinition();
  }

  updateElementsPlayerProperty(elements: UIElement[], property: string, value: UIElementValue): void {
    elements.forEach(element => {
      element.setPlayerProperty(property, value);
    });
    this.unitService.elementPropertyUpdated.next();
    this.unitService.updateUnitDefinition();
  }

  duplicateSelectedElements(): void {
    const selectedSection =
      this.unitService.unit.pages[this.selectionService.selectedPageIndex]
        .sections[this.selectionService.selectedSectionIndex];
    this.selectionService.getSelectedElements().forEach((element: UIElement) => {
      selectedSection.elements.push(this.duplicateElement(element, true) as PositionedUIElement);
    });
    this.unitService.updateUnitDefinition();
  }

  /* - Also changes position of the element to not cover copied element.
     - Also changes and registers all copied IDs. */
  duplicateElement(element: UIElement, adjustPosition: boolean = false): UIElement {
    const newElement = element.getDuplicate();

    if (newElement.position && adjustPosition) {
      newElement.position.xPosition += 10;
      newElement.position.yPosition += 10;
      newElement.position.gridRow = null;
      newElement.position.gridColumn = null;
    }

    newElement.id = this.idService.getAndRegisterNewID(newElement.type);
    if (newElement instanceof CompoundElement) {
      newElement.getChildElements().forEach((child: UIElement) => {
        child.id = this.idService.getAndRegisterNewID(child.type);
        if (child.type === 'drop-list') {
          (child.value as DragNDropValueObject[]).forEach(valueObject => {
            valueObject.id = this.idService.getAndRegisterNewID('value');
          });
        }
      });
    }

    // Special care with DropLists as they are no CompoundElement yet still have children with IDs
    if (newElement.type === 'drop-list') {
      (newElement.value as DragNDropValueObject[]).forEach(valueObject => {
        valueObject.id = this.idService.getAndRegisterNewID('value');
      });
    }
    return newElement;
  }

  static getRemovedTextAnchorIDs(element: TextElement, newValue: string): string[] {
    return TextElement.getAnchorIDs(element.text)
      .filter(el => !TextElement.getAnchorIDs(newValue).includes(el));
  }

  static getRemovedClozeElements(cloze: ClozeElement, newClozeDoc: ClozeDocument): UIElement[] {
    const newElements = ClozeElement.getDocumentChildElements(newClozeDoc);
    return cloze.getChildElements()
      .filter(element => !newElements.includes(element));
  }

  updateSelectedElementsPositionProperty(property: string, value: UIElementValue): void {
    this.updateElementsPositionProperty(this.selectionService.getSelectedElements(), property, value);
  }

  updateElementsPositionProperty(elements: UIElement[], property: string, value: UIElementValue): void {
    elements.forEach(element => {
      element.setPositionProperty(property, value);
    });
    this.reorderElements();
    this.unitService.elementPropertyUpdated.next();
    this.unitService.updateUnitDefinition();
  }

  updateElementsDimensionsProperty(elements: UIElement[], property: string, value: number | null): void {
    elements.forEach(element => {
      element.setDimensionsProperty(property, value);
      if (element.type === 'geometry') {
        this.unitService.geometryElementPropertyUpdated.next(element.id);
      }
    });
    this.unitService.elementPropertyUpdated.next();
    this.unitService.updateUnitDefinition();
  }

  /* Reorder elements by their position properties, so the tab order is correct */
  reorderElements() {
    const sectionElementList = this.unitService.unit.pages[this.selectionService.selectedPageIndex]
      .sections[this.selectionService.selectedSectionIndex].elements;
    const isDynamicPositioning = this.unitService.unit.pages[this.selectionService.selectedPageIndex]
      .sections[this.selectionService.selectedSectionIndex].dynamicPositioning;
    const sortDynamicPositioning = (a: PositionedUIElement, b: PositionedUIElement) => {
      const rowSort =
        (a.position.gridRow !== null ? a.position.gridRow : Infinity) -
        (b.position.gridRow !== null ? b.position.gridRow : Infinity);
      if (rowSort === 0) {
        return a.position.gridColumn! - b.position.gridColumn!;
      }
      return rowSort;
    };
    const sortStaticPositioning = (a: PositionedUIElement, b: PositionedUIElement) => {
      const ySort = a.position.yPosition! - b.position.yPosition!;
      if (ySort === 0) {
        return a.position.xPosition! - b.position.xPosition!;
      }
      return ySort;
    };
    if (isDynamicPositioning) {
      sectionElementList.sort(sortDynamicPositioning);
    } else {
      sectionElementList.sort(sortStaticPositioning);
    }
  }
}
