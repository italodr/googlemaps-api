/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import SalesMap from './sales-map';
import { locations } from './data';

function initMap(): void {
  const mapContainer = document.getElementById('map');
  const searchInput = document.querySelector('[name="autocomplete"]');
  const salesMap = new SalesMap();

  salesMap.create(mapContainer);
  salesMap.setCountry('de');

  /**
    * Multiple maps
    * 
   const mapContainer2 = document.getElementById('map2');
   const salesMap2 = new SalesMap();
 
   salesMap2.create(mapContainer2);
   salesMap2.setCountry('sp');
   */

  const autocompleteInput = salesMap.setAutocompleteInput(searchInput, {
    componentRestrictions: { country: ['DE'] },
    types: ['(regions)'],
  });

  autocompleteInput.addListener('place_changed', async () => {
    const { name } = autocompleteInput.getPlace();
    const filteredData = salesMap.filterMarkersByZipcode(name, locations);

    salesMap.updateMarkers(filteredData);
  });

  const types = Array.from(document.querySelectorAll('.types li'));

  types.map((element) => {
    element.addEventListener('click', (event) => {
      const { type } = event.currentTarget.dataset;
      const filteredData = salesMap.filterMarkersByType(type, locations);

      salesMap.updateMarkers(filteredData);
    });
  });

  document.querySelector('#clearButton')?.addEventListener('click', () => {
    salesMap.updateMarkers();
  });

  document
    .querySelector('#changeCountry')
    ?.addEventListener('change', (event) => {
      salesMap.setCountry(event.currentTarget.value);
    });
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;

export {};
