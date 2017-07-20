
'use strict'

import React from 'react';

class CandidateTarget extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick() {
        this.props.onClick(this.props.candidate);
    }
    render() {
        // TO DO: deal with elements that have multiple types
        console.log(this.props.candidate);
        var text = "";
        if (this.props.candidate.type === "annotation") {
            text = this.props.candidate.params.text;
        } else if (this.props.candidate.mimeType === "text") {
            text = this.props.candidate.params.text;
        } else if (this.props.candidate.mimeType === "image") {
            text = "Image selection"
        }
        if (text.length > 200) {
            text = text.substr(0,200) + "...";
        }
        return (
            <li
                onClick={this.handleClick}
                className="list-group-item candidate-target">
                <span className="label label-info">{this.props.candidate.label}</span>:
                <span>&nbsp;{text}</span>
            </li>
        )
    }
}

export default CandidateTarget;
