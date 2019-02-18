
'use strict'

import React from 'react';
import { Modal } from 'react-bootstrap';
import CandidateList from './CandidateList.jsx';
import SelectedList from './SelectedList.jsx';
import RDFaUtil from './../../util/RDFaUtil.js';

export default class TargetCreator extends React.Component {
    constructor(props) {
        super(props);
        this.addToSelected = this.addToSelected.bind(this);
        this.removeFromSelected = this.removeFromSelected.bind(this);
        this.state = {
            selected: this.props.selectedTargets,
            annotations: [],
            activeType: "resource",
            candidateTypes: ["resource", "external", "annotation"],
        };
    }
    addToSelected(candidate) {
        var selected = this.state.selected;
        if (selected.indexOf(candidate) === -1) {
            selected.push(candidate);
            this.setState({selected: selected});
            this.props.setTargets(selected);
        }
    }
    removeFromSelected(candidate) {
        var selected = this.state.selected;
        var index = selected.indexOf(candidate);
        if (index !== -1) {
            selected.splice(index, 1);
            this.setState({selected: selected});
            this.props.setTargets(selected);
        }
    }

    addMotivations() {
        this.props.addMotivations();
    }

    render() {
        //generate the tabs from the configured modes
        var component = this;
        const tabs = this.state.candidateTypes.map((candidateType) => {
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
            let tabActive = this.state.activeType === candidateType ? 'tab-pane active' : 'tab-pane';
            let className = "candidate-target-list " + tabActive;
            return (
                <div
                    key={candidateType + '__tab_content'}
                    id={candidateType}
                    className={className}
                >
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
                </div>
            </div>
        )
    }
}
