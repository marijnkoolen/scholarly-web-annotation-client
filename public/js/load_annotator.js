"use strict"

var annotator;

var addClient = function(configFile) {
    loadConfig(configFile, (error, config) => {
        console.log(config);
        annotator = new ScholarlyWebAnnotator.ScholarlyWebAnnotator(config);
        var viewerElement = document.getElementById('swac-viewer');
        annotator.addAnnotationClient(viewerElement);
    });

}

var loadConfig = function(configFile, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", configFile);
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
}

var configFile = "config/van-gogh-annotation-config.json";

document.onreadystatechange = function () {
    if (document.readyState === "complete") {
        // use a short time out, as sometimes annotator
        // module is not loaded yet as global variable.
        addClient(configFile);
    }
}

