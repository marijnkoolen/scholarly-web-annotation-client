'use strict'

import React from 'react';
import AppAnnotationStore from './../../flux/AnnotationStore';
import Annotation from './Annotation.jsx';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import RDFaUtil from './../../util/RDFaUtil.js';

class AnnotationList extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var annotationItems = null;
        let component = this;
        if (this.props.annotations) {
            annotationItems = this.props.annotations.map(function(annotation) {
                return (
                    <Annotation
                        annotation={annotation}
                        lookupIdentifier={component.props.lookupIdentifier}
                        key={annotation.id}
                        currentUser={component.props.currentUser}
                    />
                );
            });
        }
        return (
            <div className="annotationList">
                <h3>Saved annotations</h3>
                <ul className="list-group">
                    {annotationItems}
                </ul>
            </div>
        );
    }
}

export default AnnotationList;
