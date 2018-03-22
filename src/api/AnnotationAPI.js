
"use strict"

const AnnotationAPI = {

    annotationServer : null,

    userDetails : null,

    permissions : {
        accessStatus : "private" // default setting is private
    },

    serverNotSet : () => {
        return Error("No annotation server configured.");
    },

    setServerAddress : (apiURL) => {
        console.log("setting server address:", apiURL);
        AnnotationAPI.annotationServer = apiURL;
    },

    getServerAddress : () => {
        return AnnotationAPI.annotationServer;
    },

    checkServerAvailable : (callback) => {
        fetch(AnnotationAPI.annotationServer, {}).then((response) => {
            return response.json();
        }).then((data) => {
            return callback(true);
        }).catch((error) => {
            return callback(false);
        });
    },

    setUserDetails : (userDetails) => {
        AnnotationAPI.userDetails = userDetails;
    },

    setPermissions : (permissions) => {
        if (permissions.hasOwnProperty("accessStatus")) {
            if (!["private", "shared", "public"].includes(permissions.accessStatus)) {
                return Error("Invalid accessStatus option. Must be 'private', 'shared' or 'public'");
            }
            AnnotationAPI.permissions.accessStatus = permission.accessStatus;
        }
    },

    getPermissions : () => {
        return AnnotationAPI.permissions;
    },

    removeUserDetails : () => {
        AnnotationAPI.userDetails = null;
    },

    makeRequest : function(url, options, callback) {
        if (!AnnotationAPI.annotationServer)
            callback(AnnotationAPI.serverNotSet(), null);
        var status = null;
        options.cache = 'no-cache';
        options.mode = 'cors';
        if (AnnotationAPI.userDetails) {
            AnnotationAPI.addAuthorization(options);
        }
        fetch(url, options).then((response) => {
            status = response.status;
            if (status === 204) {
                return {};
            }
            return response.json();
        }).then((data) => {
            if (status === 403 && AnnotationAPI.userDetails && AnnotationAPI.userDetails.token) {
                // token expired, remove token
                delete AnnotationAPI.userDetails.token;
                localStorage.setItem("userDetails", JSON.stringify(AnnotationAPI.userDetails));
            }
            if (status >= 400 && status < 500){
                let error = {
                    status: status,
                    message: data.message
                }
                return callback(error, null);
            }
            return callback(null, data);
        }).catch((error) => {
            console.error(url, error.toString());
            return callback(error, null);
        });
    },

    addAuthorization : (options) => {
        if (!options.hasOwnProperty("headers")) {
            options.headers = {}
        }
        var authorizationString = "";
        if (AnnotationAPI.userDetails.token) {
            authorizationString = AnnotationAPI.userDetails.token+":unused";

        } else {
            authorizationString = AnnotationAPI.userDetails.username+":"+AnnotationAPI.userDetails.password;
        }
        options.headers["Authorization"] = "Basic " + btoa(authorizationString);
    },

    saveAnnotation : (annotation, permission, callback) => {
        // default is POSTing a new annotation
        console.log("saving annotation with permission level", permission);
        var url = AnnotationAPI.annotationServer + '/annotations';
        var method = 'POST';

        // if annotation already has an id, it's an update, so PUT
        if(annotation.id) {
            url = AnnotationAPI.annotationServer + '/annotations/' + annotation.id;
            method = 'PUT';
        }
        url = url + '?access_status=' + permission;

        let options = {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(annotation)
        }
        AnnotationAPI.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    getAnnotationById : function(annotationId, callback) {
        var status = null;
        let url = AnnotationAPI.annotationServer + '/annotations/' + annotationId;
        let options = { method: "GET" };
        AnnotationAPI.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    getAnnotations : function(callback) {
        let url = AnnotationAPI.annotationServer + '/annotations';
        let options = { method: "GET" }
        AnnotationAPI.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    getAnnotationsByTarget : (targetId, accessStatus, callback) => {
        if (typeof(targetId) !== "string") {
            let error = new TypeError("resource ID should be string");
            return callback(error, null);
        }
        let url = AnnotationAPI.annotationServer + '/annotations' + '?'
        + 'target_id=' + targetId
        + "&access_status=" + accessStatus.join(",")
        + "&include_permissions=true";
        let options = {
            headers: {
                "Prefer": "return=representation;include='http://www.w3.org/ns/oa#PreferContainedDescriptions'"
            },
            method: "GET"
        }
        AnnotationAPI.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    getAnnotationsByTargets : (targetIds, accessStatus, callback) => {
        var annotations = [];
        var ids = [];
        targetIds.forEach((targetId, targetIndex) => {
            AnnotationAPI.getAnnotationsByTarget(targetId, accessStatus, (error, annotationContainer) => {
                if (error)
                    return callback(error, null);

                var items = [];
                if (annotationContainer.first && annotationContainer.first.hasOwnProperty("items")) {
                    items = annotationContainer.first.items;
                }
                items.forEach((annotation, index) => {
                    if (ids.indexOf(annotation.id) === -1) {
                        ids.push(annotation.id);
                        annotations.push(annotation);
                    }
                    if (index === items.length - 1 && targetIndex === targetIds.length - 1) {
                        return callback(null, annotations);
                    }
                });
                if (annotationContainer.total === 0) {
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
        let url = AnnotationAPI.annotationServer + '/annotations/' + annotation.id;
        let options = { method: "DELETE" }
        AnnotationAPI.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    deleteAnnotationById : function (annotationId, callback) {
        let url = AnnotationAPI.annotationServer + '/annotations/' + annotationId;
        let options = { method: "DELETE" }
        AnnotationAPI.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    getCollections : function(callback) {
        let url = AnnotationAPI.annotationServer + '/collections';
        let options = { method: "GET" }
        AnnotationAPI.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    getCollection : function(collectionId, callback) {
        let url = AnnotationAPI.annotationServer + '/collections/' + collectionId;
        let options = { method: "GET" }
        AnnotationAPI.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    getCollectionPage : function(pageURL, callback) {
        //let url = AnnotationAPI.annotationServer + '/pages/' + pageId;
        let options = { method: "GET" }
        AnnotationAPI.makeRequest(pageURL, options, (error, data) => {
            return callback(error, data);
        });
    },

    saveCollection : function(collection, callback) {
        var status = null;
        let url = AnnotationAPI.annotationServer + '/collections';
        let method = 'POST';

        // if annotation already has an id, it's an update, so PUT
        if(collection.id) {
            url = AnnotationAPI.annotationServer + '/collections/' + collection.id;
            method = 'PUT';
        }

        var options = {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(collection),
        }
        AnnotationAPI.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    deleteCollection : function (collection, callback) {
        if(!collection.id) {
            let error = Error("collection MUST have an id property");
            callback(error, null);
        }
        let url = AnnotationAPI.annotationServer + '/collections/' + collection.id;
        let options = { method: "DELETE" }
        AnnotationAPI.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    addAnnotation : function (collectionId, annotation, callback) {
        let url = AnnotationAPI.annotationServer + '/collections/' + collectionId + '/annotations/';
        let options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(annotation),
        };
        AnnotationAPI.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    removeAnnotation : function (collectionId, annotationId, callback) {
        let url = AnnotationAPI.annotationServer + '/collections/' + collectionId + '/annotations/' + annotationId;
        let options = { method: "DELETE" };
        AnnotationAPI.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    registerUser : function(userDetails, callback) {
        var url = AnnotationAPI.annotationServer + "/users";
        let options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userDetails)
        }
        AnnotationAPI.makeRequest(url, options, (error, authorizationData) => {
            if (!error) {
                console.log(authorizationData);
                userDetails.user_id = authorizationData.user.user_id;
                userDetails.token = authorizationData.user.token;
                AnnotationAPI.setUserDetails(userDetails);
            }
            return callback(error, authorizationData);
        });
    },

    loginUser : function(userDetails, callback) {
        AnnotationAPI.setUserDetails(userDetails);
        var url = AnnotationAPI.annotationServer + "/login";
        let options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userDetails)
        }
        AnnotationAPI.makeRequest(url, options, (error, authorizationData) => {
            if (!error) {
                userDetails.user_id = authorizationData.user.user_id;
                userDetails.token = authorizationData.user.token;
                AnnotationAPI.setUserDetails(userDetails);
            }
            return callback(error, authorizationData);
        });
    },

    logoutUser : function(callback) {
        var url = AnnotationAPI.annotationServer + "/logout";
        let options = { method: "GET" }
        AnnotationAPI.makeRequest(url, options, (error, data) => {
            AnnotationAPI.removeUserDetails();
            return callback(error, data);
        });
    },

    deleteUser : function(userDetails, callback) {
        var url = AnnotationAPI.annotationServer + "/users";
        let options = {
            method: "DELETE",
            headers: {
                "Authorization": "Basic " + btoa(userDetails.username+":"+userDetails.password)
            }
        }
        AnnotationAPI.makeRequest(url, options, (error, data) => {
            AnnotationAPI.removeUserDetails();
            return callback(error, data);
        });
    },

    checkResource : function(resourceId, callback) {
        let url = AnnotationAPI.annotationServer + '/resources/' + resourceId;
        let options = { method: "GET" }
        AnnotationAPI.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    },

    registerResource : function(resourceMap, callback) {
        let url = AnnotationAPI.annotationServer + '/resources';
        var options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resourceMap)
        }
        AnnotationAPI.makeRequest(url, options, (error, data) => {
            return callback(error, data);
        });
    }
}

export default AnnotationAPI;
