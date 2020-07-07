import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { transform } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import VectorImageLayer from 'ol/layer/VectorImage';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style, Text, Image, Circle } from 'ol/style';
import Select from 'ol/interaction/Select';
import {click, pointerMove, altKeyOnly} from 'ol/events/condition';
import Overlay from 'ol/Overlay'

import $ from 'jquery';

import { tree, leaveIDs } from './load_tree';

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
            zoom: 4 // set to 5 to center on Italy
        })
    });

    // Popup overlay
    var popup = new Overlay({
        element: document.getElementById('popup')
    });
    map.addOverlay(popup);

    // STILI
    var pointStyle = new Style({
        image: new Circle({
            radius: 6,
            fill: new Fill({color: '#9BB7BF'}),
            stroke: new Stroke({color: '#00695C', width: 1.5})
        })
    });

    var pointStyle_sel_mouseover = new Style({
        image: new Circle({
            radius: 8,
            fill: new Fill({color: 'rgba(255,187,51,0.25)'}),
            stroke: new Stroke({color: '#FFBB33', width: 3})
        })
    });

    var pointStyle_sel_click = new Style({
        image: new Circle({
            radius: 6,
            fill: new Fill({color: '#FFBB33'}),
            stroke: new Stroke({color: '#FF8800', width: 3})
        })
    });

    // LAYER
    var pointLayer = new VectorImageLayer({
        source: new VectorSource({
            format: new GeoJSON()
        }),
        style: function(feature) {
    	    return pointStyle;
        }
    });
    pointLayer.set('name','Punti');
    pointLayer.setZIndex(10);
    map.addLayer(pointLayer);

    map.on('pointermove', function(e){
        if (e.dragging) return;
        var pixel = e.map.getEventPixel(e.originalEvent);
        var hit = e.map.forEachFeatureAtPixel(pixel, function (feature, layer) {
            if (layer){
                var coordinate = e.coordinate;
                popup.setPosition(coordinate);
                var popupContent = document.getElementById('popup-content');
                if (layer.get('name')=='Punti'){
                    popupContent.innerHTML = "<p class='text-warning'><strong>"+feature.getProperties().codice+"</strong></p>"
                                            + "<span class='text-white'>Sampling date: "+feature.get('data')+"</span>"
                                            + "<br/><span class='text-white'>Matrix: "+parseNull(feature.getProperties().matrice)+"</span>"
                                            + "<br/><span class='text-white'>AMR: "+parseNull(feature.getProperties().amr)+"</span>"
                                            + "<br/><span class='text-white'>Sequence Type (MSLT): "+parseNull(feature.getProperties().mslt)+"</span>"
                                            + "<br/><span class='text-white'>Pulsotype (PFGE): "+parseNull(feature.getProperties().pulsotipo)+"</span>"
                }
                return layer.get('name') === 'Punti'
            }
        });
        if (hit){
            e.map.getTargetElement().style.cursor = 'pointer';
        } else {
            popup.setPosition(undefined);
            e.map.getTargetElement().style.cursor = '';
        }
    });

    const parseNull = (value) => {
        if (value == null){
            return "-";
        } else {
            return value;
        }
    };

    if (points) { 

        if (pointLayer.getSource().getFeatures().length != 0){
			pointLayer.getSource().clear();
        }
        
        // POPOLA IL LAYER
        // *******************************************
        $.getJSON(points, function(data) {
            var featureCollection = new GeoJSON({featureProjection:'EPSG:3857'}).readFeatures(data);
			pointLayer.getSource().addFeatures(featureCollection);
			pointLayer.setZIndex(10);
			// Fit extent del layer
			/* var extent = pointLayer.getSource().getExtent();
			map.getView().fit(extent, map.getSize()); */
        });
        
        // SELEZIONE "MOUSEOVER" da mappa verso albero
        // *******************************************
        var pointSelect_mouseover = new Select({
            layers:[ pointLayer ],
            condition: pointerMove,
            style: function(feature){
                return pointStyle_sel_mouseover;
            }
        });

        // Attiva interazione mouseover
		map.addInteraction(pointSelect_mouseover);
		pointSelect_mouseover.setActive(true);
        
        pointSelect_mouseover.getFeatures().on('add',function(evt){
            // Codice del punto evidenziato
            if (evt.element.getProperties().codice){
                var codice = evt.element.getProperties().codice;
            } else {
                var codice = evt.element.getProperties().CODICE;
            }
            // Highlight del leave corrispondente sull'albero
            tree.leaves[leaveIDs.indexOf(codice)].highlighted = true;
            tree.draw();
            
            // showFeatureInfo(evt);
        });
        
        pointSelect_mouseover.getFeatures().on('remove',function(evt){
            // Codice del punto non piu evidenziato
            if (evt.element.getProperties().codice){
                var codice = evt.element.getProperties().codice;
            } else {
                var codice = evt.element.getProperties().CODICE;
            }
            // Rimuove highlight del leave
            tree.leaves[leaveIDs.indexOf(codice)].highlighted = false;
            tree.draw();
            
            // featureInfoPanel.close();
        });

        // SELEZIONE "MOUSEOVER" da albero verso mappa
        // *******************************************
        tree.on('mousemove',function(evt){
            var hovered = [];
            $.each(tree.leaves,function(i,leave){
                if (leave.hovered != false){
                    //console.log(leave.id)
                    hovered.push(leave.id);
                }
            });
            
            pointSelect_mouseover.getFeatures().clear();
            
            if (hovered.length > 0) {
                pointLayer.getSource().forEachFeature(function(feature){
                    if (feature.get('codice') == hovered[0]){
                        pointSelect_mouseover.getFeatures().push(feature);
                    }
                    if (feature.get('CODICE') == hovered[0]){
                        pointSelect_mouseover.getFeatures().push(feature);
                    }
                });
            };
        });

        // SELEZIONE "MOUSECLICK" da mappa verso albero
        // *******************************************
        var pointSelect_click = new Select({
            layers:[ pointLayer ],
            condition: click,
            style: function(feature){
                return pointStyle_sel_click;
            }
        });

        // Attiva interazione mouseover
		map.addInteraction(pointSelect_click);
        pointSelect_click.setActive(true);
        
        pointSelect_click.getFeatures().on('add',function(evt){
            // Codice del punto selezionato
            if (evt.element.getProperties().codice){
                var codice = evt.element.getProperties().codice;
            } else {
                var codice = evt.element.getProperties().CODICE;
            }
            // Selezione del leave corrispondente sull'albero
            tree.branches[codice].selected = true;
            tree.draw();
        });
        
        pointSelect_click.getFeatures().on('remove',function(evt){
            // Codice del punto non piu selezionato
            if (evt.element.getProperties().codice){
                var codice = evt.element.getProperties().codice;
            } else {
                var codice = evt.element.getProperties().CODICE;
            }
            // Rimuove selezione del leave
            tree.clearSelect();
        });

        // SELEZIONE "MOUSECLICK" da albero verso mappa
        // *******************************************
        tree.on("updated",function({property,nodeIds}){
            // sconsole.log(property,nodeIds);
            pointSelect_click.getFeatures().clear();
            // Selezione dei punti sulla mappa
            if (nodeIds.length > 0){
                pointLayer.getSource().forEachFeature(function(feature){
                    $.each(nodeIds,function(i,node){
                        if (feature.get('codice') == node){
                            pointSelect_click.getFeatures().push(feature);
                        }
                        if (feature.get('CODICE') == node){
                            pointSelect_click.getFeatures().push(feature);
                        } 
                    });
                });
            } else {
                pointSelect_click.getFeatures().clear();
            }
        });

    } else {
        console.log('Nessun file di punti')
    }
}

export { createMap }