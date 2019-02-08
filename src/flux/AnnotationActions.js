import AppDispatcher from "./AppDispatcher";
import AnnotationAPI from "../api/AnnotationAPI";
import AnnotationStore from "../flux/AnnotationStore.js";
import RDFaUtil from "../util/RDFaUtil.js";
import FRBRooUtil from "../util/FRBRooUtil.js";

const AnnotationActions = {

    serverAvailable : false,
    accessStatus : ["private"], // for retrieving annotations from the server
    permission : "private", // for submitting or updating annotations in the server
    annotationIndex : {},
    resourceIndex : {},
    relationIndex : {},
    topResources : [],
    annotationListener: [],


    getServerAddress() {
        return AnnotationAPI.getServerAddress();
    },

    setServerAddress(apiURL) {
        AnnotationAPI.setServerAddress(apiURL);
        AnnotationActions.pollServer();
    },

    pollServer : () => {
        AnnotationAPI.checkServerAvailable((serverAvailable) => {
            if (serverAvailable !== AnnotationActions.serverAvailable) {
                AnnotationActions.serverAvailable = serverAvailable;
            }
            AppDispatcher.dispatch({
                eventName: "server-status-change",
                serverAvailable: serverAvailable
            });
            //if (!serverAvailable) {
            //    console.error("Annotation server not reachable");
            //}
        });
        setTimeout(AnnotationActions.pollServer, 60000);
    },

    getAccessStatus() {
        return AnnotationActions.accessStatus;
    },

    setAccessStatus(accessStatus) {
        AnnotationActions.accessStatus = accessStatus;
        //console.log("Updating access status:", AnnotationActions.accessStatus);
        if (AnnotationActions.accessStatus.length === 0) {
            AnnotationActions.dispatchAnnotations([]); // when no access levels are selected
        } else {
            AnnotationActions.loadAnnotations(AnnotationStore.topResources);
        }
    },

    getPermission() {
        return AnnotationActions.permission;
    },

    setPermission(permission) {
        AnnotationActions.permission = permission;
        //console.log("Updating permission:", AnnotationActions.permission);
    },

    addListenerElement(element) {
        if (!AnnotationActions.annotationListener.includes(element))
            AnnotationActions.annotationListener.push(element);
    },

    lookupIdentifier(sourceId) {
        var source = { type: null, data: null }; // for IDs to external resources
        if (AnnotationStore.annotationIndex.hasOwnProperty(sourceId))
            source = { type: "annotation", data: AnnotationStore.annotationIndex[sourceId] };
        else if (AnnotationStore.resourceIndex.hasOwnProperty(sourceId))
            source = { type: "resource", data: AnnotationStore.resourceIndex[sourceId] };
        return source;
    },

    lookupAnnotationsByTarget(resourceId) {
        return Object.values(AnnotationStore.annotationIndex).filter((annotation) => {
            let match = annotation.target.some((target) => {
                if (target.source && target.source === resourceId) {
                    return true;
                } else if (target.identifier && target.identifier === resourceId) {
                    return true;
                } else {
                    return false;
                }
            });
            return match ? true : false;
        });
    },

    save : function(annotation) {
        //console.log("saving annotation with permission level", AnnotationActions.permission);
        AnnotationAPI.saveAnnotation(annotation, AnnotationActions.permission, (error, data) => {
            AppDispatcher.dispatch({
                eventName: "save-annotation",
                annotation: data
            });
        });
    },

    delete : function(annotation) {
        AnnotationAPI.deleteAnnotation(annotation, (error, data) => {
            AppDispatcher.dispatch({
                eventName: "delete-annotation",
                annotation: data
            });
        });
    },

    activate : function(annotation) {
        AppDispatcher.dispatch({
            eventName: "activate-annotation",
            annotation: annotation
        });
    },

    edit : function(annotation) { //is the annotation always on the same page?
        AppDispatcher.dispatch({
            eventName: "edit-annotation",
            annotation: annotation
        });
    },

    createAnnotation : function(annotationTargets) { //is the annotation always on the same page?
        AppDispatcher.dispatch({
            eventName: "create-annotation",
            annotationTargets: annotationTargets
        });
    },

    set : function(annotation) { //is the annotation always on the same page?
        AppDispatcher.dispatch({
            eventName: "set-annotation",
            annotation: annotation
        });
    },

    play : (annotation) => { //is the annotation always on the same page? (no)
        AppDispatcher.dispatch({
            eventName: "play-annotation",
            annotation: annotation
        });
    },

    changeTarget : (annotationTarget) => {
        AppDispatcher.dispatch({
            eventName: "change-target",
            annotationTarget: annotationTarget
        });
    },

    loadAnnotations: (resourceIds) => {
        if (resourceIds === undefined)
            resourceIds = AnnotationStore.topResources;
        AnnotationAPI.getAnnotationsByTargets(resourceIds, AnnotationActions.accessStatus, (error, annotations) => {
            if (error) {
                //console.error(resourceIds, error.toString());
                window.alert("Error loading annotations: " + error.toString());
            }

            AnnotationStore.annotationIndex = {};
            annotations.forEach((annotation) => {
                AnnotationStore.annotationIndex[annotation.id] = annotation;
            });
            AnnotationActions.dispatchAnnotations(annotations);
        });
    },

    copyAnnotation: (annotation) => {
        // remove id, creation timestamp, permissions (assume permission of current user setting)
        delete annotation.id;
        delete annotation.created;
        delete annotation.premissions;
        AnnotationAPI.saveAnnotation(annotation, AnnotationActions.permission, (error, data) => {
            AppDispatcher.dispatch({
                eventName: "save-annotation",
                annotation: data
            });
        });
    },

    dispatchAnnotations(annotations) {
        AppDispatcher.dispatch({
            eventName: "load-annotations",
            annotations: annotations
        });
        AnnotationActions.dispatchLoadEvent();
    },

    dispatchLoadEvent() { // for external listeners
        AnnotationActions.annotationListener.forEach((element) => {
            let event = new CustomEvent("load-annotations");
            element.dispatchEvent(event);
        });
    },

    reload: () => {
        AppDispatcher.dispatch({
            eventName: "reload-annotations"
        });
    },

    indexResources: (callback) => {
        RDFaUtil.indexRDFa((error, index) => {
            AnnotationStore.resourceIndex = index.resources;
            AnnotationStore.relationIndex = index.relations;
            return callback(error);
        }); // ... refresh index
    },

    indexExternalResources: (resources, callback) => {
        FRBRooUtil.checkExternalResources((error, doIndexing) => {
            AnnotationStore.externalResourceIndex = {};
            if (error) {
                return callback(error);
            } else if (doIndexing) {
                AnnotationStore.externalResourceIndex = FRBRooUtil.indexRepresentedResources(resources);
                return callback(null);
            }
        });
    },

    loadResources: () => {
        AnnotationStore.topResources = RDFaUtil.getTopRDFaResources();
        AnnotationActions.indexResources((error) => {
            if (error) {
                //console.error(error);
                window.alert("Error indexing RDFa resources in this page\n" + error.toString());
                return false;
            }
            AnnotationStore.resourceMaps = RDFaUtil.buildResourcesMaps(); // .. rebuild maps
            let resources = Object.keys(AnnotationStore.resourceIndex);
            console.log(AnnotationStore.resourceIndex);
            console.log("resources:", resources);
            AnnotationActions.indexExternalResources(resources, (error) => {
                if (error) {
                    console.log("error indexing external resources");
                    console.log(error);
                } else {
                    console.log("external resources indexed");
                    console.log(AnnotationStore.externalResourceIndex);
                }
            });
            AppDispatcher.dispatch({
                eventName: "load-resources",
                topResources: AnnotationStore.topResources,
                resourceMaps: AnnotationStore.resourceMaps
            });
            AnnotationActions.loadAnnotations(AnnotationStore.topResources);
        });
    },

    registerUser : function(userDetails) {
        AnnotationAPI.registerUser(userDetails, (error) => {
            if (error) {
                AppDispatcher.dispatch({
                    eventName: "register-failed",
                    userDetails: userDetails
                });
            } else {
                AppDispatcher.dispatch({
                    eventName: "register-succeeded",
                    userDetails: userDetails
                });
            }
        });
    },

    loginUser : function(userDetails) {
        AnnotationAPI.loginUser(userDetails, (error) => {
            if (error) {
                AppDispatcher.dispatch({
                    eventName: "login-failed",
                    userDetails: error
                });
            } else {
                AnnotationActions.loadResources();
                AppDispatcher.dispatch({
                    eventName: "login-succeeded",
                    userDetails: userDetails
                });
            }
        });
    },

    logoutUser : function() {
        AnnotationAPI.logoutUser((error) => {
            if (error) {
                window.alert("Error logging out!");
                return null;
            }
            AppDispatcher.dispatch({
                eventName: "logout-user",
                userDetails: null
            });
        });
    },

    registerResources : function(maps) {
        if (Object.keys(maps).length === 0)
            return null;
        Object.keys(maps).forEach((resourceId, index) => {
            // check if server knows about resource
            AnnotationAPI.checkResource(resourceId, (error, data) => {
                if (data && index === Object.keys(maps).length -1)
                    return data;
                else if (data)
                    return null;
                // register if server doesn't know resource
                AnnotationAPI.registerResource(maps[resourceId], (error, data) => {
                    if (error)
                        return null;

                    if (index === Object.keys(maps).length -1)
                        return data;
                });
            });
        });
    },

    parseVocabularySuggestion : (suggestion, vocabulary) => {
        var entry = {
            value: null,
            label: {
                className: "badge badge-success",
                value: ""
            },
            scopeNote: null
        }
        if (vocabulary === "GTAA") {
            let arr = suggestion.label.split('|');
            entry.value = arr[0];
            entry.scopeNote = arr[2] ? '(' + arr[2] + ')' : ''
            switch(arr[1]) {
                case 'Persoon' :
                    entry.label = {className: "badge badge-warning", value: "Persoon"};
                    break;
                case 'Maker' :
                    entry.label = {className: "badge badge-warning", value: "Maker"};
                    break;
                case 'Geografisch' :
                    entry.label = {className: "badge badge-success", value: "Locatie"};
                    break;
                case 'Naam' :
                    entry.label = {className: "badge badge-info", value: "Naam"};
                    break;
                case 'Onderwerp' :
                    entry.label = {className: "badge badge-primary", value: "Onderwerp"};
                    break;
                case 'Genre' :
                    entry.label = {className: "badge badge-default", value: "Genre"};
                    break;
                case 'B&G Onderwerp' :
                    entry.label = {className: "badge badge-danger", value: "B&G Onderwerp"};
                    break;
                default :
                    entry.label = {className: "badge badge-default", value: "Concept"};
                    break;
            }
        } else if (vocabulary === "DBpedia") {
            let arr = suggestion.label.split('|');
            entry.value = arr[0];
            entry.scopeNote = arr[2] ? '(' + arr[2] + ')' : ''
            entry.label = {className: "badge badge-default", value: "Concept"};
        } else if (vocabulary == 'UNESCO') {
            let arr = suggestion.prefLabel.split('|');
            entry.value = arr[0];
            entry.label.value = arr[1];
            switch(arr[1]) {
                case 'Education' :
                    entry.label.className = "badge badge-warning"
                    break;
                case 'Science' :
                    entry.label.className = "badge badge-warning"
                    break;
                case 'Social and human sciences' :
                    entry.label.className = "badge badge-success"
                    break;
                case 'Information and communication' :
                    entry.label.className = "badge badge-info"
                    break;
                case 'Politics, law and economics' :
                    entry.label.className = "badge badge-primary"
                    break;
                case 'Countries and country groupings' :
                    entry.label.className = "badge badge-default"
                    break;
                default :
                    entry.label.className = "badge badge-warning"
                    entry.label.value = "Concept";
                    break;
            }
        }
        return entry;
    },
};

export default AnnotationActions;
