import AppDispatcher from './AppDispatcher';
import AnnotationAPI from '../api/AnnotationAPI';
import RDFaUtil from '../util/RDFaUtil.js';

const AnnotationActions = {

    getOwnServerAddress() {
        return AnnotationAPI.getServerAddress();
    },

    setOwnServerAddress(apiURL) {
        return AnnotationAPI.setServerAddress(apiURL);
    },

    save : function(annotation) {
        AnnotationAPI.saveAnnotation(annotation, (error, data) => {
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

    set : function(annotation) { //is the annotation always on the same page?
        AppDispatcher.dispatch({
            eventName: 'set-annotation',
            annotation: annotation
        });
    },

    play : function(annotation) { //is the annotation always on the same page? (no)
        AppDispatcher.dispatch({
            eventName: 'play-annotation',
            annotation: annotation
        });
    },

    changeTarget : function(annotationTarget) {
        AppDispatcher.dispatch({
            eventName: 'change-target',
            annotationTarget: annotationTarget
        });
    },

    loadAnnotations: function(resourceIds) {
        console.log(resourceIds);
        AnnotationAPI.getAnnotationsByTargets(resourceIds, (error, annotations) => {
            if (error)
                console.error(resourceIds, error.toString());
            AppDispatcher.dispatch({
                eventName: 'load-annotations',
                annotations: annotations
            });
        });
    },

    reload: function() {
        AppDispatcher.dispatch({
            eventName: 'reload-annotations'
        });
    },

    loadResources: function() {
        console.log("loading resources");
        let topResources = RDFaUtil.getTopRDFaResources(document.body);
        let resourceIndex = RDFaUtil.indexRDFaResources(); // ... refresh index
        let resourceMaps = RDFaUtil.buildResourcesMaps(); // .. rebuild maps
        this.registerResources(resourceMaps);
        AppDispatcher.dispatch({
            eventName: 'load-resources',
            topResources: topResources,
            resourceIndex: resourceIndex,
            resourceMaps: resourceMaps
        });
    },

    login : function(userDetails) {
        AnnotationAPI.login(userDetails, (error, data) => {
            AppDispatcher.dispatch({
                eventName: 'login-user',
                userDetails: userDetails
            });
        });
    },

    logout : function() {
        AppDispatcher.dispatch({
            eventName: 'logout-user',
            userDetails: null
        });
    },

    getServerAddress : function() {
        AppDispatcher.dispatch({
            eventName: 'get-server-address'
        });
    },

    setServerAddress : function(apiURL) {
        AppDispatcher.dispatch({
            eventName: 'set-server-address',
            apiURL: apiURL
        });
    },

    registerResources : function(maps) {
        console.log("registering resources");
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
