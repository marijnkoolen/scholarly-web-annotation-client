
'use strict'

import React from 'react';

export default class CollectionLabelEditor extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
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
                    value={this.props.collectionLabel}
                    onChange={this.handleChange.bind(this)}
                />
            </div>
        );
    }
}

