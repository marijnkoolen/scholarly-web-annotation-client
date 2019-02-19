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
            <div id={this.props.elementId} className="modal fade" role="dialog">
                <div className="modal-dialog modal-lg flex-modal" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">{this.props.title}</h4>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                        <div className="modal-body">
                            {this.props.children}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={this.props.confirmAction} data-dismiss="modal">{this.props.confirmLabel}</button>
                            <button type="button" className="btn btn-primary" data-dismiss="modal">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default FlexModal;
