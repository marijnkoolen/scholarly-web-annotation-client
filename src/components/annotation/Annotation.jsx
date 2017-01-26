'use strict'

import React from 'react';
import AnnotationActions from './../../flux/AnnotationActions.js';
import FlexModal from './../FlexModal';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import RDFaUtil from './../../util/RDFaUtil.js';
import SelectionUtil from './../../util/SelectionUtil.js';

class Annotation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            highlighted: false,
            warning: "",
            showConfirmationModal: false
        }
    }
    makeTargetRange(target, node) {
        var targetRange = {
            start: 0,
            end: -1,
            node: node
        }
        if (target.selector && target.selector.refinedBy) {
            targetRange.start = target.selector.refinedBy.start;
            targetRange.end = target.selector.refinedBy.end;
        }
        if (target.selector && target.selector.start) {
            targetRange.start = target.selector.start;
            targetRange.end = target.selector.end;
        }
        return targetRange;
    }
    getTargetRangeText(node, start, end) {
        RDFaUtil.setRDFaSelectionRange(node, start, end);
        var selection = document.getSelection();
        var text = selection.toString();
        selection.removeAllRanges();
        return text;
    }
    getTargetText(target, resource) {
        // if whole resource is the target,
        // return the text content of the correspondign node
        if (!target.selector.start && !target.selector.exact && !target.selector.refinedBy) {
            return resource.data.text;
        }
        var refinedBy = target.selector.refinedBy;
        // pick any refinedBy selector since they are alternatives
        refinedBy = Array.isArray(refinedBy) ? refinedBy[0] : refinedBy;
        if (refinedBy.type) {
            if (refinedBy.type === "TextQuoteSelector") {
                return refinedBy.exact;
            }
            if (refinedBy.type === "TextPositionSelector") {
                return this.getTargetRangeText(resource.data.domNode, refinedBy.start, refinedBy.end);
            }

        }
        return null;
    }
    getTargetResources(target) {
        let component = this;
        var targetId = AnnotationUtil.extractTargetSource(target);
        var source = component.props.lookup(targetId);
        var targetResources = [];
        if (source.type === "annotation") {
            let annotation = source.data;
            AnnotationUtil.extractTargets(annotation).forEach(function(annotationTarget) {
                var annotationResources = component.getTargetResources(annotationTarget);
                targetResources = targetResources.concat(annotationResources);
            });
        }
        else if (source.type === "resource") {
            targetResources.push(target);
        }
        return targetResources;
    }
    getTargetRanges(targets) {
        let component = this;
        var resourceTargetRanges = [];
        targets.forEach(function(target) {
            var targetId = AnnotationUtil.extractTargetSource(target);
            var source = component.props.lookup(targetId);
            var targetRange = component.makeTargetRange(target, source.data.domNode);
            resourceTargetRanges.push(targetRange);
        });
        return resourceTargetRanges;
    }
    isResource(targetId) {
        let targetResource = this.props.lookup(targetId);
        if (targetResource.type === "resource") {
            return true;
        }
        return false;
    }
    getTargets() {
        let component = this;
        var targetResources = [];
        AnnotationUtil.extractTargets(this.props.annotation).forEach(function(target) {
            let annotationTargetResources = component.getTargetResources(target)
            targetResources = targetResources.concat(annotationTargetResources);
        });
        let resourceTargetRanges = this.getTargetRanges(targetResources);
        return resourceTargetRanges;
    }
    toggleHighlight() {
        let component = this;
        AnnotationActions.activate(this.props.annotation);
        this.state.targetRanges.forEach(function(target) {
            if (component.state.highlighted) {
                SelectionUtil.selectAndRemoveRange(target.node, target.start, target.end);
                component.setState({highlighted: false});
            }
            else {
                SelectionUtil.selectAndHighlightRange(target.node, target.start, target.end);
                component.setState({highlighted: true});
            }
        });
    }
    canEdit() {
        return this.props.currentUser && this.props.currentUser.username === this.props.annotation.creator ? true : false;
    }
    canDelete() {
        return this.props.currentUser && this.props.currentUser.username === this.props.annotation.creator ? true : false;
    }
    canCopy() {
        return this.props.currentUser ? true : false;
        var allowed = true;
        // TODO: implement permission check (what should permission check be?)
        return allowed;
    }
    editTarget(annotation) {
        // ask for adding, changing or removing target
        // if target is resource, allow new text selection
        // if target is annotation, allow new annotation selection
    }
    copyAnnotation(annotation) {
        let confirm = window.confirm("Are you sure you want to copy this annotation?");
        if (confirm) {
            AnnotationActions.copy(annotation);
            // TODO: implement copying of annotation
        }
    }
    editAnnotationBody(annotation) {
        AnnotationActions.edit(annotation);
    }
    deleteAnnotation(annotation) {
        let confirm = window.confirm("Are you sure you want to delete this annotation?");
        if (confirm) {
            AnnotationActions.delete(annotation);
        }
    }
    componentDidMount() {
        this.setState({targetRanges: this.getTargets()});
    }
    computeClass() {
        var className = 'list-group-item';
        if(this.props.active) {
            className += ' active';
        }
        return className;
    }

    render() {
        let component = this;
        let annotation = component.props.annotation;
        var bodyCount = 0;
        var timestamp = (new Date(annotation.created * 1000)).toLocaleString();
        var bodies = AnnotationUtil.extractBodies(annotation).map(function(body) {
            bodyCount++;
            return (
                <div key={bodyCount}>
                    <span>Body: </span>
                    <span
                        className="label label-success"
                        >{body.purpose}</span>
                    &nbsp;
                    <span>{body.value}</span>
                </div>
            );
        });
        var targetCount = 0;
        var targets = AnnotationUtil.extractTargets(annotation).map(function(target) {
            targetCount++;
            let source = component.props.lookup(AnnotationUtil.extractTargetSource(target));
            var text = "";
            var label;
            if (source.type === "resource") {
                text = component.getTargetText(target, source);
                if (text.length > 40) {
                    text = text.substr(0, 37) + "...";
                }
                label = source.data.rdfaType;
                return (
                    <div key={targetCount}>
                        <span>Target: </span>
                        <span
                            className="label label-info"
                            >{label}</span>
                        &nbsp;
                        <span>{text}</span>
                    </div>
                );
            }
            if (source.type === "annotation") {
                let body = AnnotationUtil.extractBodies(source.data)[0];
                let label = body.type;
                let text = body.value;
                return (
                    <div key={targetCount}>
                        <span>Target: </span>
                        <span
                            className="label label-success"
                            >{label}</span>
                        &nbsp;
                        <span>{text}</span>
                    </div>
                );
            }
        });

        var renderEditBody = function() {
            return (
                <i className="label label-warning"
                    onClick={() => {component.editAnnotationBody(annotation)}}>
                    edit body
                </i>
            )
        }
        var renderEditTarget = function() {
            return (
                <i className="label label-warning"
                    onClick={() => {component.editAnnotationTarget(annotation)}}>
                    edit target
                </i>
            )
        }
        var renderDelete = function() {
            return (
                <i className="label label-danger"
                    onClick={() => {component.deleteAnnotation(annotation)}}>
                    delete
                </i>
            )
        }
        var renderCopy = function() {
            return (
                <i className="label label-default"
                    onClick={() => {component.copyAnnotation(annotation)}}>
                    copy
                </i>
            )
        }

        var makeOptions = function() {
            var editBody = component.canEdit() ? renderEditBody() : "";
            var editTarget = component.canEdit() ? renderEditTarget() : "";
            var del = component.canDelete() ? renderDelete() : "";
            var copy = component.canCopy() ? renderCopy() : "";
            return (
                <div>
                    {editBody} {editTarget} {del} {copy}
                </div>
            );
        }
        let options = makeOptions();

        return (
            <li
                className={component.computeClass()}
                title={annotation.id}
            >
                <div
                    onClick={component.toggleHighlight.bind(this)}
                    >
                    <abbr>
                        {timestamp}&nbsp;
                        (created by: {annotation.creator})
                    </abbr>
                    {bodies}
                    {targets}
                    <br/>
                </div>
                {options}
            </li>
        );
    }
}

export default Annotation;
