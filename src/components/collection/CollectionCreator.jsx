
'use strict'

import React from 'react';
import FlexModal from '../FlexModal';
import Annotation from '../annotation/Annotation.jsx';
import AppCollectionStore from '../../flux/CollectionStore';
import AppAnnotationStore from '../../flux/AnnotationStore';
import CollectionActions from '../../flux/CollectionActions';
import CollectionLabelEditor from './CollectionLabelEditor';
import CollectionContentEditor from './CollectionContentEditor';
import $ from 'jquery';

export default class CollectionCreator extends React.Component {
    constructor(props) {
        super(props);
        this.handleLabelChange = this.handleLabelChange.bind(this);
        this.state = {
            annotations: [],
            collectionLabel: "",
            page: [],
            showModal: false,
            toAdd: [],
            toRemove: [],
            view: "label",
        }
        this.collectionLabel = "";
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

    fetchPage(collection) {
        console.log("fetching collection page");
        console.log(collection);
        CollectionActions.getCollectionPage(collection.last);
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

    editCollection(collection, view) {
        if (!view) {
            view = "label";
        }
        //console.log("editCollection - collection:", collection);
        var page = [];
        if (collection.label !== undefined)
            this.collectionLabel = collection.label;
            //this.setState({collectionLabel: collection.label});
        if (collection.last !== undefined && collection.last !== null) {
            //page = collection.last;
            console.log("getting collection page");
            CollectionActions.getCollectionPage(collection.last);
        }
        this.setState({collection: collection, page: page, view: view, showModal: true});
    }
    hideCollectionForm() {
        this.setState({showModal: false});
    }

    saveCollection() {
        $('#collection__modal').modal('hide');//TODO ugly, but without this the static backdrop won't disappear!
        var collection = this.state.collection;
        collection.label = this.collectionLabel;
        //console.log("saveCollection - collection:", collection);
        CollectionActions.save(collection);
        this.collectionLabel = "";
        this.setState({
            showModal: false,
            collectionLabel: "",
            collection: null,
            page: [],
            annotations: [],
        });
    }

    addToCollection(annotation) {
        CollectionActions.addAnnotation(this.state.collection.id, annotation);
    }

    removeFromCollection(annotation) {
        CollectionActions.removeAnnotation(this.state.collection.id, annotation.id);
    }

    handleLabelChange(label) {
        this.collectionLabel = label;
    }

    render() {
        let component = this;
        var addCandidates = [];
        var removeCandidates = [];

        //let pageItems = (this.state.page && this.state.page.items !== undefined) ? this.state.page.items : [];
        let pageItems = this.state.page;
        //console.log(pageItems);
        let pageIds = pageItems.map((annotation) => {return annotation.id});
        //let pageIds = this.state.page;

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

        var editor = null;
        let editViews = ["label", "content"];

        const editorTabs = editViews.map((editView) => {
            return (
                <li
                    key={editView + '__tab_option'}
                    className='nav-item'
                >
                    <a
                        key={editView + "-editor-tab"}
                        className={this.state.view === editView ? 'nav-link active' : 'nav-link'}
                        data-toggle="tab"
                        href={'#' + editView}
                    >
                        {editView}
                    </a>
                </li>
            )
        });

        let editorTabContents = editViews.map((editView) => {
            //console.log("render - state.view:", this.state.view);
            //console.log("render - editView:", editView);
            if (editView === "label") {
                editor = (<CollectionLabelEditor
                              onChange={this.handleLabelChange}
                              collectionLabel={this.collectionLabel}
                          />);
            } else if (editView === "content") {
                editor = (<CollectionContentEditor
                    collection={this.state.collection}
                    addCandidates={addCandidates}
                    removeCandidates={removeCandidates}
                />);
            }
            return (
                <div
                    key={editView + '__tab_content'}
                    id={editView}
                    className={this.state.view === editView ? 'tab-pane active' : 'tab-pane'}>
                    {editor}
                </div>
            )
        });

        return (
            <div className="CollectionCreator"
                key="collection-creator"
            >
                {this.props.currentUser ?
                    <button className="btn btn-light" onClick={this.makeCollection.bind(this)}>Make collection</button>
                    : null
                }
                {this.state.showModal ?
                    <FlexModal
                        key="collection-flex-modal"
                        elementId="collection__modal"
                        handleHideModal={this.hideCollectionForm.bind(this)}
                        confirmLabel="Save"
                        confirmAction={this.saveCollection.bind(this)}
                        title={'Provide a label for your collection'}
                    >
                        <div>
                            <ul className="nav nav-tabs">
                                {editorTabs}
                            </ul>
                            <div className="tab-content">
                                {editorTabContents}
                            </div>
                        </div>
                    </FlexModal>: null
                }
            </div>
        )
    }

}
