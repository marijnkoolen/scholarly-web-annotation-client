
'use strict'

import React from 'react';

export default class Collection extends React.Component {
    constructor(props) {
        super(props);
        console.log("constructor done");
        this.state = {
        }
    }

    componentDidMount() {
        console.log("Collection mounted");
    }

    render() {
        return (
            <div className="Collection">
            </div>
        )
    }

}


