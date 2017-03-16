/*
Goal:
	-

Input:
	- list of comments (props.data)
		- annotation ID
		- the comment (string value)
	- a annotation config (props.config)
	- onOutput (what to do after adding/removing a comment) --> should be changed to Flux?

Output/emits:
	- 'on change' (whenever adding/removing a comment)
		- data:
			- event type ('add', 'delete')
			- the item that was added/deleted (ID + value)
			- the list of comments
*/

import React from 'react';

class CommentingForm extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			data: this.props.data ? this.props.data : []
		}
	}

	addComment(e) {
		e.preventDefault();
		var cs = this.state.data;
		if(cs) {
            var annotation = {
                value : this.refs.comment.value,
                purpose : this.props.config.purpose,
                type : this.props.config.type,
                format : this.props.config.format
            }
			cs.push(annotation);
			this.setState({data : cs}, this.onOutput.bind(this));
			this.refs.comment.value = '';
		}
	}

	removeComment(index) {
		var cs = this.state.data;
		if(cs) {
			cs.splice(index, 1);
			this.setState({data : cs}, this.onOutput.bind(this));
		}
	}

	onOutput() {
		if(this.props.onOutput) {
			this.props.onOutput('comments', this.state.data);
		}
	}

	render() {
		let commentList = null;
		const comments = this.state.data.map((comment, index) => {
			return (
				<li key={'com__' + index} className="list-group-item">
					<i className="glyphicon glyphicon-remove interactive" onClick={this.removeComment.bind(this, index)}></i>
					&nbsp;
					{comment.value}
				</li>
			)
		}, this);
		if(comments.length > 0) {
			commentList = (
				<div>
					<h4>Added comments</h4>
					<ul className="list-group">
						{comments}
					</ul>
				</div>
			)
		}

		return (
			<div key="form__comment">
				<br/>
				<div className="row">
					<div className="col-md-12">
						{commentList}
					</div>
				</div>
				<div className="row">
					<div className="col-md-12">
						<form>
							<div className="form-group">
								<h4>Comment</h4>
								<input
									ref="comment"
									type="text"
									className="form-control"
									placeholder="Add one or more tags"
								/>
								<br/>
								<button className="btn btn-primary" onClick={this.addComment.bind(this)}>Add</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		)
	}
}

export default CommentingForm;
