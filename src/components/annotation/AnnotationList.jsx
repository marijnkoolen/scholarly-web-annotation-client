'use strict'

import React from 'react';
import AnnotationBox from './AnnotationBox.jsx';
import TargetSelector from './TargetSelector.jsx';
import AppAnnotationStore from './../../flux/AnnotationStore';
import AnnotationActions from './../../flux/AnnotationActions';
import Annotation from './Annotation.jsx';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import RDFaUtil from './../../util/RDFaUtil.js';

class AnnotationList extends React.Component {
    constructor(props) {
        super(props);
        this.prepareAnnotation = this.prepareAnnotation.bind(this);
        this.state = {
            annotations: [],
            showAnnotationModal: false,
        }
    }
    componentDidMount() {
        AppAnnotationStore.bind('edit-annotation', this.editAnnotation.bind(this));

        AppAnnotationStore.bind('loaded-annotations', this.setAnnotations.bind(this));
        AppAnnotationStore.bind('load-annotations', this.loadAnnotations.bind(this));
        AppAnnotationStore.bind('changed-target', this.loadAnnotations.bind(this));
        AppAnnotationStore.bind('deleted-annotation', this.loadAnnotations.bind(this));
    }
    loadAnnotations() {
        AnnotationActions.loadAnnotations();
    }
    setAnnotations(annotations) {
        this.setState({annotations: annotations});
    }
    hideAnnotationForm() {
        this.setState({showAnnotationModal: false});
    }
    editAnnotation(annotation) {
        this.setState({ currentAnnotation: annotation, showAnnotationModal: true });
    }
    prepareAnnotation(annotationTargets) {
        var annotation = AnnotationUtil.generateW3CAnnotation(this.props.currentUser.username, annotationTargets);
        this.editAnnotation(annotation);
    }
    render() {
        var annotationItems = null;
        let component = this;
        if (this.state.annotations) {
            annotationItems = this.state.annotations.map(function(annotation) {
                return (
                    <Annotation
                        annotation={annotation}
                        key={annotation.id}
                        currentUser={component.props.currentUser}
                    />
                );
            });
        }
        return (
            <div className="annotationList">
                {this.props.currentUser ?
                    <TargetSelector
                        prepareAnnotation={this.prepareAnnotation.bind(this)}
                        annotations={this.state.annotations}
                        defaultTargets={this.props.config.defaults.target}
                        /> : null
                }
                <h3>Saved annotations</h3>
                <ul className="list-group">
                    {annotationItems}
                </ul>
                <AnnotationBox
                    showModal={this.state.showAnnotationModal}
                    hideAnnotationForm={this.hideAnnotationForm.bind(this)}
                    editAnnotation={this.state.currentAnnotation}
                    currentUser={this.state.user}
                    annotationTasks={this.props.config.annotationTasks}
                    services={this.props.config.services}
                />
            </div>
        );
    }
}

export default AnnotationList;
