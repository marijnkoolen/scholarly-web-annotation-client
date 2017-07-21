/*
 * annotate-rdfa.js allows user to select RDFA-labeled text fragments
 * in RDFa enriched HTML documents.
 *
 */

// TO DO: deal with elements that have multiple types

'use strict'

import CollectionCreator from './CollectionCreator.jsx';
import CollectionList from './CollectionList.jsx';
import React from 'react';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import AppAnnotationStore from './../../flux/AnnotationStore';
import AnnotationActions from '../../flux/AnnotationActions.js';

export default class CollectionViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collections: []
        };
    }
    componentDidMount() {
    }
    render() {
        return (
        <div className="collectionViewer">
            <CollectionCreator
                currentUser={this.props.currentUser}
                config={this.props.config}
            />
            <CollectionList
                currentUser={this.props.currentUser}
                config={this.props.config}
            />
        </div>
        );
    }
}


