
'use strict'

import React from 'react';
import ReactDOM from 'react-dom';
import AnnotationViewer from './components/annotation/AnnotationViewer.jsx';
import RDFaUtil from './util/RDFaUtil.js';
import SelectionUtil from './util/SelectionUtil.js';
import DOMUtil from './util/DOMUtil.js';
import defaultConfig from './rdfa-annotation-config.js';
import AnnotationActions from './flux/AnnotationActions.js';
import AppAnnotationStore from './flux/AnnotationStore.js';

export class RDFaAnnotator {

    constructor(configuration) {
        if (!configuration)
            configuration = defaultConfig; // use default if no configuration is given
        this.clientConfiguration = configuration;
        AnnotationActions.setServerAddress(configuration.services.AnnotationServer.api);
    }

    addAnnotationViewer() {
        var observerTargets = document.getElementsByClassName("annotation-target-observer");
        this.startObserver(observerTargets);
        this.setAnnotationAttributes(observerTargets);
        ReactDOM.render(
            <AnnotationViewer
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
            // trigger reload of annotations based on updated DOM
            AnnotationActions.reload();
        });

        var observerConfig = { childList: true, attributes: false, subtree: true };

        for (var index = 0; index < observerTargets.length; index++) {
            observer.observe(observerTargets[index], observerConfig);
        }

    }

}

