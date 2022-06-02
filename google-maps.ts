export default class MapFactory {
  protected currentCountry;
  protected allMarkers = [];

  private options;
  private map;
  private bounds = new google.maps.LatLngBounds();
  private infoWindow = new google.maps.InfoWindow();

  constructor(options = {}) {
    this.options = options;
  }

  public create(element) {
    this.map = new google.maps.Map(element, this.options);
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
    const newMarker = new google.maps.Marker({
      map: this.map,
      position: { lat, lng },
      ...options,
    });

    this.allMarkers.push(newMarker);
    this.bounds.extend(newMarker.position);

    google.maps.event.addListener(
      newMarker,
      'click',
      ((marker) => {
        return () => {
          this.infoWindow.setContent(newMarker.info);
          this.infoWindow.open(this.map, marker);
        };
      })(newMarker)
    );
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