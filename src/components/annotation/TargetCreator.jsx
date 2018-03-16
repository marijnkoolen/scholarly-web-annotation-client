
'use strict'

import React from 'react';
import { Modal } from 'react-bootstrap';
import CandidateList from './CandidateList.jsx';
import SelectedList from './SelectedList.jsx';
import TargetUtil from './../../util/TargetUtil.js';
import RDFaUtil from './../../util/RDFaUtil.js';
import AnnotationActions from '../../flux/AnnotationActions';

export default class TargetSelector extends React.Component {
    constructor(props) {
        super(props);
        this.addToSelected = this.addToSelected.bind(this);
        this.removeFromSelected = this.removeFromSelected.bind(this);
        this.state = {
            selected: [],
            permission: AnnotationActions.getPermission(),
            annotations: [],
            activeType: "resource",
            candidateTypes: ["resource", "annotation"],
        };
    }
    addToSelected(candidate) {
        var selected = this.state.selected;
        if (selected.indexOf(candidate) === -1) {
            selected.push(candidate);
            this.setState({selected: selected});
        }
    }
    removeFromSelected(candidate) {
        var selected = this.state.selected;
        var index = selected.indexOf(candidate);
        if (index !== -1) {
            selected.splice(index, 1);
            this.setState({selected: selected});
        }
    }
    annotateTargets() {
        if (this.state.selected.length == 0) {
            alert("No annotation target selected, annotation requires at least one target");
        }
        else {
            this.props.createAnnotation(this.state.selected);
        }
    }
    handlePermissionChange(event) {
        this.setState({permission: event.target.value});
        AnnotationActions.setPermission(event.target.value);
    }

    render() {
        //generate the tabs from the configured modes
        var component = this;
        const tabs = this.state.candidateTypes.map(function(candidateType) {
            return (
                <li
                    key={candidateType + '__tab_option'}
                    className="nav-item"
                >
                    <a data-toggle="tab" href={'#' + candidateType}
                        className={component.state.activeType === candidateType ? 'nav-link active' : 'nav-link'}>
                        {candidateType}
                    </a>
                </li>
                )
        }, this)

        var tabContents = this.state.candidateTypes.map((candidateType) => {
            var candidates = this.props.candidates[candidateType];
            return (
                <div
                    key={candidateType + '__tab_content'}
                    id={candidateType}
                    className={this.state.activeType === candidateType ? 'tab-pane active' : 'tab-pane'}>
                        Click on a {candidateType} to select it as annotation target.
                        <CandidateList
                            candidates={candidates}
                            addToSelected={this.addToSelected.bind(this)}
                            candidateType={candidateType}
                            />
                </div>
                );
        }, this);

        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
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
                <div className="row">
                    <div className="col-6">
                        <h3>Available Targets</h3>
                        <ul className="nav nav-tabs">
                            {tabs}
                        </ul>
                        <div className="tab-content">
                            {tabContents}
                        </div>
                    </div>
                    <div className="col-6">
                        <h3>Selected Targets</h3>
                        <SelectedList
                            candidates={this.state.selected}
                            removeFromSelected={this.removeFromSelected.bind(this)}
                        />
                    </div>
                </div>
                <div>
                    <button onClick={this.annotateTargets.bind(this)} className="btn btn-primary">Create Annotation</button>
                </div>
            </div>
        )
    }
}
