import './style.css';

import WebMap from "@arcgis/core/WebMap";
import Point from "@arcgis/core/geometry/Point";
import MapView from "@arcgis/core/views/MapView";
import Zoom from "@arcgis/core/widgets/Zoom";
import Home from "@arcgis/core/widgets/Home";
import Viewpoint from "@arcgis/core/Viewpoint";
import * as watchUtils from "@arcgis/core/core/watchUtils";

import { basemapGalleryExpand } from './basemaps.js';
import { searchWidgetExpand } from './locate.js';
import { aboutDialogExpand } from './about-dialog.js';

document.querySelector('#header').innerHTML = `
  <div id="headertext" class="stretch">Voorbeeld GIS Viewer Nederland</div>
  <a id="gh-a" href="https://github.com/TWIAV/WebMaps/tree/main/arcgis-js-viewer" target="newTab" title="De broncode van deze applicatie staat op GitHub"><svg class="octicon octicon-mark-github v-align-middle" height="32" viewBox="0 0 16 16" version="1.1" width="32" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg></a>
`

if ('URLSearchParams' in window) { // URLSearchParams is not supported by Internet Explorer
  var url = new URL(document.URL);
  var search_params = url.searchParams;
};

const map = new WebMap();

const baseMaps = basemapGalleryExpand.content.source.basemaps;

if(search_params.has('b')) {
  var basemapSetting = search_params.get('b');
} else {
  var basemapSetting = 'topo';
};

map.basemap = baseMaps.find(function(baseMap) {
  return baseMap.id === basemapSetting;
});

var xHome = 155000;
var yHome = 463000;
var zoomHome = 3;
var scaleHome = 1536000;

var rdX = xHome;
var rdY = yHome;
var zoomLevel = zoomHome;

if(search_params.has('x') && search_params.has('y') && search_params.has('n')) {
  var rdX = parseInt(search_params.get('x'));
  var rdY = parseInt(search_params.get('y'));
  var zoomLevel = parseInt(search_params.get('n'));
};

let view = new MapView({
  spatialReference: 28992, 
  container: "viewDiv",
  map: map,
  center: new Point({x: rdX, y: rdY, spatialReference: 28992}),
  zoom: zoomLevel,
  popup: {
    defaultPopupTemplateEnabled: true
  }
});

basemapGalleryExpand.view = view;
basemapGalleryExpand.content.view = view;
view.ui.add([basemapGalleryExpand], "top-right");

searchWidgetExpand.view = view; 
searchWidgetExpand.content.view = view; 
view.ui.add([searchWidgetExpand], "bottom-right");

view.ui.components = [ "attribution" ];

const zoom = new Zoom({view: view});

view.when(function() {
  aboutDialogExpand.content.style.display = 'block'
});

aboutDialogExpand.view = view;

let home = new Home({
  view: view,
  viewpoint: new Viewpoint({targetGeometry: new Point({x: xHome, y: yHome, spatialReference: 28992}), scale: scaleHome})
});

view.ui.add([aboutDialogExpand, zoom, home], "top-left");

view.on("click", () => {
  aboutDialogExpand.expanded = false;
});

//pas de url aan met nieuwe coördinaten en zoomlevel
function modifySearchParams() {
  if ('URLSearchParams' in window) { // URLSearchParams is not supported by Internet Explorer

    let rdXnew = parseInt(view.center.x);
    let rdYnew = parseInt(view.center.y);
    let zoomLevelnew = view.zoom;
    let basemapSettingnew = map.basemap.id;

    if (map.basemap.id != 'brtachtergrondkaart') { // this trick doesn't work for the PDOK brtachtergrondkaart due to a different tiling scheme
      search_params.set('x', rdXnew);
      search_params.set('y', rdYnew);
      search_params.set('n', zoomLevelnew);
      search_params.set('b', basemapSettingnew);
    } else {
      search_params.delete('x');
      search_params.delete('y');
      search_params.delete('n');
      search_params.delete('b');
    }

    // change the search property of the main url
    url.search = search_params.toString();
    
    // the new url string
    var new_url = url.toString();

    history.replaceState(null, '', new_url);
  }
}

watchUtils.whenTrue(view, "stationary", function() {
  modifySearchParams();
console.log(view.scale);
});

basemapGalleryExpand.content.watch('activeBasemap', 
  (newBasemap) => 
  // Each time the value of map.basemap changes, the url string is modified
  modifySearchParams()
);