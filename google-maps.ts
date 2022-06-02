export default class MapFactory {
  protected currentCountry;
  protected allMarkers = [];

  private map;
  private bounds = new google.maps.LatLngBounds();
  private infoWindow = new google.maps.InfoWindow();

  public create(element, options = {}) {
    this.map = new google.maps.Map(element, options);
  }

  public centerByCountry(country) {
    this.currentCountry = country;
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: country }, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK && results?.[0]) {
        this.map.setCenter(results[0].geometry.location);
        this.map.fitBounds(results[0].geometry.viewport);
      }
    });
  }

  protected centerByBounds() {
    this.map.fitBounds(this.bounds);
  }

  public createMarker(lat, lng, options = {}) {
    const marker = new google.maps.Marker({
      map: this.map,
      position: { lat, lng },
      ...options
    });

    this.allMarkers.push(marker);
    this.bounds.extend(marker.position);

    return marker;
  }

  protected addListenerToMarker(marker, callback) {
    google.maps.event.addListener(marker, 'click', callback);
  }

  protected setInfoWindow(marker) {
    this.infoWindow.setContent(marker.info);
    this.infoWindow.open(this.map, marker);
  }

  protected clearMarkers() {
    this.allMarkers.map(marker => marker.setMap(null));
  }

  public setAutocompleteInput(element, options = {}) {
    return new google.maps.places.Autocomplete(element, {
      fields: ['address_components', 'geometry', 'name'],
      ...options
    });
  }
}
