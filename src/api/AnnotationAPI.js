
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

    saveAnnotation : function(annotation, callback) {
        if (!this.annotationServer)
            callback(serverNotSet(), null);
        // default is POSTing a new annotation
        var url = this.annotationServer + '/annotations';
        var method = 'POST';
        var status = null;

        // if annotation already has an id, it's an update, so PUT
        if(annotation.id) {
            url = this.annotationServer + '/annotations/annotation/' + annotation.id;
            method = 'PUT';
        }

        fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(annotation)
        }).then(function(response) {
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
            return callback(error, null);
        });
    },

    login : function(userDetails, callback) {
        if (!this.annotationServer)
            callback(serverNotSet(), null);
        var url = this.annotationServer + "/login";
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userDetails)
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            callback(null, data);
        }).catch(function(error) {
            console.error(url, error.toString());
            callback(error, null);
        });
    },

    getAnnotationById : function(annotationId, callback) {
        if (!this.annotationServer)
            callback(serverNotSet(), null);
        var status = null;
        let url = this.annotationServer + '/annotations/annotation/' + annotationId;
        fetch(url, {
            method: "GET",
            cache: 'no-cache',
            mode: 'cors'
        }).then(function(response) {
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
        }).catch(function(err) {
            return callback(err, null);
        });
    },

    getAnnotations : function(callback) {
        if (!this.annotationServer)
            callback(serverNotSet(), null);
        let url = this.annotationServer + '/annotations';
        fetch(url, {
            method: "GET",
            cache: 'no-cache',
            mode: 'cors'
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            return callback(null, data);
        }).catch(function(err) {
            console.error(url, err.toString());
            return callback(err, null)
        });
    },

    getAnnotationsByTarget : function(targetId, callback) {
        if (!this.annotationServer)
            callback(serverNotSet(), null);
        if (typeof(targetId) !== "string") {
            let error = new TypeError("resource ID should be string");
            return callback(error, null);
        }
        let url = this.annotationServer + '/resources/' + targetId + '/annotations';
        fetch(url, {
            method: "GET",
            cache: 'no-cache',
            mode: 'cors'
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            return callback(null, data);
        }).catch(function(err) {
            console.error(url, err.toString());
            return callback(err, null);
        });
    },

    getAnnotationsByTargets : function(targetIds, callback) {
        if (!this.annotationServer)
            callback(serverNotSet(), null);
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
                    return callback(null, annotations);
                }
            });
        });
    },

    deleteAnnotation : function (annotation, callback) {
        if (!this.annotationServer)
            callback(serverNotSet(), null);
        if(!annotation.id) {
            let error = Error("annotation MUST have an id property");
            callback(error, null);
        }
        let url = this.annotationServer + '/annotations/annotation/' + annotation.id;
        fetch(url, {
            method: "DELETE",
            cache: 'no-cache',
            mode: 'cors'
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            return callback(null, data);
        }).catch(function(err) {
            console.error(url, err.toString());
            return callback(err, null);
        });
    },

    deleteAnnotationById : function (annotationId, callback) {
        if (!this.annotationServer)
            callback(serverNotSet(), null);
        let url = this.annotationServer + '/annotations/annotation/' + annotationId;
        fetch(url, {
            method: "DELETE",
            cache: 'no-cache',
            mode: 'cors'
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            return callback(null, data);
        }).catch(function(err) {
            console.error(url, err.toString());
            return callback(err, null);
        });
    },

    checkResource : function(resourceId, callback) {
        var status = null;
        if (!this.annotationServer)
            callback(serverNotSet(), null);
        let url = this.annotationServer + '/resources/' + resourceId;
        fetch(url, {
            method: "GET",
            cache: "no-cache",
            mode: "cors"
        }).then(function(response) {
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
            console.error(url, err.toString());
            return callback(error, null);
        });

    },

    registerResource : function(resourceMap, callback) {
        if (!this.annotationServer)
            callback(serverNotSet(), null);
        let url = this.annotationServer + '/resources';
        fetch(url, {
            method: "POST",
            cache: "no-cache",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(resourceMap)
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            return callback(null, data);
        }).catch(function(error) {
            console.error(url, err.toString());
            return callback(error, null);
        });
    }
}

export default AnnotationAPI;
