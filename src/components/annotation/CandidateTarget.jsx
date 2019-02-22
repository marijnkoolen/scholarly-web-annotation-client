
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
        //console.log(this.props.candidate);
        var badgeType = "badge badge-info";
        var targetType = "Resource";
        if (this.props.candidate.type === "external") {
            badgeType = "badge badge-secondary";
        }
        // TO DO: deal with elements that have multiple types
        var text = "";
        if (this.props.candidate.type === "annotation") {
            text = this.props.candidate.params.text;
            badgeType = "badge badge-success";
            targetType = "Annotation";
        } else if (this.props.candidate.mimeType === "text") {
            if (this.props.candidate.params.quote) {
                text = this.props.candidate.params.quote.exact;
            } else if (this.props.candidate.params.text) {
                text = this.props.candidate.params.text;
            }
        } else if (this.props.candidate.mimeType === "image") {
            text = "Image selection"
        }
        if (text.length > 100) {
            text = text.substr(0,100) + "...";
        }
        return (
            <li
                onClick={this.handleClick}
                className="list-group-item candidate-target">
                <table>
                    <tbody>
                        <tr>
                            <td>
                    <label className="annotation-text">{targetType}:</label>
                            </td>
                            <td>
                    <span className="annotation-text">{this.props.candidate.source}</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                    <label className="annotation-text">Type:</label>
                            </td>
                            <td>
                    <span className={badgeType}>{this.props.candidate.label}</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                    <label className="annotation-text">Content:</label>
                            </td>
                            <td>
                    <span className="annotation-text">{text}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </li>
        )
    }
}

export default CandidateTarget;
