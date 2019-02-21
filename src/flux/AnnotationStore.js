import MicroEvent from "microevent";
import AppDispatcher from "./AppDispatcher";

//See: https://github.com/jeromeetienne/microevent.js


class AnnotationStore {


    setTargetObserverClass() {
        return this.clientConfiguration.targetObserverClass;
    }

    getTargetObserverClass() {
        return this.clientConfiguration.targetObserverClass;
    }

    loadAnnotations(annotations) {
        this.trigger("loaded-annotations", annotations);
    }

    changeTarget() {
        this.trigger("changed-target");
    }

    //TODO change the name of the event 'change' --> save-annotation
    save(annotation) {
        //console.log(annotation);
        //notify all components that just listen to a single target
        this.trigger(annotation.target.source, "update", annotation);
        //then notify all components that are interested in all annotations
        this.trigger("load-annotations");
        // then notify components interested in the saved annotation
        this.trigger("saved-annotation", annotation);
    }

    delete(annotation) {
        //console.log(annotation);
        //then notify all components that are interested in all annotations
        this.trigger("load-annotations");
        // then notify all components that are interested in the deleted annotation
        this.trigger("deleted-annotation", annotation);
    }

    activate(annotation) {
        this.trigger("activate-annotation", annotation);
    }

    edit(annotation) {
        this.trigger("edit-annotation", annotation);
    }

    createAnnotation(annotationTargets) {
        this.trigger("create-annotation", annotationTargets);
    }

    set(annotation) {
        this.trigger("set-annotation", annotation);
    }

    play(annotation) {
        this.trigger("play-annotation", annotation);
    }

    reloadAnnotations() {
        this.trigger("reload-annotations");
    }

    loadResources(topResources, resourceMaps) {
        this.trigger("loaded-resources", topResources, resourceMaps);
    }

    loadCollections(collections) {
        this.trigger("load-collections", collections);
    }

    login(userDetails, triggerMessage) {
        this.trigger(triggerMessage, userDetails);
    }

    logout(userDetails) {
        this.trigger("logout-user", userDetails);
    }

    changeServerStatus(serverAvailable) {
        this.trigger("server-status-change", serverAvailable);
    }

}

var AppAnnotationStore = new AnnotationStore();

//add support for emitting events
MicroEvent.mixin(AnnotationStore);

AppDispatcher.register( function( action ) {

    switch(action.eventName) {

    case "save-annotation":
        AppAnnotationStore.save(action.annotation);
        break;
    case "delete-annotation":
        AppAnnotationStore.delete(action.annotation);
        break;
    case "activate-annotation":
        AppAnnotationStore.activate(action.annotation, action.callback);
        break;
    case "edit-annotation":
        AppAnnotationStore.edit(action.annotation, action.callback);
        break;
    case "create-annotation":
        AppAnnotationStore.createAnnotation(action.annotationTargets, action.callback);
        break;
    case "set-annotation":
        AppAnnotationStore.set(action.annotation, action.callback);
        break;
    case "play-annotation":
        AppAnnotationStore.play(action.annotation, action.callback);
        break;
    case "change-target":
        AppAnnotationStore.changeTarget(action.annotationTarget);
        break;
    case "load-annotations":
        AppAnnotationStore.loadAnnotations(action.annotations, action.callback);
        break;
    case "reload-annotations":
        AppAnnotationStore.reloadAnnotations();
        break;
    case "loaded-resources":
        AppAnnotationStore.loadResources(action.topResources, action.resourceMaps);
        break;
    case "load-collections":
        AppAnnotationStore.loadCollections(action.collections, action.callback);
        break;
    case "login-succeeded":
        AppAnnotationStore.login(action.userDetails, "login-succeeded");
        break;
    case "login-failed":
        AppAnnotationStore.login(action.userDetails, "login-failed");
        break;
    case "logout-user":
        AppAnnotationStore.logout(action.userDetails);
        break;
    case "register-succeeded":
        AppAnnotationStore.login(action.userDetails, "register-succeeded");
        break;
    case "register-failed":
        AppAnnotationStore.logout(action.userDetails, "register-failed");
        break;
    case "get-server-address":
        AppAnnotationStore.getServerAddress();
        break;
    case "set-server-address":
        AppAnnotationStore.setServerAddress(action.apiURL);
        break;
    case "register-resources":
        AppAnnotationStore.registerResources(action.maps);
        break;
    case "server-status-change":
        AppAnnotationStore.changeServerStatus(action.serverAvailable);
        break;

    }

});

export default AppAnnotationStore;
