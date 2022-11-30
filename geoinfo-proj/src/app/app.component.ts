import { Component, OnInit } from '@angular/core';
import { Map, View, Feature, Overlay } from 'ol/index';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import proj4 from 'proj4';
import OSM from 'ol/source/OSM';
import { register } from 'ol/proj/proj4.js';
import { fromLonLat, get as getProjection, toLonLat, transform } from 'ol/proj.js';
import { Point } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import { toStringHDMS } from 'ol/coordinate';

proj4.defs("EPSG:2056","+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs");
register(proj4);

declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
	map!: Map;

  ngOnInit(): void {
    this.map = new Map({
      view: new View({
        projection: getProjection('EPSG:2056')!,
        zoom: 10,
        center: transform([9.27436569350973, 47.385204974512554], 'EPSG:4326', 'EPSG:2056'),
      }),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: new VectorSource({
            features: [
              new Feature({
                geometry: new Point(transform([9.447170004777712, 47.450789004009884], 'EPSG:4326', 'EPSG:2056')),
                name: 'Remo Home'
              }),
              new Feature({
                geometry: new Point(transform([9.289203011348539, 47.38965348068075], 'EPSG:4326', 'EPSG:2056')),
                name: 'Geoinfo HQ'
              }),
            ],
          }),
          style: {
            'circle-radius': 9,
            'circle-fill-color': 'red',
          },
        }),
      ],
      target: 'map'
    });

		// Popup showing the position the user clicked
		const popup = new Overlay({
			element: document.getElementById("popup") || undefined
		});
		this.map.addOverlay(popup);

		this.map.on("click", function (evt) {
			const element = popup.getElement();
			const coordinate = evt.coordinate;
			const hdms = toStringHDMS(toLonLat(coordinate, 'EPSG:2056'));
      const feature = evt.map.getFeaturesAtPixel(evt.pixel)[0];
      $(element).popover("dispose");

      if (!feature) {
        return;
      }
      console.log('feature', feature, toLonLat(coordinate, 'EPSG:2056'))
			popup.setPosition(coordinate);
			$(element).popover({
				placement: "top",
				animation: true,
				html: true,
				content:
					`<p>The location you clicked was:<br/><br/>${feature.get('name')}</p><code>${hdms}</code>`
			});
			$(element).popover("show");
		});
	}
}
