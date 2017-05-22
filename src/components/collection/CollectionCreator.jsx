
'use strict'

import React from 'react';

export default class CollectionCreator extends React.Component {
    constructor(props) {
        super(props);
        console.log("constructor done");
        this.state = {
        }
    }

    componentDidMount() {
        console.log("CollectionCreator mounted");
    }

    render() {
        return (
            <div className="CollectionCreator">
            </div>
        )
    }

}



