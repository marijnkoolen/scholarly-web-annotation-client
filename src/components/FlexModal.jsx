import React from 'react';
import ReactDOM from 'react-dom'
import $ from 'jquery';

class FlexModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount() {
        $(ReactDOM.findDOMNode(this)).modal({
            keyboard : true
        });
        $(ReactDOM.findDOMNode(this)).modal('show');
        $(ReactDOM.findDOMNode(this)).on('hidden.bs.modal', this.props.handleHideModal);
    }

    render() {
        return (
            <div id={this.props.elementId} className="modal fade">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal">x</button>
                             <h4 className="modal-title">{this.props.title}</h4>
                        </div>
                        <div className="modal-body">
                            {this.props.children}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default FlexModal;
