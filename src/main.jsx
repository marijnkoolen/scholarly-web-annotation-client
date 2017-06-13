
'use strict'

import React from 'react';
import ReactDOM from 'react-dom';
import AnnotationClient from './components/AnnotationClient.jsx';
import RDFaUtil from './util/RDFaUtil.js';
import SelectionUtil from './util/SelectionUtil.js';
import DOMUtil from './util/DOMUtil.js';
import defaultConfig from './rdfa-annotation-config.js';
import AnnotationActions from './flux/AnnotationActions.js';
import CollectionActions from './flux/CollectionActions.js';
import AppAnnotationStore from './flux/AnnotationStore.js';

export class RDFaAnnotator {

    constructor(configuration) {
        if (!configuration)
            configuration = defaultConfig; // use default if no configuration is given
        this.clientConfiguration = configuration;
        AnnotationActions.setServerAddress(configuration.services.AnnotationServer.api);
        CollectionActions.setServerAddress(configuration.services.AnnotationServer.api);
        this.topResources = RDFaUtil.getTopRDFaResources(document.body);
    }

    addAnnotationClient() {
        var observerTargets = document.getElementsByClassName("annotation-target-observer");
        this.startObserver(observerTargets);
        this.setAnnotationAttributes(observerTargets);
        ReactDOM.render(
            <AnnotationClient
                config={this.clientConfiguration}
            />,
            document.getElementById('annotation-viewer')
        );
    }

    getDefaultConfiguration() {
        return defaultConfig;
    }

    setAnnotationAttributes(observerTargets) {
        for (var index = 0; index < observerTargets.length; index++) {
            this.setSelectWholeElement(observerTargets[index]);
            this.setUnselectable(observerTargets[index]);
        }
    }

    setSelectWholeElement(node) {
        let selectWholeNodes = RDFaUtil.getSelectWholeNodes(node);
        selectWholeNodes.forEach(function(selectWholeNode) {
            selectWholeNode.addEventListener('mouseup', SelectionUtil.checkSelectionRange, false);
        });
    }

    setUnselectable(node) {
        let ignoreNodes = RDFaUtil.getRDFaIgnoreNodes(node);
        ignoreNodes.forEach(function(ignoreNode) {
            ignoreNode.style.webkitUserSelect = "none";
            ignoreNode.style.cursor = "not-allowed";
        });
    }

    startObserver(observerTargets) {
        var observer = new MutationObserver((mutations) => {
            var observerTargets = document.getElementsByClassName("annotation-target-observer");
            // if something in the observer nodes changes ...
            // set unselectable and whole element attributes
            this.setAnnotationAttributes(observerTargets);
            // check if there are new resources
            if (this.resourcesChanged())
                AnnotationActions.loadResources(); // trigger reload of annotations
        });

        var observerConfig = { childList: true, attributes: true, subtree: true };

        for (var index = 0; index < observerTargets.length; index++) {
            observer.observe(observerTargets[index], observerConfig);
        }

    }

    resourcesChanged() {
        let topResources = RDFaUtil.getTopRDFaResources(document.body);
        if (this.listsAreEqual(topResources, this.topResources))
            return false;
        this.topResources = topResources; // update register resources list
        return true;
    }

    listsAreEqual(list1, list2) {
        if (list1.every(id => list2.includes(id)) &&
                list2.every(id => list1.includes(id)))
            return true;
        return false;
    }

}

