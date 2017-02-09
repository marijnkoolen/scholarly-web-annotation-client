/*
Goal:
    -

Input:
    - list of bodies for a configurable task (props.data)
        - annotation ID
        - the bodies (string value)
    - a annotation config (props.config)
    - onOutput (what to do after adding/removing a comment) --> should be changed to Flux?

Output/emits:
    - 'on change' (whenever adding/removing a comment)
        - data:
            - event type ('add', 'delete')
            - the item that was added/deleted (ID + value)
            - the list of bodies
*/

import React from 'react';

class FlexForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data ? this.props.data : []
        }
    }

    addBody(e) {
        e.preventDefault();
        var cs = this.state.data;
        if(cs) {
            var annotation = {
                value : this.refs.body.value,
                purpose : {this.props.task.taskname},
                type : {this.props.task.tasklabel},
                format : "text/plain"
            }
            cs.push(annotation);
            this.setState({data : cs}, this.onOutput.bind(this));
            this.refs.body.value = '';
        }
    }

    removeBody(index) {
        var cs = this.state.data;
        if(cs) {
            cs.splice(index, 1);
            this.setState({data : cs}, this.onOutput.bind(this));
        }
    }

    onOutput() {
        if(this.props.onOutput) {
            this.props.onOutput('bodies', this.state.data);
        }
    }

    render() {
        let bodyList = null;
        const bodies = this.state.data.map((body, index) => {
            console.log(body);
            return (
                <li key={'com__' + index} className="list-group-item">
                    <i className="glyphicon glyphicon-remove interactive" onClick={this.removeBody.bind(this, index)}></i>
                    &nbsp;
                    {body.value}
                </li>
            )
        }, this);
        if(bodies.length > 0) {
            bodyList = (
                <div>
                    <h4>Added bodies</h4>
                    <ul className="list-group">
                        {bodies}
                    </ul>
                </div>
            )
        }
        let taskKey = "form__" + this.props.task.taskname;

        return (
            <div key={taskKey}>
                <br/>
                <div className="row">
                    <div className="col-md-12">
                        {bodyList}
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <form>
                            <div className="form-group">
                                <h4>{this.props.task.tasklabel}</h4>
                                <input
                                    ref={this.props.task.taskname}
                                    type="text"
                                    className="form-control"
                                    placeholder={this.props.task.placeholder}
                                />
                                <br/>
                                <button className="btn btn-primary" onClick={this.addBody.bind(this)}>Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default FlexForm;

