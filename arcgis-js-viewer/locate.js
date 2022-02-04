import Search from "@arcgis/core/widgets/Search";
import Expand from "@arcgis/core/widgets/Expand";

const searchWidget = new Search({
  includeDefaultSources: false
});

searchWidget.sources = [{
  url: "https://services.arcgisonline.nl/arcgis/rest/services/Geocoder_BAG_RD/GeocodeServer", // GeocodeServer van Esri Nederland
  singleLineFieldName: "SingleLine", // Deze optie zorgt er voor dat je kunt zoeken op postcode/huisnummer combinatie, bijvoorbeeld: 4181 AE 38
  name: "Adressen in Nederland",
  placeholder: "Zoek adres"
},{
  url: "https://geocoder.arcgisonline.nl/arcgis/rest/services/Geocoder_DKK/GeocodeServer", // DKK GeocodeServer van Esri Nederland
  singleLineFieldName: "SingleLine",
  name: "Kadastrale percelen in Nederland",
  placeholder: "Zoek kadastraal perceel (bijvoorbeeld RTD06 S 4403)"
}]

const searchWidgetExpand = new Expand({
  expandIconClass: "esri-icon-search",
  expandTooltip: "Zoeken",
  expanded: true,
  content: searchWidget,
  group: "bottom-right"
});

export { searchWidgetExpand };