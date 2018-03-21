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
        this.setState({
            candidates: candidates,
            showModal: true,
            create: "target",
        });
    }
    hideAnnotationForm() {
        this.setState({showModal: false});
    }
    editAnnotationBody(annotation) {
        this.setState({
            editAnnotation: annotation,
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
    createAnnotation() {
        var annotation = AnnotationUtil.generateW3CAnnotation(this.state.selectTargets, this.props.currentUser.username);
        annotation.body = createdBodies;
        this.editAnnotationBody(annotation);
    }
    gatherDataAndSave() {
        let component = this;
        var annotation = this.props.editAnnotation;
        var body = [];
        Object.keys(component.state.createdBodies).forEach(function(bodyType) {
            body = body.concat(component.state.bodies[bodyType]);
        });
        if (body.length === 0) {
            alert("Cannot save annotation without content. Please add at least one motivation.");
        } else {
            annotation.body = body;
            AnnotationActions.save(annotation);
            this.props.hideAnnotationForm();
        }
    }
    handlePermissionChange(event) {
        this.setState({permission: event.target.value});
        AnnotationActions.setPermission(event.target.value);
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
                editAnnotation={this.state.editAnnotation}
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
        let creatorButtons = (
            <div className="row">
                <div className="creator-view-buttons col-12">
                    <button
                        className="btn btn-primary"
                        disabled={!this.state.candidates}
                        onClick={this.addTargets.bind(this)}>
                        Show targets
                    </button>
                    <button
                        className="btn btn-primary"
                        disabled={this.state.selectedTargets.length === 0}
                        onClick={this.addMotivations.bind(this)}>
                        Show Motivations
                    </button>
                    <button
                        className="btn btn-primary"
                        disabled={Object.keys(this.state.createdBodies).length === 0}
                        onClick={this.gatherDataAndSave.bind(this)}>
                        Save
                    </button>
                    <div className="btn-group btn-group-toggle">
                        <label
                            className={this.state.permission === "private" ? "btn btn-primary active" : "btn btn-primary"}
                            >
                            <input
                                type="radio"
                                value="private"
                                checked={this.state.permission === "private"}
                                onChange={this.handlePermissionChange.bind(this)}
                            />
                            Private annotation
                        </label>
                        <label
                            className={this.state.permission === "public" ? "btn btn-primary active" : "btn btn-primary"}
                            >
                            <input
                                type="radio"
                                value="public"
                                checked={this.state.permission === "public"}
                                onChange={this.handlePermissionChange.bind(this)}
                            />
                            Public annotation
                        </label>
                    </div>
                </div>
            </div>
        )
        let creator = this.state.create === "target" ? targetCreator : bodyCreator;
        let titleLabel = this.state.create === "target" ? "targets" : "motivations";
        let title = "Add one or more annotation " + titleLabel;
        return (
            <div>
                {this.props.currentUser ?
                    <button className="btn btn-default" onClick={this.selectTargets.bind(this)}>Make annotation</button>
                    : null
                }
                {this.state.showModal ?
                    <FlexModal
                        elementId="annotation__modal"
                        handleHideModal={this.hideAnnotationForm.bind(this)}
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
