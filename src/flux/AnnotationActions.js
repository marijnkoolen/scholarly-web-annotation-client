import AppDispatcher from './AppDispatcher';
import AnnotationAPI from '../api/AnnotationAPI';
import RDFaUtil from '../util/RDFaUtil.js';

const AnnotationActions = {

    serverAvailable : false,

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
                eventName: 'server-status-change',
                serverAvailable: serverAvailable
            });
            if (!serverAvailable) {
                console.error("Annotation server not reachable");
            }
        });
        setTimeout(AnnotationActions.pollServer, 60000);
    },

    getAccessStatus() {
        return AnnotationActions.accessStatus;
    },

    setAccessStatus(accessStatus) {
        AnnotationActions.accessStatus = accessStatus;
        console.log("Updating access status:", AnnotationActions.accessStatus);
        if (AnnotationActions.accessStatus.length === 0) {
            AnnotationActions.dispatchAnnotations([]); // when no access levels are selected
        } else {
            AnnotationActions.loadAnnotations(AnnotationActions.topResources);
        }
    },

    getPermission() {
        return AnnotationActions.permission;
    },

    setPermission(permission) {
        AnnotationActions.permission = permission;
        console.log("Updating permission:", AnnotationActions.permission);
    },

    accessStatus : ["private"], // for retrieving annotations from the server
    permission : "private", // for submitting or updating annotations in the server
    annotationIndex : {},
    resourceIndex : {},
    topResources : [],
    annotationListener: [],

    addListenerElement(element) {
        if (!AnnotationActions.annotationListener.includes(element))
            AnnotationActions.annotationListener.push(element);
    },

    lookupIdentifier(sourceId) {
        var source = { type: null, data: null }; // for IDs to external resources
        if (AnnotationActions.annotationIndex.hasOwnProperty(sourceId))
            source = { type: "annotation", data: AnnotationActions.annotationIndex[sourceId] };
        else if (AnnotationActions.resourceIndex.hasOwnProperty(sourceId))
            source = { type: "resource", data: AnnotationActions.resourceIndex[sourceId] };
        return source;
    },

    lookupAnnotationsByTarget(resourceId) {
        return Object.values(AnnotationActions.annotationIndex).filter((annotation) => {
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
        console.log("saving annotation with permission level", AnnotationActions.permission);
        AnnotationAPI.saveAnnotation(annotation, AnnotationActions.permission, (error, data) => {
            AppDispatcher.dispatch({
                eventName: 'save-annotation',
                annotation: data
            });
        });
    },

    delete : function(annotation) {
        AnnotationAPI.deleteAnnotation(annotation, (error, data) => {
            AppDispatcher.dispatch({
                eventName: 'delete-annotation',
                annotation: data
            });
        });
    },

    activate : function(annotation) {
        AppDispatcher.dispatch({
            eventName: 'activate-annotation',
            annotation: annotation
        });
    },

    edit : function(annotation) { //is the annotation always on the same page?
        AppDispatcher.dispatch({
            eventName: 'edit-annotation',
            annotation: annotation
        });
    },

    createAnnotation : function(annotationTargets) { //is the annotation always on the same page?
        AppDispatcher.dispatch({
            eventName: 'create-annotation',
            annotationTargets: annotationTargets
        });
    },

    set : function(annotation) { //is the annotation always on the same page?
        AppDispatcher.dispatch({
            eventName: 'set-annotation',
            annotation: annotation
        });
    },

    play : (annotation) => { //is the annotation always on the same page? (no)
        AppDispatcher.dispatch({
            eventName: 'play-annotation',
            annotation: annotation
        });
    },

    changeTarget : (annotationTarget) => {
        AppDispatcher.dispatch({
            eventName: 'change-target',
            annotationTarget: annotationTarget
        });
    },

    loadAnnotations: (resourceIds) => {
        if (resourceIds === undefined)
            resourceIds = AnnotationActions.topResources;
        AnnotationAPI.getAnnotationsByTargets(resourceIds, AnnotationActions.accessStatus, (error, annotations) => {
            if (error)
                console.error(resourceIds, error.toString());

            AnnotationActions.annotationIndex = {};
            annotations.forEach((annotation) => {
                AnnotationActions.annotationIndex[annotation.id] = annotation;
            });
            AnnotationActions.dispatchAnnotations(annotations);
        });
    },

    copyAnnotation: (annotation) => {
        // remove id, creation timestamp, permissions (assume permission of current user setting)
        delete annotation.id;
        delete annotation.created
        delete annotation.premissions;
        AnnotationAPI.saveAnnotation(annotation, AnnotationActions.permission, (error, data) => {
            AppDispatcher.dispatch({
                eventName: 'save-annotation',
                annotation: data
            });
        });
    },

    dispatchAnnotations(annotations) {
        AppDispatcher.dispatch({
            eventName: 'load-annotations',
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

    reload: function() {
        AppDispatcher.dispatch({
            eventName: 'reload-annotations'
        });
    },

    indexResources: function(callback) {
        RDFaUtil.indexRDFaResources((error, index) => {
            AnnotationActions.resourceIndex = index;
            return callback(error);
        }); // ... refresh index
    },

    loadResources: function() {
        AnnotationActions.topResources = RDFaUtil.getTopRDFaResources();
        AnnotationActions.indexResources((error) => {
            if (error) {
                console.error(error);
                alert("Error indexing RDFa resources in this page");
                return false;
            }
            AnnotationActions.resourceMaps = RDFaUtil.buildResourcesMaps(); // .. rebuild maps
            AppDispatcher.dispatch({
                eventName: 'load-resources',
                topResources: AnnotationActions.topResources,
                resourceMaps: AnnotationActions.resourceMaps
            });
            AnnotationActions.loadAnnotations(AnnotationActions.topResources);
        });
    },

    registerUser : function(userDetails) {
        AnnotationAPI.registerUser(userDetails, (error, data) => {
            if (error) {
                AppDispatcher.dispatch({
                    eventName: 'register-failed',
                    userDetails: userDetails
                });
            } else {
                AppDispatcher.dispatch({
                    eventName: 'register-succeeded',
                    userDetails: userDetails
                });
            }
        });
    },

    loginUser : function(userDetails) {
        AnnotationAPI.loginUser(userDetails, (error, data) => {
            if (error) {
                AppDispatcher.dispatch({
                    eventName: 'login-failed',
                    userDetails: error
                });
            } else {
                AnnotationActions.loadResources();
                AppDispatcher.dispatch({
                    eventName: 'login-succeeded',
                    userDetails: userDetails
                });
            }
        });
    },

    logoutUser : function() {
        AnnotationAPI.logoutUser((error, data) => {
            AppDispatcher.dispatch({
                eventName: 'logout-user',
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

}

export default AnnotationActions;
