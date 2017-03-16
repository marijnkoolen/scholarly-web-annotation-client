/*
Goal:
	-

Input:
	- list of free text bodies (props.data)
		- annotation ID
		- the free text statement (string value)
	- a annotation config (props.config)
	- onOutput (what to do after adding/removing a free text statement) --> should be changed to Flux?

Output/emits:
	- 'on change' (whenever adding/removing a free text statement)
		- data:
			- event type ('add', 'delete')
			- the item that was added/deleted (ID + value)
			- the list of statements
*/

import React from 'react';

class FreetextForm extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			data: this.props.data ? this.props.data : []
		}
	}

	addStatement(e) {
		e.preventDefault();
		var cs = this.state.data;
		if(cs) {
            var annotation = {
                value : this.refs.statement.value,
                purpose : this.props.config.purpose,
                type : this.props.config.type,
                format : this.props.config.format
            }
			cs.push(annotation);
			this.setState({data : cs}, this.onOutput.bind(this));
			this.refs.statement.value = '';
		}
	}

	removeStatement(index) {
		var cs = this.state.data;
		if(cs) {
			cs.splice(index, 1);
			this.setState({data : cs}, this.onOutput.bind(this));
		}
	}

	onOutput() {
		if(this.props.onOutput) {
			this.props.onOutput('statements', this.state.data);
		}
	}

	render() {
		let statementList = null;
		let elementKey = "form__" + this.props.config.purpose;
		let placeholder = "Add " + this.props.config.type;
		const statements = this.state.data.map((statement, index) => {
			return (
				<li key={'com__' + index} className="list-group-item">
					<i className="glyphicon glyphicon-remove interactive" onClick={this.removeStatement.bind(this, index)}></i>
					&nbsp;
					{statement.value}
				</li>
			)
		}, this);
		if(statements.length > 0) {
			statementList = (
				<div>
					<h4>Added statements</h4>
					<ul className="list-group">
						{statements}
					</ul>
				</div>
			)
		}

		return (
			<div key={elementKey}>
				<br/>
				<div className="row">
					<div className="col-md-12">
						{statementList}
					</div>
				</div>
				<div className="row">
					<div className="col-md-12">
						<form>
							<div className="form-group">
								<h4>{this.props.config.type}</h4>
								<input
									ref="statement"
									type="text"
									className="form-control"
									placeholder={ placeholder }
								/>
								<br/>
								<button className="btn btn-primary" onClick={this.addStatement.bind(this)}>Add</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		)
	}
}

export default FreetextForm;

