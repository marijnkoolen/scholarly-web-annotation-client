"use strict"

document.onreadystatechange = function () {
    if (document.readyState === "complete") {
        // use a short time out, as sometimes annotator
        // module is not loaded yet as global variable.
        window.setTimeout(addClient, 100);
    }
}

var addClient = function() {
    loadConfig((error, config) => {
        console.log(config);
        var annotator = new ScholarlyWebAnnotator.ScholarlyWebAnnotator(config);
        var viewerElement = document.getElementsByClassName('annotation-viewer')[0];
        annotator.addAnnotationClient(viewerElement);
    });

}

var loadConfig = function(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "config/van-gogh-annotation-config.json");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            try {
                var config = JSON.parse(xhr.responseText);
                return callback(null, config);
            } catch(error) {
                console.log(error);
                return callback(error, null);
            }
        }
    }
    xhr.send();
    /*
    fetch("config/van-gogh-annotation-config.json", {
        method: "GET"
    }).then(function(response) {
        return response.json();
    }).then(function(config) {
        console.log("loading custom configuration");
        return callback(null, config);
    }).catch(function(error) {
        return callback(error, null);
    });
    */
}

