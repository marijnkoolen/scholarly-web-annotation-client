import AppDispatcher from './AppDispatcher';
import AnnotationAPI from '../api/AnnotationAPI';
import RDFaUtil from '../util/RDFaUtil.js';

const AnnotationActions = {

    getServerAddress() {
        return AnnotationAPI.getServerAddress();
    },

    setServerAddress(apiURL) {
        return AnnotationAPI.setServerAddress(apiURL);
    },

    annotationIndex : {},
    resourceIndex : {},
    topResources : [],

    lookupIdentifier(sourceId) {
        var source = { type: null, data: null }; // for IDs to external resources
        if (AnnotationActions.annotationIndex.hasOwnProperty(sourceId))
            source = { type: "annotation", data: AnnotationActions.annotationIndex[sourceId] };
        else if (AnnotationActions.resourceIndex.hasOwnProperty(sourceId))
            source = { type: "resource", data: AnnotationActions.resourceIndex[sourceId] };
        return source;
    },

    save : function(annotation) {
        console.log(annotation);
        AnnotationAPI.saveAnnotation(annotation, (error, data) => {
            console.log(data);
            AppDispatcher.dispatch({
                eventName: 'save-annotation',
                annotation: data
            });
        });
    },

    delete : function(annotation) {
        AnnotationAPI.deleteAnnotation(annotation, (error, data) => {
            console.log(data);
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
        if (resourceIds === undefined)
            resourceIds = this.topResources;
        AnnotationAPI.getAnnotationsByTargets(resourceIds, (error, annotations) => {
            if (error)
                console.error(resourceIds, error.toString());

            annotations.forEach(function(annotation) {
                AnnotationActions.annotationIndex[annotation.id] = annotation;
            });
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
        this.topResources = RDFaUtil.getTopRDFaResources(document.body);
        this.resourceIndex = RDFaUtil.indexRDFaResources(); // ... refresh index
        this.resourceMaps = RDFaUtil.buildResourcesMaps(); // .. rebuild maps
        this.registerResources(this.resourceMaps);
        AppDispatcher.dispatch({
            eventName: 'load-resources',
            topResources: this.topResources,
            resourceMaps: this.resourceMaps
        });
        console.log('loadAnnotations');
        this.loadAnnotations(this.topResources);
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
