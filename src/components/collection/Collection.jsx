
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

    editLabel() {
        CollectionActions.editLabel(this.props.collection);
    }

    editContent() {
        // show list of annotations
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
        var renderEditLabels = function() {
            return (
                <span>
                    <i className="label label-info"
                        onClick={() => {component.editLabel()}}>
                        edit label
                    </i>
                    &nbsp;
                    <i className="label label-warning"
                        onClick={() => {component.editContent()}}>
                        edit content
                    </i>
                    &nbsp;
                    <i className="label label-danger"
                        onClick={() => {component.deleteCollection()}}>
                        delete
                    </i>
                </span>
            )
        }
        var renderCopy = function() {
            return (
                <i className="label label-success"
                    onClick={() => {component.toggleDefaultCollection()}}>
                    toggle default
                </i>
            )
        }
        var makeOptions = function() {
            var editLabels = component.canEdit() ? renderEditLabels() : "";
            var copy = component.canCopy() ? renderCopy() : "";
            return (
                <div>
                    {editLabels} {copy}
                </div>
            );
        }
        let options = makeOptions();

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


