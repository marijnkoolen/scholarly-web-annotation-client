'use strict'

import React from 'react';
import AppAnnotationStore from './../../flux/AnnotationStore';
import AnnotationStore from './../../flux/AnnotationStore';
import Resource from './Resource.jsx';

class ResourceList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            resourceIds: [],
            externalIds: [],
            view: "resources",
        }
    }
    componentDidMount() {
        AppAnnotationStore.bind('loaded-resources', this.listResources.bind(this));
    }

    changeView(e) {
        this.setState({view: e.target.name});
    }

    listResources(topResources, resourceMaps) {
        let resourceIds = Object.keys(AnnotationStore.resourceIndex);
        let externalIds = Object.keys(AnnotationStore.externalResourceIndex).filter((resourceId) => {
            return !AnnotationStore.resourceIndex.hasOwnProperty(resourceId);
        })
        //console.log("resourceIds:", resourceIds);
        //console.log("externalIds:", externalIds);
        this.setState({
            resourceIds: resourceIds,
            externalIds: externalIds
        });
    }

    render() {
        //console.log(AnnotationStore.resourceIndex);
        let component = this;
        let resourceItems = null;
        let externalItems = null;
        //console.log(this.state.resourceIds);
        resourceItems = this.state.resourceIds.map((resourceId) => {
            //console.log("mapping resource item:", resourceId);
            let resource = AnnotationStore.resourceIndex[resourceId];
            //console.log("mapping resource:", resource);
            return (
                <Resource
                    data={resource}
                    key={resourceId}
                />
            );
        });
        //console.log("resourceItems:", resourceItems);

        externalItems = this.state.externalIds.map((resourceId) => {
            let resource = AnnotationStore.externalResourceIndex[resourceId];
            return (
                <Resource
                    data={resource}
                    key={resourceId}
                />
            );
        });
        //console.log("externalItems:", externalItems);

        let itemTypes = ["resources", "external"];
        let viewerTabContents = itemTypes.map((itemType) => {
            var itemList;
            if (itemType === "resources")
                itemList = resourceItems;
            if (itemType === "external")
                itemList = externalItems;
            return (
                <div
                    key={itemType + '__tab_content'}
                    id={itemType}
                    className={this.state.view === itemType ? 'tab-pane active' : 'tab-pane'}>
                    <ul className="list-group annotation-scroll-list">
                        {itemList}
                    </ul>
                </div>
            )
        });

        const viewerTabs = itemTypes.map((itemType) => {
            return (
                <li
                    key={itemType + '__tab_option'}
                    className="nav-item viewer-tab "
                >
                    <a onClick={this.changeView.bind(this)} name={itemType} data-toggle="tab" href={'#' + itemType} className={component.state.view === itemType ? 'nav-link active' : 'nav-link'}>
                        {itemType}
                    </a>
                </li>
            )
        });


        return (
            <div className="resourceList">
                <h3>Annotatable Resources</h3>
                <ul className="nav nav-tabs nav-fill viewer-tabs">
                    {viewerTabs}
                </ul>
                <div className="tab-content">
                    {viewerTabContents}
                </div>
            </div>
        );
    }
}

export default ResourceList;

