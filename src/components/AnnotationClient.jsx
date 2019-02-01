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
import ResourceViewer from './resource/ResourceViewer.jsx';
import AnnotationUtil from './../util/AnnotationUtil.js';
import AppAnnotationStore from './../flux/AnnotationStore';
import AnnotationActions from '../flux/AnnotationActions.js';
import LoginBox from './LoginBox';
//import '../css/swa.css';

export default class AnnotationClient extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            view: "annotations",
            serverAvailable: false,
            private: true,
            public: false,
            accessStatus: ["private"],
        };
    }
    componentDidMount() {
        AppAnnotationStore.bind('login-succeeded', this.setUser.bind(this));
        AppAnnotationStore.bind('register-succeeded', this.setUser.bind(this));
        AppAnnotationStore.bind('logout-user', this.setUser.bind(this));
        AppAnnotationStore.bind('server-status-change', this.setServerAvailable.bind(this));
    }
    setServerAvailable(serverAvailable) {
        this.setState({serverAvailable: serverAvailable});
    }
    setUser(user) {
        this.setState({user: user});
    }
    handleAccessPreferenceChange(event) {
        let level = event.target.value;
        let isChecked = this.state[level] ? false : true;
        var accessStatus = this.state.accessStatus;
        if (isChecked) {
            accessStatus.push(level);
        } else {
            accessStatus.splice(accessStatus.indexOf(level), 1);
        }
        this.setState({
            [level]: isChecked,
            accessStatus: accessStatus
        });
        AnnotationActions.setAccessStatus(accessStatus);
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
        /*
        let resourceViewer = null;
        */
        let resourceViewer = (
            <ResourceViewer
                currentUser={this.state.user}
                config={this.props.config}
            />
        )
        //let itemTypes = ["annotations", "resources"];
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
        let accessPreferences = (
            <div
                className="access-preferences"
            >
                <div>Show:</div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            value="private"
                            checked={this.state.private}
                            onChange={this.handleAccessPreferenceChange.bind(this)}
                        />
                        Private annotations</label>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            value="public"
                            checked={this.state.public}
                            onChange={this.handleAccessPreferenceChange.bind(this)}
                        />
                        Public annotations</label>
                </div>
            </div>
        )
        const viewerTabs = itemTypes.map((itemType) => {
            return (
                <li
                    key={itemType + '__tab_option'}
                    className="nav-item"
                >
                    <a data-toggle="tab" href={'#' + itemType} className={component.state.view === itemType ? 'nav-link active' : 'nav-link'}>
                        {itemType}
                    </a>
                </li>
            )
        });

        let indicator = "led-red";
        if (this.state.serverAvailable) {
            indicator = "led-green";
        }
        const serverAvailable = (
                <div className={indicator}></div>
        );

        return (
            <div className="annotationClient">
                <div className="row">
                    <h1 className="col">Annotator</h1>
                    <div className="col-auto"><LoginBox user={this.state.user}/></div>
                </div>
                <div className="server-status row">
                    <div className="col">Annotation server status:</div>
                    <div className="col-auto">{serverAvailable}</div>
                </div>
                <div>
                    <ul className="nav nav-tabs nav-fill">
                        {viewerTabs}
                    </ul>
                    <div className="tab-content">
                        {accessPreferences}
                        {viewerTabContents}
                    </div>
                </div>
            </div>
        );
    }
}
