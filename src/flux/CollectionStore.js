import MicroEvent from 'microevent';
import AppDispatcher from './AppDispatcher';

//See: https://github.com/jeromeetienne/microevent.js


class CollectionStore {

    defaultTrigger(message, data) {
        this.trigger(message, data);
    }

}

var AppCollectionStore = new CollectionStore();

//add support for emitting events
MicroEvent.mixin(CollectionStore);

AppDispatcher.register( function( action ) {

    switch(action.eventName) {

        case 'loaded-collections':
            AppCollectionStore.defaultTrigger(action.eventName, action.collections);
            break;
        case 'loaded-collection':
            AppCollectionStore.defaultTrigger(action.eventName, action.collection);
            break;
        case 'loaded-page':
            AppCollectionStore.defaultTrigger(action.eventName, action.page);
            break;
        case 'saved-collection':
            AppCollectionStore.defaultTrigger(action.eventName, action.collection);
            break;
        case 'deleted-collection':
            AppCollectionStore.defaultTrigger(action.eventName, action.collection);
            break;
        case 'updated-collection':
            AppCollectionStore.defaultTrigger(action.eventName, action.page);
            break;
        case 'default-collection':
            AppCollectionStore.defaultTrigger(action.eventName, action.collection);
            break;
        case 'edit-collection':
            AppCollectionStore.defaultTrigger(action.eventName, action.collection);
            break;

    }
});

export default AppCollectionStore;


