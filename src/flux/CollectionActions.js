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

    editCollection(collection) {
        AppDispatcher.dispatch({
            eventName: 'edit-collection',
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
        AnnotationAPI.getCollection(collectionId, (error, collection) => {
            if (error)
                return null;

            AppDispatcher.dispatch({
                eventName: 'loaded-collection',
                collection: collection,
            });
        });
    },

    getCollectionPage(collectionPageURL) {
        console.log(collectionPageURL);
        AnnotationAPI.getCollectionPage(collectionPageURL, (error, page) => {
            if (error)
                return null;

            AppDispatcher.dispatch({
                eventName: 'loaded-page',
                page: page,
            });
        });
    },

    addAnnotation(collectionId, annotation) {
        AnnotationAPI.addAnnotation(collectionId, annotation, (error, collection) => {
            if (error)
                return null;

            AppDispatcher.dispatch({
                eventName: 'updated-collection',
				collection: collection
            });
        });
    },

    removeAnnotation(collectionId, annotationId) {
        AnnotationAPI.removeAnnotation(collectionId, annotationId, (error, pageId) => {
            if (error)
                return null;

            AppDispatcher.dispatch({
                eventName: 'updated-collection',
                page: pageId,
            });
        });
    },

}

export default CollectionActions;
