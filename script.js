/**
 * Created by AxelPAL on 01.10.2014.
 */
var vk = {
    data: {},
    details: {},
    appID: 4571548,
    appPermissions: 8,
    init: function () {
        VK.init({apiId: vk.appID});
        load();

        function load() {
            VK.Auth.login(authInfo, vk.appPermissions);

            function authInfo(response) {
                console.log(response);
                if (response.session) { // Авторизация успешна
                    vk.data.user = response.session.user;
                    vk.getUserInfo();
                    activateContent();
                } else alert("Авторизоваться не удалось!");
            }
        }
    },
    getUserInfo: function() {
        VK.Api.call('users.get', {fields: ["photo_100"]}, function (r) {
            if (r.response) {
                r = r.response;
                if(r[0]){
                    vk.details = r[0];
                    var avatarWrapper = $('<div>', {class: "avatar-wrapper"});
                    var avatarLink = $('<a>', {href: "http://vk.com/id"+vk.details.uid})
                    var avatar = $('<img>', {src: vk.details.photo_100});
                    avatarLink.append(avatar);
                    avatarWrapper.append(avatarLink);
                    var profileInfo = $('<a>', {href: "http://vk.com/id"+vk.details.uid}).html(vk.details.first_name + " " + vk.details.last_name);
                    var profile = $("<div>").append(avatarWrapper).append(profileInfo);
                    $(".authorise").replaceWith(profile);
                }
            } else alert("Не удалось получить список аудиозаписей");
        })
    },
    musicSearch: function (query) {
        VK.Api.call('audio.search', {q: query, count: 1}, function (r) {
            if (r.response) {
                r = r.response;
                for (var i = 0; i < r.length; ++i) {
                    console.log(r[i]);
                    if (r[i].aid !== undefined && r[i].owner_id !== undefined) {
                        vk.musicSongAddToAccount(r[i].aid, r[i].owner_id)
                    }
                }
            } else alert("Не удалось получить список аудиозаписей");
        })
    },
    musicSongAddToAccount: function (audio_id, owner_id) {
        VK.Api.call('audio.add', {audio_id: audio_id, owner_id: owner_id}, function (r) {
            console.log(r);
            if (r.response) {
                r = r.response;
                for (var i = 0; i < r.length; ++i) {
                    console.log(r[i]);
                }
            } else alert("Не удалось добавить аудиозапись к вашему аккаунту!");
        })
    }
};
$(document).on('click', ".authorise", function () {
    vk.init();
    console.log(vk.data.user);
});


songs = [];
counter = 0;
document.querySelector('input[type="file"]').onchange = function () {
    var files = this.files;
    processSongs(files);
};
document.querySelector('#fileDrag').onclick = function () {
    document.getElementById("inputFiles").click();
};
$(document).on('click', '.removeSong', function () {
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
    if (e.dataTransfer) {
        var files = e.dataTransfer.files;
        if (files) {
            processSongs(files, e);
        }
    }
}

function processSongs(files, e) {
    for (var i in files) {
        if (files.hasOwnProperty(i)) {
            if (files[i].type == "") {
                //TODO implement directory scan for files
                var length = e.dataTransfer.files.length;
                for (var i = 0; i < length; i++) {
                    var file = e.dataTransfer.files[i];
                    var entry = e.dataTransfer.items[i].webkitGetAsEntry();
                    console.log(entry);
                }
            } else {
                processSong(files[i]);
            }
        }
    }
}
function processSong(file) {
    var table = document.querySelector("#mainTable");
    var tbody = document.querySelector("#mainTable tbody");
    tbody.innerHTML = "";
    songs = [];
    counter = 0;
    id3(file, function (err, tags) {
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
            td2.classList.add("name");
            td2.setAttribute("data-id", counter);
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

$(document).on('click', '.name', function () {
    var id = $(this).data('id');
    var object = {};
    songs.find(function (element) {
        if (element.id == id) {
            object = element;
        }
    });
    if (object) {
        var query = object.artist + " - " + object.title;
        vk.musicSearch(query);

    }
});

function activateContent() {
    document.querySelector(".content").style.display = "initial";
}

/*
TODO Upload song if VK doesn't have any of it
TODO folder traversing
TODO Many music formats (not only mp3)
TODO Beautiful design
TODO Saving token at cookies and get it again if its outdated
TODO Отдельная кнопка для добавления песен (при добавлении соответствующая песня пропадает из списка)
*/