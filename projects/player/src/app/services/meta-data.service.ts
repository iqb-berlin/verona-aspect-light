import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { VopMetaData } from '../models/verona';

@Injectable({
  providedIn: 'root'
})
export class MetaDataService {
  playerMetadata!: VopMetaData;

  constructor(@Inject(DOCUMENT) private document: Document) {
    const playerMetadata: NamedNodeMap = document.querySelectorAll('meta')[1].attributes;
    this.playerMetadata = {
      apiVersion:
        playerMetadata.getNamedItem('data-api-version')?.value || '',
      notSupportedApiFeatures:
        playerMetadata.getNamedItem('data-not-supported-api-features')?.value,
      supportedUnitDefinitionTypes:
        playerMetadata.getNamedItem('data-supported-unit-definition-types')?.value,
      supportedUnitStateDataTypes:
        playerMetadata.getNamedItem('data-supported-unit-state-data-types')?.value
    };
  }

  verifyUnitDefinitionVersion(unitDefinition: string | undefined): boolean {
    return (!!unitDefinition && unitDefinition === this.playerMetadata.supportedUnitDefinitionTypes);
  }

  verifyUnitStateDataType(unitStateDataType: string | undefined): boolean {
    return (!!unitStateDataType && unitStateDataType === this.playerMetadata.supportedUnitStateDataTypes);
  }
}
