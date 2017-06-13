import AppDispatcher from './AppDispatcher';
import AnnotationAPI from '../api/AnnotationAPI';
import RDFaUtil from '../util/RDFaUtil.js';

const CollectionActions = {

    getServerAddress() {
        return AnnotationAPI.getServerAddress();
    },

    setServerAddress(apiURL) {
        return AnnotationAPI.setServerAddress(apiURL);
    },

    save(collection) {
        AnnotationAPI.saveCollection(collection, (error, data) => {
            if (error)
                return null;

            AppDispatcher.dispatch({
                eventName: 'saved-collection',
                collection: data,
            });
        });
    },

    delete(collection) {
        AnnotationAPI.deleteCollection(collection, (error, data) => {
            if (error)
                return null;

            AppDispatcher.dispatch({
                eventName: 'deleted-collection',
                collection: data,
            });
        })
    },

    update(collection) {
        console.log(collection);
    },

    editLabel(collection) {
        AppDispatcher.dispatch({
            eventName: 'edit-collection-label',
            collection: collection
        });
    },

    setDefault(collection) {
        AppDispatcher.dispatch({
            eventName: 'default-collection',
            collection: collection
        });
    },

    getCollections() {
        AnnotationAPI.getCollections((error, collections) => {
            if (error)
                return null;

            AppDispatcher.dispatch({
                eventName: 'loaded-collections',
                collections: collections,
            });
        })
    },

    getCollection(collectionId) {
        console.log(collectionId);
    },

    getCollectionPage(collectionPageId) {
        console.log(collectionPageId);
    },

    addAnnotation(collectionId, annotationId) {
        AnnotationAPI.addAnnotation(collectionId, annotationId, (error, pageId) => {
            if (error)
                return null;

            AppDispatcher.dispatch({
                eventName: 'updated-collection',
                page: pageId,
            });
        });
    }

}

export default CollectionActions;
