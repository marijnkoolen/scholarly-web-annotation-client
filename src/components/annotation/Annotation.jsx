'use strict'

import React from 'react';
import AnnotationActions from './../../flux/AnnotationActions.js';
import AppCollectionStore from '../../flux/CollectionStore.js';
import FlexModal from './../FlexModal';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import SelectionUtil from './../../util/SelectionUtil.js';
import TargetUtil from './../../util/TargetUtil.js';
import TimeUtil from '../../util/TimeUtil';
import RDFaUtil from '../../util/RDFaUtil';

class Annotation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            highlighted: false
        }
    }
    componentDidMount() {
        this.setState({targetDOMElements: TargetUtil.mapTargetsToDOMElements(this.props.annotation)});
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
    editAnnotationTarget(annotation) {
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
        TargetUtil.toggleHighlight(this.state.targetDOMElements, this.state.highlighted);
        this.setState({highlighted: this.state.highlighted ? false : true});
    }
    computeClass() {
        var className = 'list-group-item';
        if(this.state.highlighted)
            className += ' active';
        return className;
    }

    onMouseOverHandler(crumb) {
        //console.log("over");
        crumb.node.style.border = "1px solid red";
    }

    onMouseOutHandler(crumb) {
        //console.log("out");
        crumb.node.style.border = "";
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
                if (target.type === "Text") {
                    text = TargetUtil.getTargetText(target, source);
                } else if (target.type === "Image") {
                    let rect = target.selector.rect;
                    console.log(rect);
                    let topLeft = rect.x + ',' + rect.y;
                    let bottomRight = rect.x + rect.w + ',' + (rect.y + rect.h);
                    text = (
                        <span>
                            {'[' + topLeft + ' - ' + bottomRight + ']'}
                        </span>
                    )
                } else if (target.type === "Video") {
                    let segment = target.selector.interval;
                    text = (
                        <span>
                            {'[' + TimeUtil.formatTime(segment.start) + ' - ' + TimeUtil.formatTime(segment.end) + ']'}
                        </span>
                    );
                }
                if (text.length > 40) {
                    text = text.substr(0, 37) + "...";
                }
                label = source.data.rdfaType;
                let breadcrumb = RDFaUtil.createBreadcrumb(source.data.rdfaResource);
                let labelcrumb = breadcrumb.map((crumb, index) => {
                    let next = " > ";
                    if (!index)
                        next = "";
                    return (
                        <span key={"crumb" + index}
                            onMouseOver={component.onMouseOverHandler.bind(this, crumb)}
                            onMouseOut={component.onMouseOutHandler.bind(this, crumb)}
                        >
                            <span title={crumb.property}>
                            {next}
                            </span>
                            <span
                                className="label label-info"
                                title={"Identifier: " + crumb.id}
                            >
                               {crumb.label}
                            </span>
                            &nbsp;
                        </span>
                    )
                })
                return (
                    <div key={targetCount}>
                        {labelcrumb}
                        <br/>
                        <span>{text}</span>
                    </div>
                );
            } else if (source.type === "annotation") {
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
            } else if (source.type === undefined) {
                console.error("source.type is not defined, showing content of annotation target and associated indexed source", target, source);
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
