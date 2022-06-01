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

  constructor(options = {}) {
    this.options = options;
  }

  public create(element) {
    this.map = new google.maps.Map(element, this.options);
  }

  public centerByCountryName(countryName) {
    const _self = this;
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: countryName }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK && results?.[0]) {
        _self.map.setCenter(results[0].geometry.location);
        _self.map.fitBounds(results[0].geometry.viewport);
      }
    });
  }

  public createMarkers(markers = []) {
    const _self = this;
    markers.map((marker) => {
      new google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map: _self.map,
        title: marker.title,
        icon: {
          ..._self.markerIcon,
          fillColor:
            _self.markersType?.[marker.type] || _self.markersType.default,
        },
      });
    });
  }

  public createFilteredMarkersByType(type, markers = []) {
    if (!type) return this.createMarkers(markers);

    const filteredMarkers = markers.filter((m) => m.type === type);
    return this.createMarkers(filteredMarkers);
  }
}

document.addEventListener('DOMContentLoaded', (event) => {
  const mapContainer = document.getElementById('map');
  const SalesMap = new MapFactory();

  SalesMap.create(mapContainer);
  SalesMap.centerByCountryName('Germany');
  //SalesMap.createMarkers(data);
  SalesMap.createFilteredMarkersByType('partner', data);
});

export {};
