'use strict'

import React from 'react';
import TargetCreator from './TargetCreator';
import BodyCreator from './BodyCreator';
import TargetUtil from './../../util/TargetUtil.js';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import FlexModal from '../FlexModal';
import AnnotationActions from '../../flux/AnnotationActions';
import $ from 'jquery';

import AppAnnotationStore from '../../flux/AnnotationStore';

class AnnotationCreator extends React.Component {

    constructor(props) {
        super(props);
        this.selectTargets = this.selectTargets.bind(this);
        this.onHide = this.onHide.bind(this);
        this.state = {
            permission: "private",
            showModal: null,
            annotations: [],
            selectedTargets: [],
            createdBodies: {},
            create: null
        }
    }

    componentDidMount() {
        AppAnnotationStore.bind('loaded-annotations', this.setAnnotations.bind(this));
        AppAnnotationStore.bind('create-annotation', this.createAnnotation.bind(this));
        AppAnnotationStore.bind('edit-annotation', this.editAnnotationBody.bind(this));
    }
    setAnnotations(annotations) {
        this.setState({annotations: annotations});
    }
    onHide() {
        $('#annotation__modal').modal('hide');//TODO ugly, but without this the static backdrop won't disappear!
    }

    selectTargets() {
        let candidates = TargetUtil.getCandidates(this.state.annotations, this.props.config.defaults.target);
        //console.log("selectTarget - candidates:", candidates);
        this.setState({
            editAnnotation: null,
            candidates: candidates,
            showModal: true,
            create: "target",
            createdBodies: {}
        });
    }
    hideAnnotationForm() {
        $('#annotation__modal').modal('hide');//TODO ugly, but without this the static backdrop won't disappear!
        this.setState({
            showModal: false,
            selectedTargets: [],
            createdBodies: {}
        });
    }
    editAnnotationBody(annotation) {
        this.setState({
            editAnnotation: annotation,
            createdBodies: this.categorizeBodies(annotation.body),
            showModal: true, create: "body"
        });
    }
    addMotivations() {
        this.setState({showModal: true, create: "body"});
    }
    addTargets() {
        this.setState({showModal: true, create: "target"});
    }
    setTargets(selectedTargets) {
        this.setState({
            selectedTargets: selectedTargets
        });
    }
    setBodies(createdBodies) {
        this.setState({createdBodies: createdBodies});
    }
    createAnnotation(annotationTargets) {
        var annotation = AnnotationUtil.generateW3CAnnotation(annotationTargets, this.props.currentUser.username);
        annotation.body = this.listBodies(this.state.createdBodies);
        this.editAnnotationBody(annotation);
    }
    gatherDataAndSave() {
        let component = this;
        if (this.state.editAnnotation) {
            var annotation = this.state.editAnnotation;
        } else {
            var annotation = AnnotationUtil.generateW3CAnnotation(this.state.selectedTargets, this.props.currentUser.username);
        }
        var bodies = this.listBodies(this.state.createdBodies);
        if (bodies.length === 0) {
            alert("Cannot save annotation without content. Please add at least one motivation.");
        } else {
            annotation.body = bodies;
            AnnotationActions.save(annotation);
            this.hideAnnotationForm();
        }
    }
    handlePermissionChange(event) {
        this.setState({permission: event.target.value});
        AnnotationActions.setPermission(event.target.value);
    }

    listBodies(createdBodies) {
        var bodies = [];
        Object.keys(createdBodies).forEach((bodyType) => {
            bodies = bodies.concat(createdBodies[bodyType]);
        });
        return bodies;
    }

    categorizeBodies(bodies) {
        var createdBodies = {};
        bodies.forEach((body) => {
            if (!createdBodies[body.type])
                createdBodies[body.type] = [];
            createdBodies[body.type].push(body);
        });
        return createdBodies;
    }

    hasTarget() {
        return this.state.selectedTargets.length > 0 || this.state.editAnnotation !== null;
    }

    hasBody() {
        let bodies = this.listBodies(this.state.createdBodies);
        return bodies.length > 0;
    }

    render() {
        let targetCreator = (
            <TargetCreator
                selectedTargets={this.state.selectedTargets}
                addMotivations={this.addMotivations.bind(this)}
                setTargets={this.setTargets.bind(this)}
                candidates={this.state.candidates}
                annotations={this.state.annotations}
                defaultTargets={this.props.config.defaults.target}
                permission={this.state.permission}
            />
        )
        let bodyCreator = (
            <BodyCreator
                createdBodies={this.state.createdBodies}
                addTargets={this.addTargets.bind(this)}
                setBodies={this.setBodies.bind(this)}
                currentUser={this.props.currentUser}
                annotationTasks={this.props.config.annotationTasks}
                services={this.props.config.services}
                hideAnnotationForm={this.onHide.bind(this)}
                permission={this.state.permission}
            />
        )
        var canSave = this.hasTarget() && this.hasBody();
        let creatorButtons = (
            <div className="row">
                <div className="creator-view-buttons col-12">
                    <button
                        className="btn btn-primary"
                        disabled={!this.state.candidates}
                        onClick={this.addTargets.bind(this)}>
                        Show targets
                    </button>
                    {' '}
                    <button
                        className="btn btn-primary"
                        disabled={this.state.selectedTargets.length === 0}
                        onClick={this.addMotivations.bind(this)}>
                        Show content
                    </button>
                    <div className="permission-switch ">
                        <label>Private</label>
                        {' '}
                        <input
                            type="radio"
                            value="private"
                            checked={this.state.permission === "private"}
                            onChange={this.handlePermissionChange.bind(this)}
                        />
                        &nbsp;
                        &nbsp;
                        <input
                            type="radio"
                            value="public"
                            checked={this.state.permission === "public"}
                            onChange={this.handlePermissionChange.bind(this)}
                        />
                        {' '}
                        <label>Public</label>
                    </div>
                </div>
            </div>
        )
        let creator = this.state.create === "target" ? targetCreator : bodyCreator;
        let titleLabel = this.state.create === "target" ? "targets" : "content";
        let title = "Add one or more annotation " + titleLabel;
        return (
            <div>
                {this.props.currentUser ?
                    <button className="btn btn-light" onClick={this.selectTargets.bind(this)}>Make annotation</button>
                    : null
                }
                {this.state.showModal ?
                    <FlexModal
                        elementId="annotation__modal"
                        handleHideModal={this.hideAnnotationForm.bind(this)}
                        confirmLabel="Save"
                        confirmAction={this.gatherDataAndSave.bind(this)}
                        title={title}>
                        {creatorButtons}
                        {creator}
                    </FlexModal>: null
                }
            </div>
        );
    }
}

export default AnnotationCreator;
