import './style.css';

import WebMap from "@arcgis/core/WebMap";
import Point from "@arcgis/core/geometry/Point";
import MapView from "@arcgis/core/views/MapView";
import Zoom from "@arcgis/core/widgets/Zoom";
import Home from "@arcgis/core/widgets/Home";
import Viewpoint from "@arcgis/core/Viewpoint";
import Compass from "@arcgis/core/widgets/Compass";
import * as watchUtils from "@arcgis/core/core/watchUtils";
import * as projection from "@arcgis/core/geometry/projection";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import Graphic from "@arcgis/core/Graphic";
import Expand from "@arcgis/core/widgets/Expand";

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

view.when(function() {
  aboutDialogExpand.content.style.display = 'block';
});

aboutDialogExpand.view = view;

const zoom = new Zoom({view: view});

let home = new Home({
  view: view,
  viewpoint: new Viewpoint({targetGeometry: new Point({x: xHome, y: yHome, spatialReference: 28992}), scale: scaleHome})
});

view.ui.add([aboutDialogExpand, zoom, home], "top-left");

view.on("click", () => {
  aboutDialogExpand.expanded = false;
});

var compassWidget = new Compass({
  view: view
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
  if (view.rotation == 0){
    view.ui.remove(compassWidget);
  } else {
    view.ui.add(compassWidget, "top-left");
  }
});

basemapGalleryExpand.content.watch('activeBasemap', 
  (newBasemap) => 
  // Each time the value of map.basemap changes, the url string is modified
  modifySearchParams()
);

//*********************************************************************************************
//* Begin Go to XY
//*********************************************************************************************
let simpleMarkerSymbol = {
  type: "simple-marker",
  style: "triangle",
  angle: 180,
  size: 16,
  yoffset: 8, // De onderste punt van de driehoek wijst naar de locatie met de opgegeven coördinaten
  color: [255, 0, 0],
  outline: {
    color: [255, 255, 255],
    width: 2
  }
};

// Maak een Graphic aan zonder geometrie - deze wordt later toegevoegd
let xyMarkerOnTheMap = new Graphic({
  symbol: simpleMarkerSymbol
});

// Voeg de 'onzichtbare' Graphic toe aan de view
view.graphics.add(xyMarkerOnTheMap);

const coordDialog = document.createElement('div');
coordDialog.id = 'coordinatesDiv';

coordDialog.innerHTML = `
  <div class="dialogDiv" id="rdCoordinatesDiv" style="display:none">
    <div class="dialogHeader">Ga naar locatie - RD</div>
  <form id="rdCoordinatesForm">
    <table>
      <tr>
        <td>
          <fieldset>
            <legend>RD-coördinaten (EPSG: 28992)</legend>
            <div class="labelDiv">
              <label for="rdXCoordinate">X-coördinaat:</label>
            </div>
            <div class="uiDiv">
              <input id="rdXCoordinate" type="number" name="rdXCoordinate" step="0.001" min="10000" max="290000" placeholder="Eenheid: meters" required>
              <span class="validity"></span>
            </div>
            <div class="labelDiv">
              <label for="rdYCoordinate">Y-coördinaat:</label>
            </div>
            <div class="uiDiv">
              <input id="rdYCoordinate" type="number" name="rdYCoordinate" step="0.001" min="300000" max="620000" placeholder="Eenheid: meters" required>
              <span class="validity"></span>
            </div>
          </fieldset>
        </td>
        <td style="vertical-align: top;">
          <fieldset>
            <legend>Instellingen</legend>
            <div class="uiDiv">
              <input type="checkbox" id="cbKeepScaleRD" name="cbKeepScale" class="cbKeepScale" tabindex="-1">
              <label for="cbKeepScale">Schaal behouden</label>
            </div>
            <div class="uiDiv">
              <input type="checkbox" id="cbPlaceMarkerRD" name="cbPlaceMarker" class="cbPlaceMarker" tabindex="-1">
              <label for="cbPlaceMarker">Plaats markering</label>
            </div>
          </fieldset>
            <div class="uiDiv">
              <input type="button" value="Switch naar WGS84" id="switchrdtowgs84" name="switchrdtowgs84" class="coordswitch action-button" tabindex="-1">
            </div>
        </td>
      </tr>
    </table>
    <div class="uiDiv">
      <input type="submit" class="action-button" value="Ga naar locatie">
    </div>
  </form>
  </div>
  <div class="dialogDiv" id="wgs84CoordinatesDiv" style="display:none">
    <div class="dialogHeader">Ga naar locatie - WGS84</div>
  <form id="wgs84CoordinatesForm">
    <table>
      <tr>
        <td>
          <fieldset>
            <legend>WGS84-coördinaten (EPSG: 4326)</legend>
            <div class="labelDiv">
              <label for="wgs84LatCoordinate">Noorderbreedte:</label>
            </div>
            <div class="uiDiv">
              <input id="wgs84LatCoordinate" type="number" name="wgs84LatCoordinate" step="0.0000000000000001" min="50.7500" max="53.4700" placeholder="Eenheid: decimale graden" required>
              <span class="validity"></span>
            </div>
            <div class="labelDiv">
              <label for="wgs84LonCoordinate">Oosterlengte:</label>
            </div>
            <div class="uiDiv">
              <input id="wgs84LonCoordinate" type="number" name="wgs84LonCoordinate" step="0.0000000000000001" min="3.3700" max="7.2100" placeholder="Eenheid: decimale graden" required>
              <span class="validity"></span>
            </div>
          </fieldset>
        </td>
        <td style="vertical-align: top;">
          <fieldset>
            <legend>Instellingen</legend>
            <div class="uiDiv">
              <input type="checkbox" id="cbKeepScaleWGS84" name="cbKeepScale" class="cbKeepScale" tabindex="-1">
              <label for="cbKeepScale">Schaal behouden</label>
            </div>
            <div class="uiDiv">
              <input type="checkbox" id="cbPlaceMarkerWGS84" name="cbPlaceMarker" class="cbPlaceMarker" tabindex="-1">
              <label for="cbPlaceMarker">Plaats markering</label>
            </div>
          </fieldset>
            <div class="uiDiv">
              <input type="button" value="Switch naar RD" id="switchwgs84tord" name="switchwgs84tord" class="coordswitch action-button" tabindex="-1">
            </div>
        </td>
      </tr>
    </table>
    <div class="uiDiv">
      <input type="submit" class="action-button" value="Ga naar locatie">
    </div>
  </form>
  </div>
`

