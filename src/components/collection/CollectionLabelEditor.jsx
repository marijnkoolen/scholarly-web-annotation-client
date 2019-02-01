
'use strict'

import React from 'react';

export default class CollectionLabelEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collectionLabel: this.props.collectionLabel
        }
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({collectionLabel: event.target.value});
        this.props.onChange(event.target.value);
    }

    render() {
        return (
            <div className="collection-label-editor"
                key="collection-label-editor"
            >
                <label>Collection label: </label>
                &nbsp;
                <input
                    key="collection-label-input"
                    ref="label"
                    type="text"
                    value={this.state.collectionLabel}
                    onChange={this.handleChange.bind(this)}
                />
            </div>
        );
    }
}

