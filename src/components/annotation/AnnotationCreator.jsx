'use strict'

import React from 'react';
import TargetCreator from './TargetCreator';
import BodyCreator from './BodyCreator';
import TargetUtil from './../../util/TargetUtil.js';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import FlexModal from '../FlexModal';

import AppAnnotationStore from '../../flux/AnnotationStore';

class AnnotationCreator extends React.Component {

    constructor(props) {
        super(props);
        this.selectCandidates = this.selectCandidates.bind(this);
        this.onHide = this.onHide.bind(this);
        this.state = {
            showModal: null,
            annotations: [],
            creator: null
        }
    }

    componentDidMount() {
        AppAnnotationStore.bind('loaded-annotations', this.setAnnotations.bind(this));
    }
    setAnnotations(annotations) {
        this.setState({annotations: annotations});
    }
    onHide() {
        $('#annotation__modal').modal('hide');//TODO ugly, but without this the static backdrop won't disappear!
    }

    selectCandidates() {
        console.log(this.props.config.defaults);
        let candidates = TargetUtil.getCandidates(this.state.annotations, this.props.config.defaults.target);
        this.setState({
            candidates: candidates,
            candidateAnnotations: candidates.annotation,
            candidateResources: candidates.resource,
            showModal: true,
            creator: "target",
            selected: []
        });
    }
    hideAnnotationForm() {
        this.setState({showModal: false});
    }
    editAnnotationBody(annotation) {
        this.setState({ editAnnotation: annotation, showModal: true, creator: "body" });
    }
    createAnnotation(annotationTargets) {
        var annotation = AnnotationUtil.generateW3CAnnotation(this.props.currentUser.username, annotationTargets);
        this.editAnnotationBody(annotation);
    }
    render() {
        let targetCreator = (
            <TargetCreator
                createAnnotation={this.createAnnotation.bind(this)}
                candidateResources={this.state.candidateResources}
                candidateAnnotations={this.state.candidateAnnotations}
                candidates={this.state.candidates}
                annotations={this.state.annotations}
                defaultTargets={this.props.config.defaults.target}
            />
        )
        let bodyCreator = (
            <BodyCreator
                editAnnotation={this.state.editAnnotation}
                currentUser={this.props.currentUser}
                annotationTasks={this.props.config.annotationTasks}
                services={this.props.config.services}
                hideAnnotationForm={this.onHide.bind(this)}
            />
        )
        let creator = this.state.creator === "target" ? targetCreator : bodyCreator;
        return (
            <div>
                {this.props.currentUser ?
                    <button className="btn btn-default" onClick={this.selectCandidates.bind(this)}>Make annotation</button>
                    : null
                }
                {this.state.showModal ?
                    <FlexModal
                        elementId="annotation__modal"
                        handleHideModal={this.hideAnnotationForm.bind(this)}
                        title={'Add one or more annotation targets'}>
                        {creator}
                    </FlexModal>: null
                }
            </div>
        );
    }
}

export default AnnotationCreator;
