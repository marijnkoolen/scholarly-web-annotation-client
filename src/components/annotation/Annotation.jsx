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
            highlighted: false
        }
    }
    componentDidMount() {
        this.setState({targetRanges: this.mapTargetsToRanges()});
    }
    mapTargetsToRanges() {
        let component = this;
        var targetRanges = [];
        AnnotationUtil.extractTargets(this.props.annotation).forEach((target) => {
            let annotationTargetRanges = component.getTargetRanges(target)
            targetRanges = targetRanges.concat(annotationTargetRanges);
        });
        return targetRanges;
    }
    /*
     * A getTargetResources parses a single annotation target
     * and returns any resources that are the leaves of the
     * annotation chain (if there are annotations on annotations).
     * Target resources that are not indexed are ignored.
     */
    getTargetRanges(target) {
        let component = this;
        var targetId = AnnotationUtil.extractTargetIdentifier(target);
        if (!targetId) // target is not loaded in browser window
            return [];
        var source = component.props.lookupIdentifier(targetId);
        if (source.type === "resource")
            return [component.makeTargetRange(target, source.data.domNode)];
        var targetRanges = [];
        AnnotationUtil.extractTargets(source.data).forEach((annotationTarget) => {
            var annotationRanges = component.getTargetRanges(annotationTarget);
            targetRanges = targetRanges.concat(annotationRanges);
        });
        return targetRanges;
    }
    makeTargetRange(target, node) {
        var targetRange = {
            start: 0,
            end: -1,
            node: node
        }
        let textPosition = AnnotationUtil.getTextPositionSelector(target);
        if (textPosition && textPosition.start) {
            targetRange.start = textPosition.start;
            targetRange.end = textPosition.end;
        }
        return targetRange;
    }
    getTargetText(target, resource) {
        // if whole resource is the target,
        // return the text content of the correspondign node
        if (!target.selector)
            return resource.data.text;
        var selector = target.selector;
        if (target.selector.refinedBy)
            selector = target.selector.refinedBy;
        // if there are multiple selectors, pick any selector since they are alternatives
        selector = Array.isArray(selector) ? selector[0] : selector;
        if (!selector.type)
            return null;
        if (selector.type === "TextQuoteSelector")
            return selector.exact;
        if (selector.type === "TextPositionSelector")
            return this.getTargetRangeText(resource.data.domNode, selector.start, selector.end);
        return null;
    }
    getTargetRangeText(node, start, end) {
        SelectionUtil.setRDFaSelectionRange(node, start, end);
        var selection = window.document.getSelection();
        var text = selection.toString();
        selection.removeAllRanges();
        return text;
    }
    targetIsAnnotation(target) {
        return (source.type === "annotation") ? true : false;
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
    toggleHighlight() {
        let component = this;
        this.state.targetRanges.forEach((target) => {
            component.state.highlighted ?
                SelectionUtil.selectAndRemoveRange(target.node, target.start, target.end) :
                SelectionUtil.selectAndHighlightRange(target.node, target.start, target.end);
        });
        this.setState({highlighted: this.state.highlighted ? false : true});
    }
    computeClass() {
        var className = 'list-group-item';
        if(this.state.highlighted)
            className += ' active';
        return className;
    }

    render() {
        let component = this;
        let annotation = component.props.annotation;
        var bodyCount = 0;
        var timestamp = (new Date(annotation.created)).toLocaleString();
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
            let source = component.props.lookupIdentifier(AnnotationUtil.extractTargetIdentifier(target));
            var text = "";
            var label;
            if (source.type === "resource") {
                let selector = AnnotationUtil.getTextQuoteSelector(target);
                text = selector ? selector.exact : component.getTargetText(target, source);
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
