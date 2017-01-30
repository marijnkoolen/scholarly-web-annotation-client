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
import LoginBox from './LoginBox';
import config from './../../rdfa-annotation-config.js';

export default class AnnotationViewer extends React.Component {
    constructor(props) {
        super(props);
        this.makeAnnotation = this.makeAnnotation.bind(this);
        this.state = {
            showLoginModal: false,
            showAnnotationModal: false,
            activeAnnotations: [],
            user: null,
            loggedIn: false,
            loginButtonLabel: "login",
            loginMessage: "You are not logged in"
        };
    }
    handleLogin() {
        if (!this.state.loggedIn) {
            this.showLoginForm()
        }
        else {
            this.setState({
                user: null,
                loggedIn: false,
                loginButtonLabel: "login",
                loginMessage: "You are not logged in"
            });
            localStorage.removeItem("userDetails");
        }
    }
    showLoginForm() {
        this.setState({showLoginModal: true});
    }
    hideLoginForm() {
        this.setState({showLoginModal: false});
    }
    doLogin(userDetails) {
        this.setState({
            user: userDetails,
            loggedIn: true,
            loginButtonLabel: "logout",
            loginMessage: "You are logged in as " + userDetails.username
        });
        localStorage.setItem("userDetails", JSON.stringify(userDetails));
        this.hideLoginForm();
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
    activateAnnotation(annotation) {
        var annotations = this.state.activeAnnotations;
        annotations.push(annotation);
        if (this.state.activeAnnotations.indexOf(annotation) === -1) {
            this.setState({activeAnnotations: annotations});
        }
    }
    componentDidMount() {
        // temp hack: initialize user from local storage
        if (localStorage.userDetails) {
            this.doLogin(JSON.parse(localStorage.userDetails));
        }
        AppAnnotationStore.bind('activate-annotation', this.activateAnnotation.bind(this));
        AppAnnotationStore.bind('edit-annotation', this.editAnnotation.bind(this));
        AppAnnotationStore.bind('save-annotation', this.updateCurrentAnnotation.bind(this));
    }
    makeAnnotation(annotationTargets) {
        console.log(annotationTargets);
        var annotation = AnnotationUtil.generateW3CEmptyAnnotation(this.state.user.username, annotationTargets);
        this.setState(
            {
                currentAnnotation: annotation,
            }, this.showAnnotationForm()
        );
    }
    render() {
        this.state
        return (
        <div className="annotationViewer">
            <h1>Annotation Client</h1>
            <div className="login-div">
                <button className="btn btn-default"
                    onClick={this.handleLogin.bind(this)}>
                    {this.state.loginButtonLabel}
                </button>
                &nbsp;
                <span>{this.state.loginMessage}</span>
                <LoginBox
                    showModal={this.state.showLoginModal}
                    hideLoginForm={this.hideLoginForm.bind(this)}
                    login={this.doLogin.bind(this)}
                />
            </div>
            <div>
            {this.state.loggedIn ?
                <TargetSelector
                    api={this.props.api}
                    makeAnnotation={this.makeAnnotation.bind(this)}
                    /> : null
            }
                <AnnotationList
                    api={this.props.api}
                    currentUser={this.state.user}
                />
                <AnnotationBox
                    showModal={this.state.showAnnotationModal}
                    hideAnnotationForm={this.hideAnnotationForm.bind(this)}
                    editAnnotation={this.state.currentAnnotation}
                    currentUser={this.state.user}
                    annotationModes={config.annotationModes}
                    services={config.services}
                />
            </div>
        </div>
        );
    }
}

