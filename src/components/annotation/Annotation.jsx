'use strict'

import React from 'react';
import AnnotationActions from './../../flux/AnnotationActions.js';
import AppCollectionStore from '../../flux/CollectionStore.js';
import FlexModal from './../FlexModal';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import SelectionUtil from './../../util/SelectionUtil.js';
import TargetUtil from './../../util/TargetUtil.js';

class Annotation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            highlighted: false
        }
    }
    componentDidMount() {
        this.setState({targetRanges: TargetUtil.mapTargetsToRanges(this.props.annotation)});
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
        // if target is resource, allow new resource selection
        // if target is annotation, allow new annotation selection
    }
    editAnnotationBody(annotation) {
        AnnotationActions.edit(annotation);
    }
    copyAnnotation(annotation) {
        let confirm = window.confirm("Are you sure you want to copy this annotation?");
        if (confirm) {
            AnnotationActions.copy(annotation);
            // TODO: implement copying of annotation
        }
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
                    <span></span>
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
            let source = AnnotationActions.lookupIdentifier(AnnotationUtil.extractTargetIdentifier(target));
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
                        <span></span>
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
                        <span></span>
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
                    {targets}
                    {bodies}
                    <br/>
                </div>
                {options}
            </li>
        );
    }
}

export default Annotation;
