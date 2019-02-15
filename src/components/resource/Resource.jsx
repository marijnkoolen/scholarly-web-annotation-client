'use strict'

import React from 'react';
import AppAnnotationStore from './../../flux/AnnotationStore';
import AnnotationActions from './../../flux/AnnotationActions';

export default class Resource extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            resources: [],
        }
    }
    componentDidMount() {
    }

    onMouseOverHandler() {
        this.props.data.domNode.style.border = "1px solid red";
    }

    onMouseOutHandler() {
        this.props.data.domNode.style.border = "";
    }

    render() {
        let component = this;
        let typeLabels = this.props.data.rdfaTypeLabel.map((label) => {
            return (
                <span
                    key={"rdfa-label-" + label}
                >
                    <span
                        className="badge badge-info"
                    >
                        {label}
                    </span>&nbsp;
                </span>
            )
        })

        let parentResource = this.props.data.parentResource;
        let parent = parentResource ? (<div>Parent: &nbsp; {parentResource}</div>) : "";
        let rdfaProperty = this.props.data.rdfaProperty ? this.props.data.rdfaProperty.split("#")[1] : null;
        let relation = rdfaProperty ? (<div>Relation: &nbsp; {rdfaProperty}</div>) : "";

        return (
            <div
                className="resource list-group-item"
                onMouseOver={component.onMouseOverHandler.bind(this)}
                onMouseOut={component.onMouseOutHandler.bind(this)}
            >
                <div>
                Type: &nbsp; {typeLabels}
                </div>
                <div>
                Identifier: {this.props.data.rdfaResource}
                </div>
                {parent}
                {relation}
            </div>
        );
    }
}

