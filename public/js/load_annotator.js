document.onreadystatechange = function () {
    if (document.readyState === "complete") {
        loadConfig((error, config) => {
            annotator = new ScholarlyWebAnnotator.ScholarlyWebAnnotator(config);
            annotator.addAnnotationClient();
        });
    }
}

var loadConfig = function(callback) {
    fetch("letter-annotation-config.json", {
        method: "GET"
    }).then(function(response) {
        return response.json();
    }).then(function(config) {
        console.log("loading custom configuration");
        return callback(null, config);
    }).catch(function(error) {
        return callback(error, null);
    });
}

