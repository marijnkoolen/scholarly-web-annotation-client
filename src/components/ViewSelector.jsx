
'use strict'

import React from 'react';
import AnnotationUtil from './../util/AnnotationUtil.js';
import AppAnnotationStore from './../flux/AnnotationStore';
import AnnotationActions from '../flux/AnnotationActions.js';

export default class ViewSelector extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.modes = ["annotations", "collections", "resources"];
		this.state = {
			currentMode: "annotations"
		}
	}

	handleChange(event) {
		console.log(event.target.value);
		this.setState({currentMode: event.target.value});
		this.props.handleViewChange(event.target.value);
	}

	render() {
		let modes = this.modes.map((mode) => {
			let modeId = "view-selector-" + mode;
			return (
				<option key={modeId} value={mode}>{mode}</option>
			);
		});
		return (
			<div className="ViewSelector">
				<select value={this.state.currentMode} onChange={this.handleChange}>
					{modes}
				</select>
			</div>
		)
	}

}


