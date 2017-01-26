import config from '../rdfa-annotation-config.js';
const annotationServer = config.services.AnnotationServer.api;

const AnnotationAPI = {

    saveAnnotation : function(annotation, callback) {
        // default is POSTing a new annotation
        var url = config.services.AnnotationServer.api + '/annotations';
        var method = 'POST';

        // if annotation already has an id, it's an update, so PUT
        if(annotation.id) {
            url += '/annotation/' + annotation.id;
            method = 'PUT';
        }

        console.log(annotation);

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(annotation)
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            callback(data);
        }).catch(function(error) {
            console.error(url, error.toString());
        });

    },

    login : function(userDetails, callback) {
        var url = config.services.AnnotationServer.api + "/login";
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userDetails)
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            callback(data);
        }).catch(function(error) {
            console.error(url, error.toString());
        });
    },

    getAnnotation : function(annotationId) {
        if(annotationId) {
            let url = config.services.AnnotationServer.api + '/annotations/annotation/' + annotationId;
            fetch(url, {
                method: "GET",
                cache: 'no-cache',
                mode: 'cors'
            }).then(function(response) {
                return response.json();
            }).catch(function(err) {
                console.error(url, err.toString());
            });
        }
    },

    getAnnotations : function(callback) {
        let url = config.services.AnnotationServer.api + '/annotations';
        fetch(url, {
            method: "GET",
            cache: 'no-cache',
            mode: 'cors'
        }).then(function(response) {
            callback(response.json());
        }).catch(function(err) {
            console.error(url, err.toString());
        });
    },

    getAnnotationsByTarget : function(targetId, callback) {
        let url = config.services.AnnotationServer.api + '/annotations/target/' + targetId;
        fetch(url, {
            method: "GET",
            cache: 'no-cache',
            mode: 'cors'
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            callback(null, data);
        }).catch(function(err) {
            console.error(url, err.toString());
            callback(err, null);
        });
    },

    getAnnotationsByTargets : function(targetIds, callback) {
        var annotations = [];
        var ids = [];
        targetIds.forEach(function(targetId, targetIndex) {
            AnnotationAPI.getAnnotationsByTarget(targetId, function(error, data) {
                if (error)
                    callback(error, null);

                data.forEach(function(annotation) {
                    if (ids.indexOf(annotation.id) === -1) {
                        ids.push(annotation.id);
                        annotations.push(annotation);
                    }
                    if (targetIndex === targetIds.length - 1) {
                        callback(null, annotations);
                    }
                });
                if (data === []) {
                    callback(null, annotations);
                }
            });
        });
    },

    deleteAnnotation : function (annotation, callback) {
        console.debug('deleting: ' + annotation.id);
        if(annotation.id) {
            $.ajax({
                url : config.services.AnnotationServer.api + '/annotations/annotation/' + annotation.id,
                type : 'DELETE',
                //dataType : 'application/json',
                success : function(data) {
                    if(callback) {
                        callback(data, annotation)
                    }
                },
                error : function(err) {
                    console.debug(err);
                }
            });
        }
    },

    //TODO always add the user too!
    getFilteredAnnotations : function(field, value, callback) {
        var url = config.services.AnnotationServer.api + '/annotations/filter';
        url += '?filterType=' + field;
        url += '&value=' + value;
        $.ajax({
            url : url,
            type : 'GET',
            //dataType : 'application/json',
            success : function(data) {
                callback(data);
            },
            error : function(err) {
                console.debug(err);
            }
        });
    },
}

export default AnnotationAPI;
