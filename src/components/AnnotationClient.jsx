/*
 * annotate-rdfa.js allows user to select RDFA-labeled text fragments
 * in RDFa enriched HTML documents.
 *
 */

// TO DO: deal with elements that have multiple types

'use strict'

import ViewSelector from './ViewSelector.jsx';
import React from 'react';
import AnnotationViewer from './annotation/AnnotationViewer.jsx';
import CollectionViewer from './collection/CollectionViewer.jsx';
//import ResourceViewer from './resource/ResourceViewer.jsx';
import AnnotationUtil from './../util/AnnotationUtil.js';
import AppAnnotationStore from './../flux/AnnotationStore';
import AnnotationActions from '../flux/AnnotationActions.js';
import LoginBox from './LoginBox';

export default class AnnotationClient extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            view: "annotations",
        };
    }
    componentDidMount() {
        AppAnnotationStore.bind('login-user', this.setUser.bind(this));
        AppAnnotationStore.bind('logout-user', this.setUser.bind(this));

        AnnotationActions.loadResources();
    }
    setUser(user) {
        this.setState({user: user});
    }
    handleViewChange(viewMode) {
        this.setState({view: viewMode});
    }
    render() {
        let annotationViewer = (
            <AnnotationViewer
                currentUser={this.state.user}
                config={this.props.config}
            />
        );
        let collectionViewer = (
            <CollectionViewer
                currentUser={this.state.user}
                config={this.props.config}
            />
        );
        let resourceViewer = null;
        /*
        let resourceViewer = (
            <ResourceViewer
                currentUser={this.state.user}
                config={this.props.config}
            />
        )
        */
        var viewer = null;
        if (this.state.view === "annotations")
            viewer = annotationViewer;
        else if (this.state.view === "collections")
            viewer = collectionViewer;
        else if (this.state.view === "resources")
            viewer = resourceViewer;
        return (
        <div className="annotationClient">
            <h1>Annotation Client</h1>
            <LoginBox
                user={this.state.user}
            />
            <div>
                <ViewSelector
                    currentMode={this.state.view}
                    handleViewChange={this.handleViewChange.bind(this)}
                    />
                {viewer}
            </div>
        </div>
        );
    }
}


