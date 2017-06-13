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
        let component = this;
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
        let itemTypes = ["annotations", "collections", "resources"];
        var viewer;
        let viewerTabContents = itemTypes.map((itemType) => {
            if (itemType === "annotations")
                viewer = annotationViewer;
            if (itemType === "collections")
                viewer = collectionViewer;
            if (itemType === "resources")
                viewer = resourceViewer;
            return (
                <div
                    key={itemType + '__tab_content'}
                    id={itemType}
                    className={this.state.view === itemType ? 'tab-pane active' : 'tab-pane'}>
                    {viewer}
                </div>
            )
        });
        const viewerTabs = itemTypes.map((itemType) => {
            return (
                <li
                    key={itemType + '__tab_option'}
                    className={component.state.view === itemType ? 'active' : ''}
                >
                    <a data-toggle="tab" href={'#' + itemType}>
                        {itemType}
                    </a>
                </li>
            )
        });

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
                    <ul className="nav nav-tabs">
                        {viewerTabs}
                    </ul>
                    <div className="tab-content">
                        {viewerTabContents}
                    </div>
                </div>
            </div>
        );
    }
}


