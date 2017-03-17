/*
 * annotate-rdfa.js allows user to select RDFA-labeled text fragments
 * in RDFa enriched HTML documents.
 *
 */

// TO DO: deal with elements that have multiple types

'use strict'

import AnnotationBox from './AnnotationBox.jsx';
import AnnotationList from './AnnotationList.jsx';
import TargetSelector from './TargetSelector.jsx';
import React from 'react';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import AppAnnotationStore from './../../flux/AnnotationStore';
import AnnotationActions from '../../flux/AnnotationActions.js';
import LoginBox from '../LoginBox';
import RDFaUtil from '../../util/RDFaUtil.js';

export default class AnnotationViewer extends React.Component {
    constructor(props) {
        super(props);
        this.makeAnnotation = this.makeAnnotation.bind(this);
        this.state = {
            showAnnotationModal: false,
            user: null,
        };
    }
    componentDidMount() {
        AppAnnotationStore.bind('edit-annotation', this.editAnnotation.bind(this));
        AppAnnotationStore.bind('reload-annotations', this.updateCurrentAnnotation.bind(this));
        AppAnnotationStore.bind('load-annotations', this.loadAnnotations.bind(this));
        AppAnnotationStore.bind('load-resources', this.loadResources.bind(this));
        AppAnnotationStore.bind('login-user', this.setUser.bind(this));
        AppAnnotationStore.bind('logout-user', this.setUser.bind(this));

        this.loadResources();
    }
    loadResources() {
        this.maps = RDFaUtil.buildResourcesMaps();
        console.log(this.maps);
        this.resourceIndex = RDFaUtil.indexRDFaResources();
        this.topResources = RDFaUtil.getTopRDFaResources(document.body);
        AnnotationActions.load(this.topResources);
    }
    loadAnnotations(annotations) {
        let component = this;
        component.setState({annotations: annotations});
        component.annotationIndex = {}
        component.state.annotations.forEach(function(annotation) {
            component.annotationIndex[annotation.id] = annotation;
        });
    }
    lookupIdentifier(sourceId) {
        var source = { type: "resource", data: null };
        if (this.annotationIndex.hasOwnProperty(sourceId))
            source = { type: "annotation", data: this.annotationIndex[sourceId] };
        else if (this.resourceIndex.hasOwnProperty(sourceId))
            source = { type: "resource", data: this.resourceIndex[sourceId] };
        return source;
    }
    showAnnotationForm() {
        this.setState({showAnnotationModal: true});
    }
    hideAnnotationForm() {
        this.setState({showAnnotationModal: false});
    }
    editAnnotation(annotation) {
        this.setState({
            currentAnnotation: annotation
        }, this.showAnnotationForm());
    }
    updateCurrentAnnotation(annotation) {
        this.setState({currentAnnotation: annotation});
    }
    setUser(user) {
        this.setState({user: user});
    }
    makeAnnotation(annotationTargets) {
        var annotation = AnnotationUtil.generateW3CAnnotation(
            this.state.user.username,
            annotationTargets
        );
        this.setState({ currentAnnotation: annotation }, this.showAnnotationForm());
    }
    render() {
        return (
        <div className="annotationViewer">
            <h1>Annotation Client</h1>
            <LoginBox
                user={this.state.user}
            />
            <div>
            {this.state.user ?
                <TargetSelector
                    makeAnnotation={this.makeAnnotation.bind(this)}
                    /> : null
            }
                <AnnotationList
                    currentUser={this.state.user}
                />
                <AnnotationBox
                    showModal={this.state.showAnnotationModal}
                    hideAnnotationForm={this.hideAnnotationForm.bind(this)}
                    editAnnotation={this.state.currentAnnotation}
                    currentUser={this.state.user}
                    annotationModes={this.props.config.annotationModes}
                    services={this.props.config.services}
                />
            </div>
        </div>
        );
    }
}

