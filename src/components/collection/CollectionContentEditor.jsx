
'use strict'

import React from 'react';
import CollectionActions from '../../flux/CollectionActions';

export default class CollectionLabelEditor extends React.Component {
    constructor(props) {
        super(props);
    }

    addToCollection(annotation) {
        CollectionActions.addAnnotation(this.props.collection.id, annotation);
    }

    removeFromCollection(annotation) {
        CollectionActions.removeAnnotation(this.props.collection.id, annotation.id);
    }

    render() {

        return (
            <div className="row">
                <div className="collection-content-editor row">
                    <div className="col-md-1">
                    </div>
                    <div className="col-md-5">
                        <h4>Select annotations to remove</h4>
                        {this.props.removeCandidates}
                    </div>
                    <div className="col-md-5">
                        <h4>Select annotations to add</h4>
                        {this.props.addCandidates}
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

    }
}


