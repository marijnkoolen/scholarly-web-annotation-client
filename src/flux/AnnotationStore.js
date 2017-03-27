import MicroEvent from 'microevent';
import AnnotationAPI from '../api/AnnotationAPI';
import AppDispatcher from './AppDispatcher';

//See: https://github.com/jeromeetienne/microevent.js


class AnnotationStore {

    getServerAddress() {
        return AnnotationAPI.getServerAddress();
    }

    setServerAddress(apiURL) {
        return AnnotationAPI.setServerAddress(apiURL);
    }

    loadAnnotations(resourceIds) {
        AnnotationAPI.getAnnotationsByTargets(resourceIds, (error, annotations) => {
            if (error)
                console.error(resourceIds, error.toString());
            this.trigger('loaded-annotations', annotations);
        });
    }

    changeTarget() {
        this.trigger('changed-target');
    }

    //TODO change the name of the event 'change' --> save-annotation
    save(annotation) {
        AnnotationAPI.saveAnnotation(annotation, (data) => {
            //notify all components that just listen to a single target (e.g. FlexPlayer, FlexImageViewer)
            this.trigger(annotation.target.source, 'update', data, annotation);
            //then notify all components that are interested in all annotations
            this.trigger('saved-annotation', data, annotation);
        });
    }

    delete(annotation) {
        AnnotationAPI.deleteAnnotation(annotation, (data, annotation) => {
            //notify all components that just listen to a single target (e.g. FlexPlayer, FlexImageViewer)
            this.trigger(annotation.target.source, 'delete', data, annotation);
            //then notify all components that are interested in all annotations
            this.trigger('deleted-annotation', data, annotation);
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

    loadResources() {
        this.trigger('load-resources');
    }

    login(userDetails) {
        AnnotationAPI.login(userDetails, (response) => {
            this.trigger('login-user', response);
        });
    }

    logout(userDetails) {
        this.trigger('logout-user', userDetails);
    }

    registerResources(maps) {
        console.log(maps);
        Object.keys(maps).forEach((resourceId, index) => {
            AnnotationAPI.registerResource(resourceId, maps[resourceId], (error, data) => {
                if (error)
                    return null;

                if (index === Object.keys(maps).length -1)
                    this.trigger('registered-resources', Object.keys(maps));
            });
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
        case 'load-resources':
            AppAnnotationStore.loadResources();
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
