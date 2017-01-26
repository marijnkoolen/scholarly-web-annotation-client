
'use strict'

import React from 'react';
import CandidateTarget from './CandidateTarget.jsx';

export default class CandidateList extends React.Component {
    constructor(props) {
        super(props);
        this.selectTarget = this.selectTarget.bind(this);
        this.state = {
            selected: []
        };
    }
    selectTarget(candidate) {
        var selected = this.state.selected;
        if (selected.indexOf(candidate) === -1) {
            selected.push(candidate);
            this.setState({selected: selected});
        }
        this.props.addSelected(candidate);
    }
    render() {
        var candidateList = this;
        var makeAnnotationCandidate = function(candidate) {
            return (
                <CandidateTarget
                    onClick={candidateList.selectTarget}
                    key={candidate.source}
                    candidate={candidate}
                />
            );
        }
        var makeResourceCandidate = function(candidate) {
            return (
                <CandidateTarget
                    onClick={candidateList.selectTarget}
                    key={candidate.source}
                    candidate={candidate}
                />
            );
        }
        if (this.props.candidateType === "annotation") {
            var candidateNodes = this.props.candidates.map(function(candidate) {
                return makeAnnotationCandidate(candidate);
            });
            return (
                <div className="candidateList">
                    <ul className="list-group">
                        {candidateNodes}
                    </ul>
                </div>
            )
        }
        if (this.props.candidateType === "resource") {
            var candidateWholeNodes = this.props.candidates.wholeNodes.map(function(candidate) {
                return makeResourceCandidate(candidate);
            });
            var candidateHighlighted = false;
            if (this.props.candidates.highlighted) {
                let highlighted = this.props.candidates.highlighted;
                candidateHighlighted = makeResourceCandidate(this.props.candidates.highlighted);
            }
            return (
                <div className="candidateList">
                    <div className="candidateHighlighted">
                        <h4>Highlighted fragment:</h4>
                        {candidateHighlighted}
                    </div>
                    <div className="candidateWholeList">
                        <h4>Whole elements:</h4>
                        <ul className="list-group">
                            {candidateWholeNodes}
                        </ul>
                    </div>
                    <br />
                    <br />

                </div>
            )
        }
    }
}


