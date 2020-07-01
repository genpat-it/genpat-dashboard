import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { transform } from 'ol/proj';
import Projection from 'ol/proj/Projection';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

const createMap = (points) => {
    var map = new Map({
        target: 'map',
        layers: [
            new TileLayer({
                source: new OSM()
            })
        ],
        view: new View({
            projection: 'EPSG:3857',
            center: transform([13, 42], 'EPSG:4326', 'EPSG:3857'),
            zoom: 5 // set to 5 to center on Italy
        })
    });

    if (points) { 

    } else {
        console.log('Nessun file di punti')
    }
}

export { createMap }