'use strict'

import React from 'react';
import AppAnnotationStore from './../../flux/AnnotationStore';
import AnnotationActions from './../../flux/AnnotationActions';
import Resource from './Resource.jsx';

class ResourceList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            resources: [],
        }
    }
    componentDidMount() {
    }

    render() {
        let resourceItems = Object.keys(AnnotationActions.resourceIndex).map((resourceId) => {
            let resource = AnnotationActions.resourceIndex[resourceId];
            return (
                <Resource
                    data={resource}
                    key={resourceId}
                />
            )
        })

        return (
            <div className="resourceList">
                <h3>Annotatable Resources</h3>
                <ul className="list-group">
                    {resourceItems}
                </ul>
            </div>
        );
    }
}

export default ResourceList;

