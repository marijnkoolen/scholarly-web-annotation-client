/*
 * annotate-rdfa.js allows user to select RDFA-labeled text fragments
 * in RDFa enriched HTML documents.
 *
 */

// TO DO: deal with elements that have multiple types

'use strict'

import AnnotationCreator from './AnnotationCreator.jsx';
import AnnotationList from './AnnotationList.jsx';
import React from 'react';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import AppAnnotationStore from './../../flux/AnnotationStore';
import AnnotationActions from '../../flux/AnnotationActions.js';

export default class AnnotationViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            view: "annotations",
        };
    }
    componentDidMount() {
        AnnotationActions.loadResources();
    }
    render() {
        return (
        <div className="annotationViewer">
            <AnnotationCreator
                currentUser={this.props.currentUser}
                config={this.props.config}
            />
            <AnnotationList
                currentUser={this.props.currentUser}
                config={this.props.config}
            />
        </div>
        );
    }
}