projection.load(); // wordt gebruikt voor conversie van WGS84 naar RD

document.getElementsByTagName('body')[0].appendChild(coordDialog);

let coordDialogExpand = new Expand({
  expandIconClass: "esri-icon-map-pin",
  expandTooltip: "Ga naar locatie",
  view: view,
  content: coordDialog,
  group: "expandable-widgets"
});

view.ui.add([coordDialogExpand], "top-right");

let placeMarker = true;
let keepScale = false;
let spatRef = "srrd"; // Opties voor het dialoogvenster zijn RD ("srrd") of WGS84 ("srwgs84")

const sr_rd = new SpatialReference({wkid:28992});
const sr_wgs84 = new SpatialReference({wkid:4326});

document.getElementById("cbKeepScaleRD").checked = keepScale;
document.getElementById("cbPlaceMarkerRD").checked = placeMarker;

// Event Listeners
document.getElementById("rdCoordinatesForm").addEventListener("submit", goToRDXY);
document.getElementById("wgs84CoordinatesForm").addEventListener("submit", goToWGS84LonLat);

// Functies
function goToRDXY (event) {
  event.preventDefault() // De preventDefault() method wordt hier gebruikt om te voorkomen dat het formulier gesubmit wordt. Input wordt lokaal - in deze functie - verwerkt.
  xyMarkerOnTheMap.geometry = null;
  let rdX = document.getElementById("rdXCoordinate").value;
  let rdY = document.getElementById("rdYCoordinate").value;
  let target = new Point({x: parseFloat(rdX), y: parseFloat(rdY), spatialReference: 28992}); // Maak een puntobject aan in RD
  if (placeMarker) {
    xyMarkerOnTheMap.geometry = target;
  }
  if (keepScale) {
    view.goTo({target: target});
  } else {
    view.goTo({target: target, zoom: 13});
  }
}

function goToWGS84LonLat(event) {
  event.preventDefault() // De preventDefault() method wordt hier gebruikt om te voorkomen dat het formulier gesubmit wordt. Input wordt lokaal - in deze functie - verwerkt.
  xyMarkerOnTheMap.geometry = null;
  let wgs84Lon = document.getElementById("wgs84LonCoordinate").value;
  let wgs84Lat = document.getElementById("wgs84LatCoordinate").value;
  let target = new Point({longitude: parseFloat(wgs84Lon), latitude: parseFloat(wgs84Lat), spatialReference: 4326}); // Maak een puntobject aan in WGS84
  let transformationWGS84toRD = projection.getTransformation(sr_wgs84, sr_rd);
  target = projection.project(target, sr_rd, transformationWGS84toRD);  // Converteer het puntobject naar RD
  if (placeMarker) {
    xyMarkerOnTheMap.geometry = target;
  }
  if (keepScale) {
    view.goTo({target: target});
  } else {
    view.goTo({target: target, zoom: 13});
  }
}

let cbsPlaceMarker = document.getElementsByClassName("cbPlaceMarker");

for (let i = 0; i < cbsPlaceMarker.length; i++) {
  cbsPlaceMarker[i].addEventListener("change", function() {
    placeMarker = this.checked ? true : false;
  });
}

let cbsKeepScale = document.getElementsByClassName("cbKeepScale");

for (let i = 0; i < cbsKeepScale.length; i++) {
  cbsKeepScale[i].addEventListener("change", function() {
    keepScale = this.checked ? true : false;
  });
}

let l_rdCoordinatesDiv = document.getElementById("rdCoordinatesDiv");
let l_wgs84CoordinatesDiv = document.getElementById("wgs84CoordinatesDiv");
let cbsCoordSwitch = document.getElementsByClassName("coordswitch");

for (let i = 0; i < cbsCoordSwitch.length; i++) {
  cbsCoordSwitch[i].addEventListener("click", function() {
    if (spatRef == "srrd") {
      l_rdCoordinatesDiv.style.display = "none";
      l_wgs84CoordinatesDiv.style.display = "block";
      document.getElementById("wgs84LatCoordinate").focus();
      document.getElementById("cbKeepScaleWGS84").checked = keepScale;
      document.getElementById("cbPlaceMarkerWGS84").checked = placeMarker;
      spatRef = "srwgs84";
    } else if (spatRef == "srwgs84") {
      l_wgs84CoordinatesDiv.style.display = "none";
      l_rdCoordinatesDiv.style.display = "block";
      document.getElementById("rdXCoordinate").focus();
      document.getElementById("cbKeepScaleRD").checked = keepScale;
      document.getElementById("cbPlaceMarkerRD").checked = placeMarker;
      spatRef = "srrd";
    }
  });
}

view.when(function() {
  document.getElementById("rdCoordinatesDiv").style.display = "block";
});

//*********************************************************************************************
//* End Go to XY
//*********************************************************************************************
