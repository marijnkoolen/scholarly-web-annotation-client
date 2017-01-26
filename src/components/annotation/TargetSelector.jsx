
'use strict'

import React from 'react';
import { Modal } from 'react-bootstrap';
import CandidateList from './CandidateList.jsx';
import SelectedList from './SelectedList.jsx';
import TargetUtil from './../../util/TargetUtil.js';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import RDFaUtil from './../../util/RDFaUtil.js';
import AppAnnotationStore from './../../flux/AnnotationStore';
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
        var annotationTargets = this.state.selected.map(function(selected) {
            console.log(selected);
            // The target source is the top-level RDFa resource
            // more specific parts are specified in selectors
            var source = selected.source;
            if (selected.type === "resource") {
                source = component.resourceIndex[source].rdfaResource;
                if (component.resourceIndex[source].partOf) {
                    source = component.resourceIndex[source].partOf;
                }
            }
            var annotationTarget = {
                source: source,
                mimeType: "text",
                params: {
                    // add specific targeted resource part as parameter for selector
                    resourcePart: selected.source
                }
            }
            if (selected.hasOwnProperty("start")) {
                annotationTarget.params.start = selected.start,
                annotationTarget.params.end = selected.end
            }
            if (selected.hasOwnProperty("text")) {
                annotationTarget.params.text = selected.text;
                annotationTarget.params.prefix = selected.prefix;
                annotationTarget.params.suffix = selected.suffix;
            }
            return annotationTarget;
        });
        this.setState({ showTargets: false });
        this.props.makeAnnotation(annotationTargets);
    }
    loadAnnotations() {
        let component = this;
        let resourceIds = RDFaUtil.getTopRDFaResources(document.body);
        AnnotationAPI.getAnnotationsByTargets(resourceIds, function(error, annotations) {
            if (error)
                return null;

            component.setState({annotations: annotations });
        });
   }
    componentDidMount() {
        AppAnnotationStore.bind('change-target', this.loadAnnotations.bind(this));
        AppAnnotationStore.bind('save-annotation', this.loadAnnotations.bind(this));
        AppAnnotationStore.bind('del-annotation', this.loadAnnotations.bind(this));
        console.log("Component mounted, loading annotations");
        this.loadAnnotations();
    }
    addCandidateAnnotation(list, annotation) {
        var aid = annotation.id;
        var candidate = {
            source: annotation.id,
            type: "annotation",
            text: annotation.body[0].value,
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
        let component = this;
        component.resourceIndex = RDFaUtil.indexRDFaResources();
        console.log(component.resourceIndex);
        var candidateResources = TargetUtil.getCandidateRDFaTargets();
        if (!candidateResources) {
            let sources = Object.keys(component.resourceIndex);
            let wholeNodes = sources.map(function(source) {
                let resource = component.resourceIndex[source];
                return {
                    label: resource.rdfaType,
                    node: resource.domNode,
                    text: resource.text,
                    source: resource.rdfaResource,
                    type: "resource"
                }
            });
            candidateResources = {
                wholeNodes: wholeNodes
            }
        }
        this.setState({candidateResources: candidateResources});
        // find annotations overlapping with candidate resources
        var wholeResources = candidateResources.wholeNodes.map(function(candidate) {
            return candidate.source;
        });
        var candidateAnnotations = [];
        this.state.annotations.forEach(function(annotation) {
            // if there is no highlighted resource, add all annotations
            if (!(candidateResources.highlighted)) {
                component.addCandidateAnnotation(candidateAnnotations, annotation);
                return true;
            }
            var add = false;
            var targets = [];
            if (Array.isArray(annotation.target)) {
                targets = annotation.target;
            }
            else {
                targets.push(annotation.target);
            }
            targets.forEach(function(target) {
                var targetResource = target.source;
                if (target.selector && target.selector.type === "FragmentSelector") {
                    targetResource = target.selector.value;
                }
                if (targetResource === candidateResources.highlighted.source) {
                    if (target.selector && target.selector.refinedBy) {
                        let textPosition = target.selector.refinedBy;
                        let start = candidateResources.highlighted.start;
                        let end = start + candidateResources.highlighted.end;
                        if (start < textPosition.end && end > textPosition.start) {
                            add = true;
                        }
                    }
                    else {
                        add = true;
                    }
                }
            });
            if (add) {
                component.addCandidateAnnotation(candidateAnnotations, annotation);
            }
        });
        console.log(candidateAnnotations);
        this.setState({candidateAnnotations: candidateAnnotations});
    }
    showCandidates() {
        let component = this;
    }
    selectCandidates() {
        console.log("Selected cadidates, loading annotations");
        this.loadAnnotations();
        this.getCandidateTargets();

        this.setState({
            showTargets: true,
            selected: []
        });
    }
    addSelected(candidate) {
        console.log(candidate);
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
