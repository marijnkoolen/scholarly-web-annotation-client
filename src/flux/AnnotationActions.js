import AppDispatcher from "./AppDispatcher";
import AnnotationAPI from "../api/AnnotationAPI";
import AnnotationStore from "../flux/AnnotationStore.js";
import RDFaUtil from "../util/RDFaUtil.js";
import FRBRooUtil from "../util/FRBRooUtil.js";

var restorePermission = () => {
    var permission = {accessStatus: ["private", "public"], permission: "private"};
    try {
        if (window.localStorage && window.localStorage.hasOwnProperty("swac-permission")) {
            permission = JSON.parse(window.localStorage.getItem("swac-permission"));
        }
    } catch (e) {
        // catch errors if no localStorage exists
    }
    //console.log("restoring permissions:", permission);
    return permission;
}

let permission = restorePermission();

var storePermission = (permission) => {
    //console.log("storing permissions:", permission);
    if (!window.localStorage) {
    } else {
        window.localStorage.setItem("swac-permission", JSON.stringify(permission));
    }
}


const AnnotationActions = {

    serverAvailable : false,
    accessStatus : permission.accessStatus, // for retrieving annotations from the server
    permission : permission.permission, // for submitting or updating annotations in the server
    //accessStatus : ["private", "public"], // for retrieving annotations from the server
    //permission : "private", // for submitting or updating annotations in the server
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
        storePermission({permission: AnnotationActions.permission, accessStatus: accessStatus});
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
        storePermission({permission: permission, accessStatus: AnnotationActions.accessStatus});
        AnnotationActions.permission = permission;
    },

    setBaseAnnotationOntology(url) {
        //console.log("AnnotationActions - setBaseAnnotationOntology url:", url);
        FRBRooUtil.baseAnnotationOntologyURL = url;
        RDFaUtil.baseAnnotationOntologyURL = url;
        RDFaUtil.setBaseAnnotationOntology(url);
        //console.log("AnnotationActions - baseAnnotationOntologyURL:", FRBRooUtil.baseAnnotationOntologyURL);
    },

    addListenerElement(element) {
        if (!AnnotationActions.annotationListener.includes(element))
            AnnotationActions.annotationListener.push(element);
    },

    lookupIdentifier(sourceId) {
        var source = { type: null, data: null }; // for IDs to external resources
        //console.log(AnnotationStore.annotationIndex);
        //console.log(AnnotationStore.resourceIndex);
        //console.log(AnnotationStore.externalResourceIndex);
        if (AnnotationStore.annotationIndex.hasOwnProperty(sourceId))
            source = { type: "annotation", data: AnnotationStore.annotationIndex[sourceId] };
        else if (AnnotationStore.resourceIndex.hasOwnProperty(sourceId))
            source = { type: "resource", data: AnnotationStore.resourceIndex[sourceId] };
        else if (AnnotationStore.externalResourceIndex.hasOwnProperty(sourceId))
            source = { type: "external", data: AnnotationStore.externalResourceIndex[sourceId] };
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
        //console.log("loadAnnotations - resourceIds:", resourceIds);
        //console.log(Date());
        if (resourceIds === undefined)
            resourceIds = AnnotationStore.topResources;
        //console.log("loadAnnotations - AnnotationStore.resourceIds:", AnnotationStore.resourceIds);
        //console.log(Date());
        let externalResources = AnnotationActions.getExternalResources(resourceIds);
        //console.log("loadAnnotations - externalResources:", externalResources);
        //console.log(Date());
        let externalIds = externalResources.map((res) => { return res.parentResource }).filter((externalId) => { return typeof externalId === "string"});

        //console.log("loadAnnotations - top externalIds:", externalIds);
        //console.log(Date());
        resourceIds = resourceIds.concat(externalIds);
        //console.log("loadAnnotations - top RDFa resourceIds:", resourceIds);
        //console.log(Date());
        AnnotationAPI.getAnnotationsByTargets(resourceIds, AnnotationActions.accessStatus, (error, annotations) => {
            if (error) {
                //console.error(resourceIds, error.toString());
                window.alert("Error loading annotations: " + error.toString());
            }

            AnnotationStore.annotationIndex = {};
            annotations.forEach((annotation) => {
                AnnotationStore.annotationIndex[annotation.id] = annotation;
            });
            //console.log("AnnotationActions loadAnnotations - dispatchAnnotations");
            //console.log(Date());
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
            if (error) {
                console.log("Error indexing resources");
                console.log(error);
                return callback(error);
            } else {
                //console.log("indexResources - index:", index);
                AnnotationStore.resourceIndex = index.resources;
                //console.log("indexResources - AnnotationStore.resourceIndex:", AnnotationStore.resourceIndex);
                AnnotationStore.relationIndex = index.relations;
                return callback(error);
            }
        }); // ... refresh index
    },

    indexExternalResources: (resources, callback) => {
        var t0 = performance.now();
        //console.log("AnnotationActions indexExternalResources - loading vocabularies");
        //console.log(Date());
        FRBRooUtil.loadVocabularies((error, store) => {
            //console.log("AnnotationActions indexExternalResources - loaded vocabularies");
            //console.log(Date());
            if (error) {
                //console.log(error);
                return callback(error);
            } else if (store === null) {
                // no vocabularies, skip reading external resources
                //console.log("indexExternalResources - returning with undefined vocabularyStore");
                return callback(null, false, null);
            }
            var t1 = performance.now();
            AnnotationStore.vocabularyStore = store;
            AnnotationStore.resourceStore = null;
            AnnotationStore.representedResourceMap = {};
            AnnotationStore.externalResourceIndex = {};
            //console.log("AnnotationActions - vocabularyStore:", store);
            //console.log(Date());
            FRBRooUtil.loadExternalResources(AnnotationStore.vocabularyStore, (error, doIndexing, store) => {
                if (error) {
                    console.log("Error loading external resources using vocabularyStore");
                    console.log(error);
                    return callback(error);
                } else if (!doIndexing) {
                    return callback(null);
                } else {
                    var t2 = performance.now();
                    AnnotationStore.resourceStore = store;
                    //console.log("AnnotationActions - resourceStore:", store);
                    //console.log("AnnotationActions - resources:", resources);
                    //console.log(Date());
                    let representedResourceMap = FRBRooUtil.mapRepresentedResources(store, resources);
                    //console.log("AnnotationActions - representedResourceMap:", representedResourceMap);
                    //console.log(Date());
                    var t3 = performance.now();
                    AnnotationStore.representedResourceMap = representedResourceMap;
                    let externalResourceIndex = FRBRooUtil.indexExternalResources(store, resources);
                    //console.log("AnnotationActions - externalResourceIndex:", externalResourceIndex);
                    //console.log(Date());
                    AnnotationStore.externalResourceIndex = externalResourceIndex;
                    var t4 = performance.now();
                    //console.log("Call to loadVocabularies took " + (t1 - t0) + " milliseconds.");
                    //console.log("Call to loadExternalResources took " + (t2 - t1) + " milliseconds.");
                    //console.log("Call to mapRepresentedResources took " + (t3 - t2) + " milliseconds.");
                    //console.log("Call to indexExternalResources took " + (t4 - t3) + " milliseconds.");
                    //console.log(Date());
                    return callback(null);
                }
            });
        });
    },

    hasExternalResource(resourceId) {
        //console.log(resourceId);
        //console.log(AnnotationStore.externalResourceIndex);
        if (!AnnotationStore.externalResourceIndex) {
            return false;
        } else {
            return AnnotationStore.externalResourceIndex.hasOwnProperty(resourceId);
        }
    },

    hasRepresentedResource(resourceId) {
        //console.log("hasRepresentedResource - representedResourceMap:", AnnotationStore.representedResourceMap);
        if (!AnnotationStore.representedResourceMap) {
            return false;
        } else {
            return AnnotationStore.representedResourceMap.hasOwnProperty(resourceId);
        }
    },

    getRepresentedResource(resourceId) {
        if (!AnnotationStore.externalResourceIndex) {
            throw Error("externalResourceIndex does not exist");
        } else if (!AnnotationStore.externalResourceIndex.hasOwnProperty(resourceId)) {
            throw Error("resourceId does not have represented resource");
        } else {
            return AnnotationStore.externalResourceIndex[resourceId];
        }
    },

    getExternalResources(resourceIds) {
        if (!Array.isArray(resourceIds)) {
            console.log("resourceIds:", resourceIds);
            throw Error("resourceIds should be an array");
        }
        //console.log("resourceIds:", resourceIds);
        //resourceIds.filter((resourceId) => { console.log(resourceId); console.log(AnnotationActions.hasExternalResource(resourceId)) ;})
        //console.log("filtered:", resourceIds.filter(AnnotationActions.hasExternalResource));
        return resourceIds.filter(AnnotationActions.hasExternalResource).map((resourceId) => {
            return AnnotationActions.getExternalResource(resourceId);
        });
    },

    getExternalResource(resourceId) {
        if (!AnnotationStore.externalResourceIndex) {
            return null;
        } else if (AnnotationStore.externalResourceIndex.hasOwnProperty(resourceId)) {
            return AnnotationStore.externalResourceIndex[resourceId];
        } else {
            return null;
        }
    },

    loadResources: () => {
        //console.log("loadResources - getTopRDFaResources");
        //console.log(Date());
        AnnotationStore.topResources = RDFaUtil.getTopRDFaResources();
        //console.log("loadResources - topResources:", AnnotationStore.topResources);
        //console.log(Date());
        AnnotationActions.indexResources((error) => {
            if (error) {
                //console.error(error);
                window.alert("Error indexing RDFa resources in this page\n" + error.toString());
                return error;
            }
            //console.log("loadResources - indexResources done");
            //console.log(Date());
            //console.log("loadResources - AnnotationStore.resourceIndex:", AnnotationStore.resourceIndex);
            //console.log(Date());
            AnnotationStore.resourceMaps = RDFaUtil.buildResourcesMaps(); // .. rebuild maps
            //console.log("loadResources - resourceMaps:", AnnotationStore.resourceMaps);
            //console.log(Date());
            let resources = Object.keys(AnnotationStore.resourceIndex);
            //console.log("loadResources - resources:", resources);
            //console.log(Date());
            AnnotationActions.indexExternalResources(resources, (error) => {
                if (error) {
                    console.log("error indexing external resources");
                    console.log(error);
                    return error;
                } else {
                    //console.log("external resources indexed");
                    //console.log(Date());
                    //console.log(AnnotationStore.externalResourceIndex);
                    //console.log(Date());
                    AppDispatcher.dispatch({
                        eventName: "loaded-resources",
                        topResources: AnnotationStore.topResources,
                        resourceMaps: AnnotationStore.resourceMaps
                    });
                    AnnotationActions.loadAnnotations(AnnotationStore.topResources);
                    return null;
                }
            });
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
                //console.log("AnnotationActions loginUser - loadResources");
                //console.log(Date());
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
