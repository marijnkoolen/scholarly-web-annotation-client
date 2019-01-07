/*
 * annotate-rdfa.js allows user to select RDFA-labeled text fragments
 * in RDFa enriched HTML documents.
 *
 */

// TO DO: deal with elements that have multiple types

'use strict'

import ResourceList from './ResourceList.jsx';
import React from 'react';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import AppAnnotationStore from './../../flux/AnnotationStore';
import AnnotationActions from '../../flux/AnnotationActions.js';

export default class ResourceViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            resources: []
        };
    }
    componentDidMount() {
    }
    render() {
        return (
        <div className="resourceViewer">
            <ResourceList
                currentUser={this.props.currentUser}
                config={this.props.config}
            />
        </div>
        );
    }
}



