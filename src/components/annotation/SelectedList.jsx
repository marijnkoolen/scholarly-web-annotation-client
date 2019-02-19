
'use strict'

import React from 'react';
import CandidateTarget from './CandidateTarget.jsx';

export default class SelectedList extends React.Component {
    constructor(props) {
        super(props);
        this.removeTarget = this.removeTarget.bind(this);
        this.state = {selected: []};
    }
    removeTarget(candidate) {
        this.props.removeFromSelected(candidate);
    }
    render() {
        var selectedList = this;
        var selectedTargets = this.props.candidates.map(function(candidate) {
            return (
                <CandidateTarget
                    onClick={selectedList.removeTarget}
                    key={candidate.source}
                    candidate={candidate}
                />
            );
        });
        return (
            <div className="selectedList">
                <ul className="list-group candidate-scroll-list">
                    {selectedTargets}
                </ul>
            </div>
        )
    }
}


