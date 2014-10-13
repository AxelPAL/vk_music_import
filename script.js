/**
 * Created by AxelPAL on 01.10.2014.
 */
var vk = {
    data: {},
    details: {},
    musicCollection: [],
    appID: 4571548,
    appPermissions: 8,
    serverUrl: "",
    init: function () {
        VK.init({apiId: vk.appID});
        load();

        function load() {
            VK.Auth.login(authInfo, vk.appPermissions);

            function authInfo(response) {
                if (response.session) { // Авторизация успешна
                    vk.data.user = response.session.user;
                    vk.getUserInfo();
                    vk.getUploadServer();
                } else console.log("Авторизоваться не удалось!");
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
            } else sweetAlert("","Не удалось получить список аудиозаписей","error");
            vk.getMusicCollection();
        });
    },
    musicSearch: function (artist, title, file) {
        var query = artist + " - " + title;
        VK.Api.call('audio.search', {q: query, count: 5}, function (r) {
            if (r.response) {
                r = r.response;
                console.log(r.length <=1);
                if(r.length <=1){
                    vk.uploadSongFile(file);
                } else {
                    for (var i = 0; i < r.length; ++i) {
                        if (r[i].aid !== undefined && r[i].owner_id !== undefined) {
                            if(r[i].artist == artist && r[i].title == title){
                                var object = {};
                                vk.musicCollection.find(function (element) {
                                    if (element.artist == artist && element.title == title) {
                                        object = element;
                                    }
                                });
                                songs.find(function (element) {
                                    if (element.artist == artist && element.title == title) {
                                        object = element;
                                    }
                                });
                                if(Object.getOwnPropertyNames(object).length == 0){
                                    vk.musicSongAddToAccount(r[i].aid, r[i].owner_id);
                                    break;
                                }
                            }
                        }
                    }
                }
            } else sweetAlert("", "Не удалось найти и добавить песню.", "error");
        })
    },
    musicSongAddToAccount: function (audio_id, owner_id) {
        VK.Api.call('audio.add', {audio_id: audio_id, owner_id: owner_id}, function (r) {
            if (r.response) {
                r = r.response;
                for (var i = 0; i < r.length; ++i) {
                    console.log(r[i]);
                }
            } else sweetAlert("", "Не удалось добавить аудиозапись к вашему аккаунту!", "error");
        })
    },
    upload: function() {
        if(vk.details){
            for(var i in songs){
                if(songs.hasOwnProperty(i)){
                    var object = songs[i];
                    vk.musicSearch(object.artist, object.title, object.file);
                    $('.name[data-id="'+ object.id +'"]').closest("tr").hide(500, function () {
                        $(this).remove();
                    });
                    songs.splice(0,1);
                }
            }
            sweetAlert("Загрузка завершена.");
        } else {
            sweetAlert("Вы не авторизованы","Пожалуйста, авторизуйтесь Вконтакте.", "error");
        }
    },
    getMusicCollection: function () {
        VK.Api.call('audio.get', {owner_id: vk.details.uid}, function (r) {
            if (r.response) {
                r = r.response;
                for (var i = 0; i < r.length; ++i) {
                    var userSong = {artist: r[i].artist, title: r[i].title};
                    vk.musicCollection.push(userSong);
                }
            } else console.log("Не удалось получить список ваших аудиозаписей");
        })
    },
    uploadSongFile: function(file) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload.php');

        xhr.upload.onprogress = function(e)
        {
            /*
             * values that indicate the progression
             * e.loaded
             * e.total
             */
        };

        xhr.onload = function()
        {
            // upload success
            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0))
            {
                if(xhr.responseText){
                    var msg = JSON.parse(xhr.responseText);
                    if(msg)
                        VK.Api.call('audio.save', {audio: msg.audio, server: msg.server, hash: msg.hash}, function (r) {
                            console.log(r);
                            if (r.response) {
                                r = r.response;
                                for (var i = 0; i < r.length; ++i) {
                                    console.log(r[i]);
                                    var userSong = {artist: r[i].artist, title: r[i].title};
                                    vk.musicCollection.push(userSong);
                                }
                            } else console.log("Не удалось залить вашу запись");
                        })
                }
            }
            console.log('upload complete');
        };

        var form = new FormData();
        form.append('serverUrl', vk.serverUrl);
        form.append('audioFile', file);

        xhr.send(form);
    },
    getUploadServer: function() {
        var serverUrl = "";
        VK.Api.call('audio.getUploadServer', {}, function (r) {
            if (r.response) {
                if (r.response.upload_url) {
                    serverUrl = r.response.upload_url;
                } else {
                    console.log("Не удалось получить сервер аудио");
                    console.log(r);
                }
            }
            vk.serverUrl = serverUrl;
        });
    }
};
$(document).on('click', ".authorise", function () {
    vk.init();
});
$(document).on('click', ".upload", function () {
    vk.upload();
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
            var song = {id: counter, artist: tags.artist, title: tags.title, file: file};
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
            td4.innerHTML = '<button class="removeSong button-error pure-button" data-id="' + counter + '"><i class="fa fa-times"></i><span class="remove-span">Remove</span></button>';
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