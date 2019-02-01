
'use strict'

import React from 'react';
import CollectionActions from '../../flux/CollectionActions.js';

export default class Collection extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    canEdit() {
        return this.props.currentUser && this.props.currentUser.username === this.props.collection.creator ? true : false;
    }
    canCopy() {
        return this.props.currentUser ? true : false;
        var allowed = true;
        // TODO: implement permission check (what should permission check be?)
        return allowed;
    }

    editCollection() {
        CollectionActions.editCollection(this.props.collection, "label");
    }

    editContent() {
        CollectionActions.editCollection(this.props.collection, "content");
    }

    copyCollection() {
        let confirm = window.confirm("Are you sure you want to copy this collection?");
        if (confirm) {
            CollectionActions.copy(this.props.collection);
            // TODO: implement copying of collection
        }
    }
    deleteCollection() {
        let confirm = window.confirm("Are you sure you want to delete this collection?");
        if (confirm) {
            CollectionActions.delete(this.props.collection);
        }
    }

    isDefault() {
        return this.props.defaultCollection === this.props.collection.id;
    }

    toggleDefaultCollection() {
        let newDefault = this.isDefault() ? null : this.props.collection.id;
        CollectionActions.setDefault(newDefault);
    }

    computeClass() {
        var className = 'list-group-item';
        if(this.isDefault())
            className += ' active';
        return className;
    }

    render() {
        let component = this;
        let collection = this.props.collection;
        let timestamp = (new Date(collection.created)).toLocaleString();
        var editLabels = (
            <span>
                <i className="badge badge-info"
                    onClick={this.editCollection.bind(this)}>
                    edit label
                </i>
                &nbsp;
                <i className="badge badge-warning"
                    onClick={this.editContent.bind(this)}>
                    edit content
                </i>
                &nbsp;
                <i className="badge badge-danger"
                    onClick={this.deleteCollection.bind(this)}>
                    delete
                </i>
            </span>
        )
        var copyLabel = (
            <i className="badge badge-success"
                onClick={this.toggleDefaultCollection.bind(this)}>
                toggle default
            </i>
        )
        var options = (
            <div>
                {component.canEdit() ? editLabels : ""} {component.canCopy() ? copyLabel : ""}
            </div>
        );

        return (
            <li
                className={component.computeClass()}
                title={collection.id}
            >
                <div className="Collection">
                    <abbr>
                        {timestamp}&nbsp;
                        (created by: {collection.creator})
                    </abbr>
                    <div>
                        <strong>{collection.label}</strong>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <span>({collection.total})</span>
                    </div>
                </div>
                {options}
            </li>
        )
    }

}


