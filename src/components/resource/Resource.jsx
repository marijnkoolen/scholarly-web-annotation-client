'use strict'

import React from 'react';
import AppAnnotationStore from './../../flux/AnnotationStore';
import AnnotationActions from './../../flux/AnnotationActions';

export default class Resource extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    componentDidMount() {
    }

    onMouseOverHandler() {
        if (this.props.data.domNode) {
            this.props.data.domNode.style.border = "1px solid red";
        }
    }

    onMouseOutHandler() {
        if (this.props.data.domNode) {
            this.props.data.domNode.style.border = "";
        }
    }

    render() {
        let component = this;
        //console.log(this.props.data.type);
        let labels = this.props
        let typeLabels = this.props.data.rdfTypeLabel.map((label) => {
            if (!this.props.data.rdfTypeLabel) {
                return (<span key={this.props.data.resource}></span>)
            }
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

        let resource = (this.props.data.resource) ? this.props.data.resource : this.props.data.rdfaResource;
        let parentResource = this.props.data.parentResource;
        let parent = parentResource ? (<div>Parent: &nbsp; {parentResource}</div>) : "";
        var rdfaProperty = this.props.data.rdfaProperty ? this.props.data.rdfaProperty.split("#")[1] : null;
        if (this.props.data.relation) {
            rdfaProperty = this.props.data.relation.split("#")[1];
        }
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
                Identifier: {resource}
                </div>
                {parent}
                {relation}
            </div>
        );
    }
}

