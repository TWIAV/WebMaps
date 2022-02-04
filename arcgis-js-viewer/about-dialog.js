import Expand from "@arcgis/core/widgets/Expand";

const aboutDialog = document.createElement('div');
aboutDialog.className = 'dialogDiv';
aboutDialog.id = 'aboutDiv';
aboutDialog.style.display = 'none';

const aboutDialogHeader = document.createElement('div');
aboutDialogHeader.className = 'dialogHeader';

const aboutDialogContent = document.createElement('div');
aboutDialogContent.className = 'dialogContent';

aboutDialog.appendChild(aboutDialogHeader);
aboutDialog.appendChild(aboutDialogContent);

aboutDialogHeader.innerHTML = 'Over deze applicatie';

aboutDialogContent.innerHTML = '<p>Deze app is ontwikkeld met de <a href="https://developers.arcgis.com/javascript/latest/">ArcGIS API for JavaScript</a>';
aboutDialogContent.innerHTML += 'en gebouwd met behulp van <a href="https://vitejs.dev/">Vite</a> (Next Generation Frontend Tooling).</p>';
aboutDialogContent.innerHTML += '<p>De broncode staat op <a href="https://github.com/TWIAV/WebMaps/tree/main/arcgis-js-viewer">GitHub</a>.</p>';

document.getElementsByTagName('body')[0].appendChild(aboutDialog);

export { aboutDialog };