
"use strict"

const AnnotationAPI = {

    annotationServer : null,

    serverNotSet : function() {
        return Error("No annotation server configured.");
    },

    setServerAddress : function(apiURL) {
        this.annotationServer = apiURL;
        return this.annotationServer;
    },

    getServerAddress : function() {
        return this.annotationServer;
    },

    makeRequest : function(url, options, callback) {
        if (!this.annotationServer)
            callback(serverNotSet(), null);
        var status = null;
        options.cache = 'no-cache';
        options.mode = 'cors';
        fetch(url, options).then(function(response) {
            status = response.status;
            return response.json();
        }).then(function(data) {
            if (status !== 200){
                let error = {
                    status: status,
                    message: data.message
                }
                return callback(error, null);
            }
            return callback(null, data);
        }).catch(function(error) {
            console.error(url, error.toString());
            return callback(error, null);
        });
    },

    saveAnnotation : function(annotation, callback) {
        // default is POSTing a new annotation
        var url = this.annotationServer + '/annotations';
        var method = 'POST';

        // if annotation already has an id, it's an update, so PUT
        if(annotation.id) {
            url = this.annotationServer + '/annotations/' + annotation.id;
            method = 'PUT';
        }

        let options = {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(annotation)
        }
        this.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    login : function(userDetails, callback) {
        var url = this.annotationServer + "/login";
        let options = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(userDetails)
        }
        this.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    getAnnotationById : function(annotationId, callback) {
        var status = null;
        let url = this.annotationServer + '/annotations/' + annotationId;
        let options = { method: "GET" };
        this.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    getAnnotations : function(callback) {
        let url = this.annotationServer + '/annotations';
        let options = { method: "GET" }
        this.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    getAnnotationsByTarget : function(targetId, callback) {
        if (typeof(targetId) !== "string") {
            let error = new TypeError("resource ID should be string");
            return callback(error, null);
        }
        let url = this.annotationServer + '/resources/' + targetId + '/annotations';
        let options = { method: "GET" }
        this.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    getAnnotationsByTargets : function(targetIds, callback) {
        var annotations = [];
        var ids = [];
        targetIds.forEach(function(targetId, targetIndex) {
            AnnotationAPI.getAnnotationsByTarget(targetId, function(error, data) {
                if (error)
                    return callback(error, null);

                data.forEach(function(annotation, index) {
                    if (ids.indexOf(annotation.id) === -1) {
                        ids.push(annotation.id);
                        annotations.push(annotation);
                    }
                    if (index === data.length - 1 && targetIndex === targetIds.length - 1) {
                        return callback(null, annotations);
                    }
                });
                if (data === []) {
                    if (targetIndex === targetIds.length - 1) {
                        return callback(null, annotations);
                    }
                }
            });
        });
    },

    deleteAnnotation : function (annotation, callback) {
        if(!annotation.id) {
            let error = Error("annotation MUST have an id property");
            callback(error, null);
        }
        let url = this.annotationServer + '/annotations/' + annotation.id;
        let options = { method: "DELETE" }
        this.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    deleteAnnotationById : function (annotationId, callback) {
        let url = this.annotationServer + '/annotations/' + annotationId;
        let options = { method: "DELETE" }
        this.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    getCollections : function(callback) {
        let url = this.annotationServer + '/collections';
        let options = { method: "GET" }
        this.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    getCollection : function(collectionId, callback) {
        let url = this.annotationServer + '/collections/' + collectionId;
        let options = { method: "GET" }
        this.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    getCollectionPage : function(pageURL, callback) {
        //let url = this.annotationServer + '/pages/' + pageId;
        let options = { method: "GET" }
        this.makeRequest(pageURL, options, (error, data) => {
            return callback(error, data);
        });
    },

    saveCollection : function(collection, callback) {
        var status = null;
        let url = this.annotationServer + '/collections';
        let method = 'POST';

        // if annotation already has an id, it's an update, so PUT
        if(collection.id) {
            url = this.annotationServer + '/collections/' + collection.id;
            method = 'PUT';
        }

        var options = {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(collection),
        }
        this.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    deleteCollection : function (collection, callback) {
        if(!collection.id) {
            let error = Error("collection MUST have an id property");
            callback(error, null);
        }
        let url = this.annotationServer + '/collections/' + collection.id;
        let options = { method: "DELETE" }
        this.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    addAnnotation : function (collectionId, annotation, callback) {
        let url = this.annotationServer + '/collections/' + collectionId + '/annotations/';
        let options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(annotation),
        };
        this.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    removeAnnotation : function (collectionId, annotationId, callback) {
        let url = this.annotationServer + '/collections/' + collectionId + '/annotations/' + annotationId;
        let options = { method: "DELETE" };
        this.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    checkResource : function(resourceId, callback) {
        let url = this.annotationServer + '/resources/' + resourceId;
        let options = { method: "GET" }
        this.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    registerResource : function(resourceMap, callback) {
        let url = this.annotationServer + '/resources';
        var options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resourceMap)
        }
        this.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    }
}

export default AnnotationAPI;
