
'use strict'

import React from 'react';
import { Modal } from 'react-bootstrap';
import CandidateList from './CandidateList.jsx';
import SelectedList from './SelectedList.jsx';
import TargetUtil from './../../util/TargetUtil.js';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import RDFaUtil from './../../util/RDFaUtil.js';
import AppAnnotationStore from './../../flux/AnnotationStore';
import AnnotationActions from './../../flux/AnnotationActions';
import AnnotationAPI from './../../api/AnnotationAPI.js';

export default class TargetSelector extends React.Component {
    constructor(props) {
        super(props);
        this.addSelected = this.addSelected.bind(this);
        this.removeSelected = this.removeSelected.bind(this);
        this.resourceIndex = RDFaUtil.indexRDFaResources();
        this.state = {
            showAnnotationBox: false,
            showTargets: false,
            selected: [],
            candidateResources: {},
            candidateAnnotations: [],
            annotations: [],
            activeType: "resource",
            candidateTypes: ["resource", "annotation"],
        };
    }
    closeTargetSelector() {
        this.setState({showTargets: false});
    }

    annotateTargets() {
        let component = this;
        this.setState({ showTargets: false });
        let targetResources = this.state.selected.map(function(target) { return target.source });
        let resourceRelations = RDFaUtil.findResourceRelations(targetResources, component.resourceIndex);
        let newRelations = RDFaUtil.filterExistingRelationAnnotations(resourceRelations, component.state.annotations);
        newRelations.forEach(function(relation) {
            let annotation = AnnotationUtil.generateRelationAnnotation(relation, component.resourceIndex);
            AnnotationActions.save(annotation);
        });
        this.props.makeAnnotation(this.state.selected);
    }
    loadAnnotations(annotations) {
        let component = this;
        //let resourceIds = RDFaUtil.getTopRDFaResources(document.body);
        component.setState({annotations: annotations });
   }
    componentDidMount() {
        AppAnnotationStore.bind('change-target', this.loadAnnotations.bind(this));
        AppAnnotationStore.bind('load-annotations', this.loadAnnotations.bind(this));
        AppAnnotationStore.bind('del-annotation', this.loadAnnotations.bind(this));
    }
    addCandidateAnnotation(list, annotation) {
        var aid = annotation.id;
        var candidate = {
            source: annotation.id,
            type: "annotation",
            params: {
                text: annotation.body[0].value
            },
            label: annotation.body[0].purpose,
            target: {
            }
        }
        candidate.target.source = aid;
        if (list.indexOf(candidate) === -1) {
            list.push(candidate);
        }
    }
    getCandidateTargets() {
        this.resourceIndex = RDFaUtil.indexRDFaResources();
        var candidateResources = TargetUtil.getCandidateRDFaTargets();
        this.setState({candidateResources: candidateResources});
        // find annotations overlapping with candidate resources
        let types = AnnotationUtil.sortAnnotationTypes(this.state.annotations, this.resourceIndex);
        var candidateAnnotations = TargetUtil.selectCandidateAnnotations(types.display, candidateResources.highlighted);
        this.setState({candidateAnnotations: candidateAnnotations});
    }
    showCandidates() {
        let component = this;
    }
    selectCandidates() {
        this.getCandidateTargets();

        this.setState({
            showTargets: true,
            selected: []
        });
    }
    addSelected(candidate) {
        var selected = this.state.selected;
        if (selected.indexOf(candidate) === -1) {
            selected.push(candidate);
            this.setState({selected: selected});
        }
    }
    removeSelected(candidate) {
        var selected = this.state.selected;
        var index = selected.indexOf(candidate);
        if (index !== -1) {
            selected.splice(index, 1);
            this.setState({selected: selected});
        }
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
                            addSelected={this.addSelected.bind(this)}
                            candidateType={candidateType}
                            />
                </div>
                );
        }, this);

        return (
            <div className="TargetSelector">
                <button onClick={this.selectCandidates.bind(this)}>Make annotation</button>
                <button onClick={this.showCandidates.bind(this)}>Show resources</button>
                <Modal show={this.state.showTargets} onHide={this.closeTargetSelector.bind(this)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Select Annotation Targets</Modal.Title>
                        <SelectedList
                            candidates={this.state.selected}
                            removeSelected={this.removeSelected.bind(this)}
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
                        <button onClick={this.closeTargetSelector.bind(this)}>Close</button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}
