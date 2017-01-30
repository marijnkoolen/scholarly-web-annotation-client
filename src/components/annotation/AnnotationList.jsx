'use strict'

import React from 'react';
import AppAnnotationStore from './../../flux/AnnotationStore';
import Annotation from './Annotation.jsx';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import RDFaUtil from './../../util/RDFaUtil.js';
import AnnotationAPI from './../../api/AnnotationAPI.js';

class AnnotationList extends React.Component {
    constructor(props) {
        super(props);
        this.resourceIndex = RDFaUtil.indexRDFaResources();
        this.annotationIndex = {};
        this.lookup = this.lookup.bind(this);
        this.state = {
            annotations: [],
            activeAnnotations: [],
            resourceIds: []
        }
    }
    lookup(sourceId) {
        if (this.annotationIndex.hasOwnProperty(sourceId)) {
            return {
                type: "annotation",
                data: this.annotationIndex[sourceId]
            }
        }
        if (this.resourceIndex.hasOwnProperty(sourceId)) {
            return {
                type: "resource",
                data: this.resourceIndex[sourceId]
            }
        }
        console.error("Error: target id " + sourceId + " not found in index");
        return {
            type: null,
            data: null
        }
    }
    indexAnnotations() {
        var annotationIndex = {}
        this.state.annotations.forEach(function(annotation) {
            annotationIndex[annotation.id] = annotation;
        });
        this.annotationIndex = annotationIndex;
    }
    reloadAnnotations(){
        let component = this;
        // get resource IDs of current RDFa nodes in DOM
        let resourceIds = RDFaUtil.getTopRDFaResources(document.body);
        let sameList = resourceIds.every(function(resourceId) {
            return (component.state.resourceIds.indexOf(resourceId) > -1);
        });
        if (!sameList) {
            component.setState({annotations: [], resourceIds: resourceIds});
            component.loadAnnotations();
        }
    }
    loadAnnotations() {
        let component = this;
        AnnotationAPI.getAnnotationsByTargets(component.state.resourceIds, function(error, annotations) {
            if (error)
                return null;

            component.setState({annotations: annotations});
            //component.filterAnnotations(annotations);
        });
    }
    filterAnnotations(annotations) {
        // select only annotations for which at least
        // one target is part of the DOM
        let component = this;
        var targetsInDOM = function(annotation) {
            return AnnotationUtil.extractTargetSources(annotation).some(function(targetId) {
                return component.resourceIndex[targetId] ? true : false;
            });
        }
        let relevantAnnotations = annotations.filter(targetsInDOM);
        component.setState({annotations: relevantAnnotations});
    }
    activateAnnotation(annotation) {
        var annotations = this.state.activeAnnotations;
        if (annotations.indexOf(annotation) === -1) {
            annotations.push(annotation);
        }
        else {
            annotations.splice(annotations.indexOf(annotation), 1);
        }
        this.setState({activeAnnotations: annotations});
    }
    componentDidMount() {
        var resourceIds = RDFaUtil.getTopRDFaResources(document.body);
        //console.log(resourceIds);
        this.setState({resourceIds: resourceIds}, function() {
            this.loadAnnotations();
        });

        AppAnnotationStore.bind('activate-annotation', this.activateAnnotation.bind(this));
        AppAnnotationStore.bind('reload-annotations', this.reloadAnnotations.bind(this));
        //make sure to reload the list when the target changes
        AppAnnotationStore.bind('change-target', this.loadAnnotations.bind(this));

        //also make sure to reload the list when annotations are added/removed (to/from the target)
        AppAnnotationStore.bind('save-annotation', this.loadAnnotations.bind(this));
        AppAnnotationStore.bind('del-annotation', this.loadAnnotations.bind(this));
    }
    render() {
        this.indexAnnotations();
        this.resourceIndex = RDFaUtil.indexRDFaResources();
        var annotationItems = null;
        let component = this;
        if (this.state.annotations) {
            //console.log(this.state.annotations);
            annotationItems = this.state.annotations.map(function(annotation) {
                let active = false;
                if (component.state.activeAnnotations.indexOf(annotation) !== -1) {
                    active = true;
                }
                return (
                    <Annotation
                        annotation={annotation}
                        lookup={component.lookup}
                        key={annotation.id}
                        active={active}
                        currentUser={component.props.currentUser}
                    />
                );
            });
        }
        return (
            <div className="annotationList">
                <h3>Saved annotations</h3>
                <ul className="list-group">
                    {annotationItems}
                </ul>
            </div>
        );
    }
}

export default AnnotationList;
