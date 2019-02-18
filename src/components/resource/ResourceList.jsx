'use strict'

import React from 'react';
import AppAnnotationStore from './../../flux/AnnotationStore';
import AnnotationStore from './../../flux/AnnotationStore';
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
        //console.log(AnnotationStore.resourceIndex);
        let resourceItems = Object.keys(AnnotationStore.resourceIndex).map((resourceId) => {
            let resource = AnnotationStore.resourceIndex[resourceId];
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
                <ul className="list-group annotation-list-scroll">
                    {resourceItems}
                </ul>
            </div>
        );
    }
}

export default ResourceList;

