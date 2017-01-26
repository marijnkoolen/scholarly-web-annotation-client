
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
        this.props.removeSelected(candidate);
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
                <h4>Selected targets</h4>
				<p>Click on a selected target to deselect it.</p>
				<ul className="list-group">
					{selectedTargets}
				</ul>
            </div>
        )
    }
}


