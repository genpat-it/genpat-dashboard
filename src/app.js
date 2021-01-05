import './scss/main.scss';
import '@fortawesome/fontawesome-free/js/all';
// Bootstrap
import $ from 'jquery';
import 'popper.js';
import 'bootstrap';
// Tabulator CSS
import 'tabulator-tables/dist/css/bootstrap/tabulator_bootstrap4.min.css';

// Application modules
import { createTree } from './js/load_tree';
import { createMsaViewer } from './js/load_fasta';
import { createMap } from './js/map';
import { createTable } from './js/load_metadata';

// Get Init data
const getInitData = () => {
    // Get params in querystring
    const urlParams = new URLSearchParams(window.location.search);
    const geoPath   = urlParams.get('geo');
	const treePath  = urlParams.get('tree');
	const treeTitle = urlParams.get('treetitle');
    const fastaPath = urlParams.get('fasta');
    const metaPath  = urlParams.get('meta');
    // Populate JS object
    var initObj = {
        "geo": {
            "path": geoPath
        },
        "tree": {
            "path": treePath,
            "title": treeTitle
        },
        "fasta": {
            "path": fastaPath
        },
        "meta":{
            "path": metaPath
        }
    }
    return initObj;
}

var initParams = getInitData();

console.log(initParams);

createTree( initParams.tree.path, initParams.tree.title );
createMsaViewer( initParams.fasta.path );
createMap( initParams.geo.path );
createTable( initParams.meta.path );