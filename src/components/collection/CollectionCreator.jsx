
'use strict'

import React from 'react';
import FlexModal from '../FlexModal';
import AppCollectionStore from '../../flux/CollectionStore';
import CollectionActions from '../../flux/CollectionActions';

export default class CollectionCreator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collectionLabel: "",
            showModal: false
        }
    }

    componentDidMount() {
        AppCollectionStore.bind('edit-collection-label', this.editCollectionLabel.bind(this));
    }

    handleChange(event) {
        this.setState({collectionLabel: event.target.value});
    }

    makeCollection() {
        var collection = {
            creator: this.props.currentUser.username
        };
        this.editCollectionLabel(collection);
    }
    editCollectionLabel(collection) {
        if (collection.label !== undefined)
            this.setState({collectionLabel: collection.label});
        this.setState({collection: collection});
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
            collection: null
        });
    }

    render() {
        return (
            <div className="CollectionCreator">
                {this.props.currentUser ?
                    <button onClick={this.makeCollection.bind(this)}>Make collection</button>
                    : null
                }
                {this.state.showModal ?
                    <FlexModal
                        elementId="collection__modal"
                        handleHideModal={this.hideCollectionForm.bind(this)}
                        title={'Provide a label for your collection'}>
                        <div className="collection-creator-header">
                            <input
                                ref="label"
                                type="text"
                                value={this.state.collectionLabel}
                                onChange={this.handleChange.bind(this)}
                            />
                        </div>
                        <div>
                            <button onClick={this.saveCollection.bind(this)}>Save</button>
                        </div>
                    </FlexModal>: null
                }
            </div>
        )
    }

}



