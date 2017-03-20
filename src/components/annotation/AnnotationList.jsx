'use strict'

import React from 'react';
import AppAnnotationStore from './../../flux/AnnotationStore';
import Annotation from './Annotation.jsx';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import RDFaUtil from './../../util/RDFaUtil.js';

class AnnotationList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { activeAnnotations: [] }
    }
    componentDidMount() {
        AppAnnotationStore.bind('activate-annotation', this.toggleActiveAnnotation.bind(this));
    }
    toggleActiveAnnotation(annotation) {
        this.isActive(annotation) ?
            this.activateAnnotation(annotation) : this.deActivateAnnotation(annotation);
    }
    activateAnnotation(annotation) {
        let annotations = this.state.activeAnnotations.concat([annotation]);
        this.setState({activeAnnotations: annotations});
    }
    deActivateAnnotation(annotation) {
        var annotations = this.state.activeAnnotations;
        annotations.splice(annotations.indexOf(annotation), 1);
        this.setState({activeAnnotations: annotations});
    }
    isActive(annotation) {
        return this.state.activeAnnotations.includes(annotation);
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
                        active={component.isActive(annotation)}
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
