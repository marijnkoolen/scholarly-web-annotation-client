import MicroEvent from 'microevent';
import AnnotationAPI from '../api/AnnotationAPI';
import AppDispatcher from './AppDispatcher';
//import SearchAPI from '../api/SearchAPI';

//See: https://github.com/jeromeetienne/microevent.js


class AnnotationStore {

    loadAnnotations(resourceIds) {
        AnnotationAPI.getAnnotationsByTargets(resourceIds, (error, annotations) => {
            if (error)
                console.error(resourceIds, error.toString());
            this.trigger('load-annotations', annotations);
        });
    }

    //DEPRECATED: TODO components calling this function, should switch to getMediaObjectAnnotations()
    getFiltered(field, value, callback) {
        AnnotationAPI.getFilteredAnnotations(field, value, callback);
    }

    //TODO the Search API call should be put inside the Annotation API
    //getMediaObjectAnnotations(mediaObjectURI, callback) {
        //SearchAPI.getAnnotationsOfMediaObject(mediaObjectURI, callback);
    //}



    changeTarget() {
        this.trigger('change-target');
    }

    //TODO change the name of the event 'change' --> save-annotation
    save(annotation) {
        AnnotationAPI.saveAnnotation(annotation, (data) => {
            //notify all components that just listen to a single target (e.g. FlexPlayer, FlexImageViewer)
            this.trigger(annotation.target.source, 'update', data, annotation);
            //then notify all components that are interested in all annotations
            this.trigger('save-annotation', data, annotation);
        });
    }

    delete(annotation) {
        AnnotationAPI.deleteAnnotation(annotation, (data, annotation) => {
            //notify all components that just listen to a single target (e.g. FlexPlayer, FlexImageViewer)
            this.trigger(annotation.target.source, 'delete', data, annotation);
            //then notify all components that are interested in all annotations
            this.trigger('del-annotation', data, annotation);
        });
    }

    activate(annotation) {
        this.trigger('activate-annotation', annotation);
    }

    edit(annotation) {
        this.trigger('edit-annotation', annotation);
    }

    set(annotation) {
        this.trigger('set-annotation', annotation);
    }

    play(annotation) {
        this.trigger('play-annotation', annotation);
    }

    reloadAnnotations() {
        this.trigger('reload-annotations');
    }

    login(userDetails) {
        AnnotationAPI.login(userDetails, (response) => {
            this.trigger('login-user', response);
        });
    }

}

var AppAnnotationStore = new AnnotationStore();

//add support for emitting events
MicroEvent.mixin(AnnotationStore);

AppDispatcher.register( function( action ) {

    switch(action.eventName) {

        case 'save-annotation':
            AppAnnotationStore.save(action.annotation, action.callback);
            break;
        case 'delete-annotation':
            AppAnnotationStore.delete(action.annotation, action.callback);
            break;
        case 'activate-annotation':
            AppAnnotationStore.activate(action.annotation, action.callback);
            break;
        case 'edit-annotation':
            AppAnnotationStore.edit(action.annotation, action.callback);
            break;
        case 'set-annotation':
            AppAnnotationStore.set(action.annotation, action.callback);
            break;
        case 'play-annotation':
            AppAnnotationStore.play(action.annotation, action.callback);
            break;
        case 'change-target':
            AppAnnotationStore.changeTarget(action.annotationTarget);
            break;
        case 'load-annotations':
            AppAnnotationStore.loadAnnotations(action.resourceIds, action.callback);
            break;
        case 'reload-annotations':
            AppAnnotationStore.reloadAnnotations();
            break;
        case 'login-user':
            AppAnnotationStore.login(action.userDetails);
            break;

    }

});

export default AppAnnotationStore;
