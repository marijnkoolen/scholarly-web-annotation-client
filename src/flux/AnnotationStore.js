import MicroEvent from 'microevent';
import AppDispatcher from './AppDispatcher';

//See: https://github.com/jeromeetienne/microevent.js


class AnnotationStore {

    loadAnnotations(annotations) {
        this.trigger('loaded-annotations', annotations);
    }

    changeTarget() {
        this.trigger('changed-target');
    }

    //TODO change the name of the event 'change' --> save-annotation
    save(annotation) {
        console.log(annotation);
        //notify all components that just listen to a single target
        this.trigger(annotation.target.source, 'update', annotation);
        //then notify all components that are interested in all annotations
        this.trigger('load-annotations');
    }

    delete(annotation) {
        console.log(annotation);
        //notify all components that just listen to a single target
        this.trigger(annotation.target.source, 'delete', annotation);
        //then notify all components that are interested in all annotations
        this.trigger('load-annotations');
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

    loadResources(topResources, resourceIndex, resourceMaps) {
        this.trigger('load-resources', topResources, resourceIndex, resourceMaps);
    }

    login(userDetails) {
        this.trigger('login-user', userDetails);
    }

    logout(userDetails) {
        this.trigger('logout-user', userDetails);
    }

}

var AppAnnotationStore = new AnnotationStore();

//add support for emitting events
MicroEvent.mixin(AnnotationStore);

AppDispatcher.register( function( action ) {

    switch(action.eventName) {

        case 'save-annotation':
            console.log(action);
            AppAnnotationStore.save(action.annotation);
            break;
        case 'delete-annotation':
            AppAnnotationStore.delete(action.annotation);
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
            AppAnnotationStore.loadAnnotations(action.annotations, action.callback);
            break;
        case 'reload-annotations':
            AppAnnotationStore.reloadAnnotations();
            break;
        case 'load-resources':
            AppAnnotationStore.loadResources(action.topResources, action.resourceIndex, action.resourceMaps);
            break;
        case 'login-user':
            AppAnnotationStore.login(action.userDetails);
            break;
        case 'logout-user':
            AppAnnotationStore.logout(action.userDetails);
            break;
        case 'get-server-address':
            AppAnnotationStore.getServerAddress();
            break;
        case 'set-server-address':
            AppAnnotationStore.setServerAddress(action.apiURL);
            break;
        case 'register-resources':
            console.log("registering resources");
            AppAnnotationStore.registerResources(action.maps);
            break;

    }

});

export default AppAnnotationStore;
