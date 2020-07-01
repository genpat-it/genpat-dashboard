import $ from 'jquery';
const _ = require('lodash');
import '../../node_modules/msa/dist/msa.js'

const createMsaViewer = (fasta_file) => {

    if (fasta_file){
        $.ajax({
            // url: 'data/allineamento_test.fasta',
            url: fasta_file,
            async: false,
            success: function (fasta){
                // console.log(fasta);
                // parsed array of the sequences
                var seqs =  msa.io.fasta.parse(fasta);
                // Create viewer
                var m = msa({
                     el: document.getElementById("msa"),
                     seqs: seqs,
                     colorscheme: {"scheme": "buried"},
                     menu: "small",
                     bootstrapMenu: true
                });
                m.render();
            }
        });
    } else {
        return;
    }

    

}

// msaViewer()

export { createMsaViewer }