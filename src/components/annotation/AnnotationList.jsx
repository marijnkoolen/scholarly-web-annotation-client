'use strict'

import React from 'react';
import AppAnnotationStore from './../../flux/AnnotationStore';
import AnnotationActions from './../../flux/AnnotationActions';
import Annotation from './Annotation.jsx';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import RDFaUtil from './../../util/RDFaUtil.js';

class AnnotationList extends React.Component {
    constructor(props) {
        super(props);
        this.annotationIndex = {};
        this.lookup = this.lookup.bind(this);
        this.state = {
            annotations: [],
            activeAnnotations: [],
            topResourceIds: []
        }
    }
    componentDidMount() {
        AppAnnotationStore.bind('activate-annotation', this.toggleActiveAnnotation.bind(this));
        AppAnnotationStore.bind('save-annotation', this.reload.bind(this));
        AppAnnotationStore.bind('reload-annotations', this.reload.bind(this));
        AppAnnotationStore.bind('change-target', this.reload.bind(this));
        AppAnnotationStore.bind('del-annotation', this.reload.bind(this));
        AppAnnotationStore.bind('load-annotations', this.loadAnnotations.bind(this));
        // load resource index and annotations
        this.reload();
    }
    reload(){
        let component = this;
        let currIds = RDFaUtil.getTopRDFaResources(document.body);
        let prevIds = this.state.topResourceIds;
        // only update state if top level resources have changed
        if (currIds.every(id => prevIds.includes(id)) &&
                prevIds.every(id => currIds.includes(id)))
            this.setState({topResourceIds: currIds}, () => {
                component.indexResources()
                AnnotationActions.load(currIds);
            });
    }
    indexResources() {
        this.resourceIndex = RDFaUtil.indexRDFaResources();
    }
    loadAnnotations(annotations) {
        // AnnotationList only needs to know about the display annotations
        // not the structural relation annotations
        let types = AnnotationUtil.sortAnnotationTypes(annotations, this.resourceIndex);
        this.setState({annotations: types.display});
        this.indexAnnotations();
    }
    indexAnnotations() {
        let component = this;
        component.annotationIndex = {}
        component.state.annotations.forEach(function(annotation) {
            component.annotationIndex[annotation.id] = annotation;
        });
    }
    lookup(sourceId) {
        var source = { type: null, data: null };
        if (this.annotationIndex.hasOwnProperty(sourceId))
            source = { type: "annotation", data: this.annotationIndex[sourceId] };
        else if (this.resourceIndex.hasOwnProperty(sourceId))
            source = { type: "resource", data: this.resourceIndex[sourceId] };
        return source;
    }
    toggleActiveAnnotation(annotation) {
        this.isActive(annotation) ?
            this.activateAnnotation(annotation) : this.deactivateAnnotation(annotation);
    }
    activateAnnotation(annotation) {
        let annotations = this.state.activeAnnotations.concat([annotation]);
        this.setState({activeAnnotations: annotations});
    }
    deActivateAnnotation(annotation) {
        var annotations = this.state.activeAnnotations;
        annotations.splice(annotations.indexOf(annotation), 1);
        this.setState({activeAnnotations: annotations});
    }
    isActive(annotation) {
        return this.state.activeAnnotations.includes(annotation);
    }
    render() {
        var annotationItems = null;
        let component = this;
        if (this.state.annotations) {
            annotationItems = this.state.annotations.map(function(annotation) {
                return (
                    <Annotation
                        annotation={annotation}
                        lookup={component.lookup}
                        key={annotation.id}
                        active={component.isActive(annotation)}
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
