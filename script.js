/**
 * Created by AxelPAL on 01.10.2014.
 */
songs = [];
counter = 0;
document.querySelector('input[type="file"]').onchange = function (e) {
    var files = this.files;
    processSongs(files);
};
document.querySelector('#fileDrag').onclick = function (e) {
    document.getElementById("inputFiles").click();
};
$(document).on('click', '.removeSong', function (e) {
    var $this = $(this);
    var id = $this.data('id');
    $this.closest('tr').hide(500, function () {
        $(this).remove();
    });
    songs = songs.filter(function (el) {
        return el.id !== id;
    });
});


// getElementById
function $id(id) {
    return document.getElementById(id);
}

// call initialization file
if (window.File && window.FileList && window.FileReader) {
    Init();
}

//
// initialize
function Init() {

    var fileselect = $id("inputFiles"),
        fileDrag = $id("fileDrag");

    // file select
    fileselect.addEventListener("change", FileSelectHandler, false);

    // file drop
    fileDrag.addEventListener("dragover", FileDragHover, false);
    fileDrag.addEventListener("dragleave", FileDragHover, false);
    fileDrag.addEventListener("drop", FileSelectHandler, false);
    fileDrag.style.display = "block";

}
// file drag hover
function FileDragHover(e) {
    e.stopPropagation();
    e.preventDefault();
    e.target.className = (e.type == "dragover" ? "hover" : "");
}
// file selection
function FileSelectHandler(e) {

    // cancel event and hover styling
    FileDragHover(e);

    // fetch FileList object
    if (e.type == 'drop') {
        var files = e.target.files || e.dataTransfer.files;
        processSongs(files);
    }

}

function processSongs(files) {
    var table = document.querySelector("#mainTable");
    var tbody = document.querySelector("#mainTable tbody");
    tbody.innerHTML = "";
    songs = [];
    counter = 0;
    for (var i in files) {
        if (files.hasOwnProperty(i)) {
            id3(files[i], function (err, tags) {
                if (tags) {
                    ++counter;
                    var song = {id: counter, artist: tags.artist, title: tags.title};
                    var tr = document.createElement('tr');
                    var td1 = document.createElement('td');
                    var td2 = document.createElement('td');
                    var td3 = document.createElement('td');
                    var td4 = document.createElement('td');
                    td1.innerHTML = counter.toString();
                    td2.innerHTML = song.artist;
                    td3.innerHTML = song.title;
                    td4.innerHTML = '<button class="removeSong button-error pure-button" data-id="' + counter + '">Remove</button>';
                    songs.push(song);
                    tr.appendChild(td1);
                    tr.appendChild(td2);
                    tr.appendChild(td3);
                    tr.appendChild(td4);
                    tbody.appendChild(tr);
                    table.style.display = "table";
                }
            });
        }
    }
}