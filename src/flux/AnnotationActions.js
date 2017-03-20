import AppDispatcher from './AppDispatcher';

const AnnotationActions = {

    save : function(annotation) {
        AppDispatcher.dispatch({
            eventName: 'save-annotation',
            annotation: annotation
        });
    },

    delete : function(annotation) {
        AppDispatcher.dispatch({
            eventName: 'delete-annotation',
            annotation: annotation
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

    load: function(resourceIds) {
        AppDispatcher.dispatch({
            eventName: 'load-annotations',
            resourceIds: resourceIds
        });
    },

    reload: function() {
        AppDispatcher.dispatch({
            eventName: 'reload-annotations'
        });
    },

    loadResources: function() {
        AppDispatcher.dispatch({
            eventName: 'load-resources'
        });
    },

    login : function(userDetails) {
        AppDispatcher.dispatch({
            eventName: 'login-user',
            userDetails: userDetails
        });
    },

    logout : function() {
        AppDispatcher.dispatch({
            eventName: 'logout-user',
            userDetails: null
        });
    }

}

export default AnnotationActions;
