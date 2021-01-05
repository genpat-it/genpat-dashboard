import Phylocanvas from 'phylocanvas';
import ajax from 'phylocanvas-plugin-ajax';
import metadata from 'phylocanvas-plugin-metadata';
Phylocanvas.plugin(ajax);
Phylocanvas.plugin(metadata);

import $ from 'jquery';

import { pointLayer, pointSelect_mouseover } from './map';

var tree;
var leaveIDs = new Array();

const createTree = (nwk_file, tree_title) => {

    tree = Phylocanvas.createTree('tree');
    (nwk_file) ? tree.load(nwk_file) : console.log('Nessun albero');
    (tree_title) ? document.getElementById('tree_title').innerHTML = tree_title : document.getElementById('tree_title').innerHTML = 'Tree'
    tree.setNodeSize(12);
	tree.setTextSize(16);
	tree.branchColour = "#3C7383";
	tree.lineWidth = 1;
	tree.highlightColour = "#FFBB33";
    tree.selectedColour = "#FF8800";		
    // tree.history.container.hidden = true;
	// tree.scalebar.active = false;
	// tree.scalebar.width = 75;
    // tree.scalebar.font = 12;
    tree.setSize(550,750);
    tree.setTreeType('rectangular');
    tree.alignLabels = true;

    tree.on('beforeFirstDraw', function () {
        for (var i = 0; i < tree.leaves.length; i++) {
          tree.leaves[i].data = {
            column1: {
              colour: '#3C7383',
              label: 'Label' + (i + 1),
            },
            column2: '#9BB7BF',
            column3: '#3C7383',
            column4: '#9BB7BF',
          };
        }
    });

    // Al caricamento dell'albero
    tree.on("loaded",function(e){
        // Per ogni leave
        leaveIDs = [];
        $.each(tree.leaves,function(i,leave){
            // Popola un array con gli id di tutti i leaves
            leaveIDs.push(leave.id);
            // Imposta stile dei leaves
            leave.setDisplay({
                size: 1.25, // ratio of the base node size
                leafStyle: {
                    strokeStyle: '#3c7383',
                    fillStyle: 'rgb(155, 183, 191)',
                    lineWidth: 1
                }
            });
        });
        tree.draw();
    });

}

$('.set-tree-type').click((e) => {
    var text = e.target.innerText.toLocaleLowerCase();
    tree.setTreeType(text);
})


export { createTree, tree, leaveIDs }