
"use strict"

import config from '../rdfa-annotation-config.js';
const annotationServer = config.services.AnnotationServer.api;


const AnnotationAPI = {

    saveAnnotation : function(annotation, callback) {
        // default is POSTing a new annotation
        var url = annotationServer + '/annotations';
        var method = 'POST';
        var status = null;

        // if annotation already has an id, it's an update, so PUT
        if(annotation.id) {
            url += '/annotation/' + annotation.id;
            method = 'PUT';
        }

        fetch(url, {
            method: "POST",
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
        var url = annotationServer + "/login";
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userDetails)
        }).then(handleErrors).then(function(response) {
            return response.json();
        }).then(function(data) {
            callback(data);
        }).catch(function(error) {
            console.error(url, error.toString());
        });
    },

    getAnnotationById : function(annotationId, callback) {
        var status = null;
        let url = annotationServer + '/annotations/annotation/' + annotationId;
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
        let url = annotationServer + '/annotations';
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
        if (typeof(targetId) !== "string") {
            let error = new TypeError("resource ID should be string");
            return callback(error, null);
        }
        let url = annotationServer + '/annotations/target/' + targetId;
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
        if(!annotation.id) {
            let error = Error("annotation MUST have an id property");
            callback(error, null);
        }
        let url = annotationServer + '/annotations/annotation/' + annotation.id;
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
        let url = annotationServer + '/annotations/annotation/' + annotationId;
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
}

export default AnnotationAPI;
