
'use strict'

import React from 'react';
import FlexModal from '../FlexModal';
import Annotation from '../annotation/Annotation.jsx';
import AppCollectionStore from '../../flux/CollectionStore';
import AppAnnotationStore from '../../flux/AnnotationStore';
import CollectionActions from '../../flux/CollectionActions';

export default class CollectionCreator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            annotations: [],
            collectionLabel: "",
            page: null,
            showModal: false,
            toAdd: [],
            toRemove: [],
            view: "label",
        }
    }

    componentDidMount() {
        AppCollectionStore.bind('edit-collection', this.editCollection.bind(this));
        AppCollectionStore.bind('updated-collection', this.fetchPage.bind(this));
        AppCollectionStore.bind('loaded-collection', this.setCollection.bind(this));
        AppAnnotationStore.bind('loaded-annotations', this.setAnnotations.bind(this));
        AppCollectionStore.bind('loaded-page', this.setPage.bind(this));
    }

    setCollection(collection) {
        this.setState({collection: collection});
    }

    setAnnotations(annotations) {
        this.setState({annotations: annotations});
    }

    setPage(page) {
        this.setState({page: page});
    }

    fetchPage(pageId) {
        CollectionActions.getCollectionPage(pageId);
    }

    handleChange(event) {
        this.setState({collectionLabel: event.target.value});
    }

    makeCollection() {
        var collection = {
            creator: this.props.currentUser.username
        };
        this.editCollection(collection);
    }
    editCollection(collection) {
        var page = null;
        if (collection.label !== undefined)
            this.setState({collectionLabel: collection.label});
        if (collection.last !== null) {
            page = collection.last;
            CollectionActions.getCollectionPage(collection.last);
        }
        this.setState({collection: collection, page: page});
        this.setState({showModal: true})
    }
    hideCollectionForm() {
        this.setState({showModal: false});
    }

    saveCollection() {
        $('#collection__modal').modal('hide');//TODO ugly, but without this the static backdrop won't disappear!
        var collection = this.state.collection;
        collection.label = this.state.collectionLabel;
        CollectionActions.save(collection);
        this.setState({
            showModal: false,
            collectionLabel: "",
            collection: null,
            page: null,
            annotations: [],
        });
    }

    addToCollection(annotation) {
        console.log("To add:");
        CollectionActions.addAnnotation(this.state.collection.id, annotation.id);
    }

    removeFromCollection(annotation) {
        console.log("To remove:");
        CollectionActions.removeAnnotation(this.state.collection.id, annotation.id);
    }

    render() {
        let component = this;
        var addCandidates = [];
        var removeCandidates = [];

        let pageItems = (this.state.page && this.state.page.items !== undefined) ? this.state.page.items : [];
        let pageIds = pageItems.map((annotation) => {return annotation.id});

        addCandidates = this.state.annotations.filter((annotation) => {return pageIds.includes(annotation.id) === false;}).map((annotation) => {

            return (
                <div
                    onClick={() => {component.addToCollection(annotation)}}
                    key={annotation.id}
                >
                    <Annotation
                        annotation={annotation}
                        currentUser={null}
                    />
                </div>
            );
        });
        removeCandidates = pageItems.map((annotation) => {
            return (
                <div
                    onClick={() => {component.removeFromCollection(annotation)}}
                    key={annotation.id}
                >
                    <Annotation
                        annotation={annotation}
                        currentUser={null}
                    />
                </div>
            );
        });

        let labelEditor = (() => {
            return (
                <div className="collection-creator-header">
                    <label>Collection label: </label>
                    <input
                        ref="label"
                        type="text"
                        value={this.state.collectionLabel}
                        onChange={this.handleChange.bind(this)}
                    />
                </div>
            );
        })()

        let contentEditor = (() => {
            return (
                <div className="row">
                    <div className="collection-content-editor row">
                        <div className="col-md-1">
                        </div>
                        <div className="col-md-5">
                            <h4>Select annotations to remove</h4>
                            {removeCandidates}
                        </div>
                        <div className="col-md-5">
                            <h4>Select annotations to add</h4>
                            {addCandidates}
                        </div>
                        <div className="col-md-1">
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <button
                                className="btn btn-default"
                                onClick={this.removeFromCollection.bind(this)}
                            >
                                Remove
                            </button>
                        </div>
                        <div className="col-md-6">
                            <button
                                className="btn btn-default"
                                onClick={this.addToCollection.bind(this)}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            );
        })();

        var editor = null;
        let editViews = ["label", "content"];

        let editorTabContents = editViews.map((editView) => {
            if (editView === "label")
                editor = labelEditor;
            if (editView === "content")
                editor = contentEditor;
            return (
                <div
                    key={editView + '__tab_content'}
                    id={editView}
                    className={this.state.view === editView ? 'tab-pane active' : 'tab-pane'}>
                    {editor}
                </div>
            )
        });
        const editorTabs = editViews.map((editView) => {
            return (
                <li
                    key={editView + '__tab_option'}
                    className={this.state.view === editView ? 'active' : ''}
                >
                    <a data-toggle="tab" href={'#' + editView}>
                        {editView}
                    </a>
                </li>
            )
        });

        return (
            <div className="CollectionCreator">
                {this.props.currentUser ?
                    <button className="btn btn-default" onClick={this.makeCollection.bind(this)}>Make collection</button>
                    : null
                }
                {this.state.showModal ?
                    <FlexModal
                        elementId="collection__modal"
                        handleHideModal={this.hideCollectionForm.bind(this)}
                        title={'Provide a label for your collection'}
                    >
                        <div>
                            <ul className="nav nav-tabs">
                                {editorTabs}
                            </ul>
                            <div className="tab-content">
                                {editorTabContents}
                            </div>
                            <button className="btn btn-default" onClick={this.saveCollection.bind(this)}>Save and close</button>
                        </div>
                    </FlexModal>: null
                }
            </div>
        )
    }

}



