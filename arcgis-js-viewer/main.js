import './style.css';

import WebMap from "@arcgis/core/WebMap";
import Point from "@arcgis/core/geometry/Point";
import MapView from "@arcgis/core/views/MapView";
import Expand from "@arcgis/core/widgets/Expand";
import Zoom from "@arcgis/core/widgets/Zoom";

import { basemapGalleryExpand } from './basemaps.js';
import { searchWidgetExpand } from './locate.js';
import { aboutDialog } from './about-dialog.js';

document.querySelector('#header').innerHTML = `
  <div id="headertext" class="stretch">Voorbeeld GIS Viewer Nederland</div>
  <a id="gh-a" href="https://github.com/TWIAV/WebMaps/tree/main/arcgis-js-viewer" title="De broncode van deze applicatie staat op GitHub"><svg class="octicon octicon-mark-github v-align-middle" height="32" viewBox="0 0 16 16" version="1.1" width="32" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg></a>
`

const map = new WebMap({
  basemap: {
    portalItem: {
      id: "7aea6fa913a94176a1074edb40690318" // Topo RD
    }
  }
});

const rdOrigin = new Point({
  x: 155000,
  y: 463000,
  spatialReference: 28992
});

const view = new MapView({
  spatialReference: 28992, 
  container: "viewDiv",
  map: map,
  center: rdOrigin,
  zoom: 3
});

basemapGalleryExpand.view = view;
basemapGalleryExpand.content.view = view;
view.ui.add([basemapGalleryExpand], "top-right");

basemapGalleryExpand.content.watch('activeBasemap', 
  (newBasemap) => 
  console.log(basemapGalleryExpand.content.source.basemaps.indexOf(newBasemap) + ': ' + map.basemap.id)
);

searchWidgetExpand.view = view; 
searchWidgetExpand.content.view = view; 
view.ui.add([searchWidgetExpand], "bottom-right");

view.when(function() {
  aboutDialog.style.display = 'block'
});

const aboutExpand = new Expand({
  expandIconClass: "esri-icon-lightbulb",
  expandTooltip: "Over deze applicatie",
  view: view,
  expanded: true,
  content: aboutDialog,
  group: "expandable-widgets"
});

view.ui.components = [ "attribution" ];

const zoom = new Zoom({view: view});

view.ui.add([aboutExpand, zoom], "top-left");

view.on("click", () => {
  aboutExpand.expanded = false;
});