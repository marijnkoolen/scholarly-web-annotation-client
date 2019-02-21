
'use strict'

import React from 'react';
import Collection from './Collection.jsx';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import AppCollectionStore from './../../flux/CollectionStore';
import AppAnnotationStore from './../../flux/AnnotationStore';
import CollectionActions from '../../flux/CollectionActions.js';

export default class CollectionViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collections: [],
            default: null
        }
    }

    componentDidMount() {
        AppCollectionStore.bind('loaded-collections', this.listCollections.bind(this));
        AppCollectionStore.bind('saved-collection', this.getCollections.bind(this));
        AppCollectionStore.bind('updated-collection', this.getCollections.bind(this));
        AppAnnotationStore.bind('saved-annotation', this.addAnnotation.bind(this));
        AppAnnotationStore.bind('deleted-annotation', this.getCollections.bind(this));
        AppCollectionStore.bind('deleted-collection', this.getCollections.bind(this));
        AppCollectionStore.bind('default-collection', this.setDefaultCollection.bind(this));
        CollectionActions.getCollections();
    }

    setDefaultCollection(collectionId) {
        this.setState({default: collectionId});
    }

    addAnnotation(annotation) {
        if (this.state.default)
            CollectionActions.addAnnotation(this.state.default, annotation);
    }

    getCollections() {
        CollectionActions.getCollections();
    }

    listCollections(collections) {
        this.setState({collections: collections});
    }

    render() {
        let component = this;
        let collections = component.state.collections.map((collection, index) => {
            let key = "collection-" + index;
            return (
                <Collection
                    collection={collection}
                    currentUser={component.props.currentUser}
                    key={key}
                    defaultCollection={this.state.default}
                />
            )
        })
        return (
            <div className="CollectionList">
                <h3>Saved collections</h3>
                <ul className="list-group annotation-scroll-list">
                    {collections}
                </ul>
            </div>
        )
    }

}

