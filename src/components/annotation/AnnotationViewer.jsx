/*
 * annotate-rdfa.js allows user to select RDFA-labeled text fragments
 * in RDFa enriched HTML documents.
 *
 */

// TO DO: deal with elements that have multiple types

'use strict'

import AnnotationList from './AnnotationList.jsx';
import CollectionList from './CollectionList.jsx';
import ViewSelector from './ViewSelector.jsx';
import React from 'react';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import AppAnnotationStore from './../../flux/AnnotationStore';
import AnnotationActions from '../../flux/AnnotationActions.js';
import LoginBox from '../LoginBox';

export default class AnnotationViewer extends React.Component {
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
        var itemList = "";
        if (this.state.view === "annotations") {
            itemList = (
                <AnnotationList
                    currentUser={this.state.user}
                    config={this.props.config}
                />
            );
        }
        else if (this.state.view === "collections") {
            itemList = (
                <CollectionList />
            );
        }
        return (
        <div className="annotationViewer">
            <h1>Annotation Client</h1>
            <LoginBox
                user={this.state.user}
            />
            <div>
                <ViewSelector
                    currentMode={this.state.view}
                    handleViewChange={this.handleViewChange.bind(this)}
                    />
                {itemList}
            </div>
        </div>
        );
    }
}

