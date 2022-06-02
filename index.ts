/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import data from './data';

/*
 function initMap(): void {
   const myLatLng = { lat: -25.363, lng: 131.044 };
 
   const map = new google.maps.Map(
     document.getElementById("map") as HTMLElement,
     {
       zoom: 4,
       center: myLatLng,
     }
   );
 
   new google.maps.Marker({
     position: myLatLng,
     map,
     title: "Hello World!",
   });
 }
 
 declare global {
   interface Window {
     initMap: () => void;
   }
 }
 window.initMap = initMap;
 */

class MapFactory {
  private options;
  private map;
  protected currentCountry;
  protected allMarkers = [];

  constructor(options = {}) {
    this.options = options;
  }

  public create(element) {
    this.map = new google.maps.Map(element, this.options);
  }

  public centerByCountryName(countryName) {
    const geocoder = new google.maps.Geocoder();
    this.currentCountry = countryName;

    geocoder.geocode({ address: countryName }, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK && results?.[0]) {
        this.map.setCenter(results[0].geometry.location);
        this.map.fitBounds(results[0].geometry.viewport);
      }
    });
  }

  public createMarker(lat, lng, options = {}) {
    const newMarker = new google.maps.Marker({
      map: this.map,
      position: { lat, lng },
      ...options,
    });

    this.allMarkers.push(newMarker);
  }

  protected clearMarkers() {
    this.allMarkers.map((marker) => marker.setMap(null));
  }

  public setAutocompleteInput(element, options = {}) {
    return new google.maps.places.Autocomplete(element, {
      fields: ['address_components', 'geometry', 'name'],
      ...options,
    });
  }
}

class SalesMap extends MapFactory {
  private markersType = {
    default: '#e2001a',
    shopping: '#767576',
    partner: '#025a5a',
  };

  private markerIcon = {
    path: 'M 12 2.016 q 2.906 0 4.945 2.039 t 2.039 4.945 q 0 1.453 -0.727 3.328 t -1.758 3.516 t -2.039 3.07 t -1.711 2.273 l -0.75 0.797 q -0.281 -0.328 -0.75 -0.867 t -1.688 -2.156 t -2.133 -3.141 t -1.664 -3.445 t -0.75 -3.375 q 0 -2.906 2.039 -4.945 t 4.945 -2.039',
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: '#fff',
    rotation: 0,
    scale: 1.5,
    anchor: new google.maps.Point(12, 30),
  };

  private standorts = [
    {
      id: 4,
      title: 'DE - Verkaufsbüro Stuttgart (04)',
      plzBereiche: [
        [70000, 71999],
        [72600, 72699],
        [73000, 74699],
        [75000, 75038],
        [75305, 75999],
        [75046, 75050],
        [75054, 75196],
        [75201, 75249],
      ],
    },
    {
      id: 5,
      title: 'DE - Verkaufsbüro Saar / Pfalz / Rhein-Neckar (05)',
      plzBereiche: [
        [69460, 69469],
        [68650, 69239],
        [69484, 69493],
        [54000, 54999],
        [55600, 55999],
        [56800, 56999],
        [66000, 66999],
        [67000, 67199],
        [67320, 67499],
        [67600, 67799],
        [67830, 67999],
        [68000, 68599],
        [69503, 69509],
        [69515, 69999],
        [69243, 69411],
        [76708, 76764],
        [76650, 76669],
        [76705, 76706],
        [76769, 76774],
        [76780, 76999],
      ],
    },
  ];

  constructor() {
    super();
  }

  private getStandortByZipcode(zipcode) {
    const searchZipcode = parseInt(zipcode, 10);
    let result;

    this.standorts.map((standort) => {
      standort.plzBereiche.map((plzBereich) => {
        if (searchZipcode >= plzBereich[0] && searchZipcode <= plzBereich[1]) {
          result = standort;
        }
      });
    });

    return result;
  }

  public createMarkers(markers = []) {
    markers.map(({ lat, lng, title, type }) => {
      const fillColor = this.markersType?.[type] || this.markersType.default;

      super.createMarker(lat, lng, {
        title,
        icon: {
          ...this.markerIcon,
          fillColor,
        },
      });
    });
  }

  public filterMarkersByType(type, markers = []) {
    if (!type) return markers;

    return markers.filter((m) => m.type === type);
  }

  public filterMarkersByCountry(country, markers = []) {
    if (!country) return markers;

    return markers.filter((m) => m.country === country);
  }

  public filterMarkersByZipcode(zipcode, markers = []) {
    if (!zipcode) return markers;

    const standort = this.getStandortByZipcode(zipcode);
    return markers.reduce((prev, curr) => {
      const searchZipcode = parseInt(curr.zipcode, 10);

      standort.plzBereiche.map((plzBereich) => {
        if (searchZipcode >= plzBereich[0] && searchZipcode <= plzBereich[1]) {
          prev.push(curr);
        }
      });

      return prev;
    }, []);
  }

  public updateMarkers(markers = []) {
    super.clearMarkers();
    // Centrar según markers
    this.createMarkers(markers);
  }

  public changeCountry(country) {
    console.log(super.currentCountry);
    if (super.currentCountry !== country) {
      /**
       * 1. limpiar markers
       * 2. centrar el país
       * 3. filtrar markers
       * 4. crear markers
       */
    }
  }
}

function initMap(): void {
  const mapContainer = document.getElementById('map');
  const searchInput = document.querySelector('[name="autocomplete"]');
  const salesMap = new SalesMap();

  salesMap.create(mapContainer);
  salesMap.centerByCountryName('Germany');
  const filteredData = salesMap.filterMarkersByCountry('de', data);
  salesMap.createMarkers(filteredData);
  // const filteredData = salesMap.filterMarkersByType('partner', data);
  // salesMap.createMarkers(filteredData);

  const autocompleteInput = salesMap.setAutocompleteInput(searchInput, {
    componentRestrictions: { country: ['DE'] },
    types: ['(regions)'],
  });

  autocompleteInput.addListener('place_changed', async () => {
    const { name } = autocompleteInput.getPlace();
    const filteredData = salesMap.filterMarkersByZipcode(name, data);
    console.log(filteredData);
    salesMap.updateMarkers(filteredData);
  });

  /**
    * Multiple maps
    * 
   const mapContainer2 = document.getElementById('map2');
   const salesMap2 = new SalesMap();
 
   salesMap2.create(mapContainer2);
   salesMap2.centerByCountryName('Peru');
   */

  document.querySelector('#clearButton')?.addEventListener('click', () => {
    salesMap.updateMarkers();
  });

  document.querySelector('#changeCountry')?.addEventListener('click', () => {
    salesMap.changeCountry('Brazil');
  });
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;

export {};
