document.onreadystatechange = function () {
	if (document.readyState === "complete") {
		console.log("document ready!");
		loadConfig((error, config) => {
			rdfaAnnotator = new RDFaAnnotator.RDFaAnnotator(config);
			rdfaAnnotator.addAnnotationClient();
		});
	}
}

var loadConfig = function(callback) {
    fetch("rdfa-annotation-config.json", {
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

