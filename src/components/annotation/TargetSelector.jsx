
'use strict'

import React from 'react';
import { Modal } from 'react-bootstrap';
import CandidateList from './CandidateList.jsx';
import SelectedList from './SelectedList.jsx';
import TargetUtil from './../../util/TargetUtil.js';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import RDFaUtil from './../../util/RDFaUtil.js';

export default class TargetSelector extends React.Component {
    constructor(props) {
        super(props);
        this.addToSelected = this.addToSelected.bind(this);
        this.removeFromSelected = this.removeFromSelected.bind(this);
        this.state = {
            showAnnotationBox: false,
            showSelectorModal: false,
            selected: [],
            candidateResources: {},
            candidateAnnotations: [],
            annotations: [],
            activeType: "resource",
            candidateTypes: ["resource", "annotation"],
        };
    }
    closeSelectorModal() {
        this.setState({showSelectorModal: false});
    }
    selectCandidates() {
        var candidateResources = TargetUtil.getCandidateRDFaTargets(this.props.defaultTargets);
        // find annotations overlapping with candidate resources
        var candidateAnnotations = TargetUtil.selectCandidateAnnotations(this.props.annotations, candidateResources.highlighted);
        this.setState({
            candidateAnnotations: candidateAnnotations,
            candidateResources: candidateResources,
            showSelectorModal: true,
            selected: []
        });
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
        this.closeSelectorModal();
        this.props.prepareAnnotation(this.state.selected);
    }
    render() {
        //generate the tabs from the configured modes
        var component = this;
        const tabs = this.state.candidateTypes.map(function(candidateType) {
            return (
                <li
                    key={candidateType + '__tab_option'}
                    className={component.state.activeType === candidateType ? 'active' : ''}
                >
                    <a data-toggle="tab" href={'#' + candidateType}>
                        {candidateType}
                    </a>
                </li>
                )
        }, this)

        var tabContents = this.state.candidateTypes.map(function(candidateType) {
            var candidates = this.state.candidateResources;
            if (candidateType === "annotation") {
                candidates = this.state.candidateAnnotations;
            }
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
            <div className="TargetSelector">
                <button onClick={this.selectCandidates.bind(this)}>Make annotation</button>
                <Modal show={this.state.showSelectorModal} onHide={this.closeSelectorModal.bind(this)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Select Annotation Targets</Modal.Title>
                        <SelectedList
                            candidates={this.state.selected}
                            removeFromSelected={this.removeFromSelected.bind(this)}
                            />
                    </Modal.Header>
                    <Modal.Body>
                        <h4>Candidate Targets</h4>
                        <ul className="nav nav-tabs">
                            {tabs}
                        </ul>
                        <div className="tab-content">
                            {tabContents}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={this.annotateTargets.bind(this)}>Annotate</button>
                        <button onClick={this.closeSelectorModal.bind(this)}>Close</button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}
