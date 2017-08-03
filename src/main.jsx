/*
 *
 * Creators:
 *   - Marijn Koolen (Huygens ING, Royal Netherlands Academy of Arts and Sciences)
 *   - Jaap Blom (Netherlands Institute for Sound and Vision)
 *
 */

'use strict'

import React from 'react';
import ReactDOM from 'react-dom';
import AnnotationClient from './components/AnnotationClient.jsx';
import RDFaUtil from './util/RDFaUtil.js';
import TargetUtil from './util/TargetUtil.js';
import SelectionUtil from './util/SelectionUtil.js';
import DOMUtil from './util/DOMUtil.js';
import defaultConfig from './rdfa-annotation-config.js';
import AnnotationActions from './flux/AnnotationActions.js';
import CollectionActions from './flux/CollectionActions.js';
import AppAnnotationStore from './flux/AnnotationStore.js';

export class ScholarlyWebAnnotator {

    constructor(configuration) {
        this.clientConfig = defaultConfig;
        this.configureClient(configuration);
    }

    addAnnotationClient(element) {
        ReactDOM.render(
            <AnnotationClient
                config={this.clientConfig}
            />,
            element
        );
    }

    overrideDefaultConfiguration(configuration) {
        Object.keys(configuration).forEach((property) => {
            this.clientConfig[property] = configuration[property];
        });
    }

    configureClient(configuration) {
        if (configuration)
            this.overrideDefaultConfiguration(configuration);
        AnnotationActions.setServerAddress(this.clientConfig.services.AnnotationServer.api);
        CollectionActions.setServerAddress(this.clientConfig.services.AnnotationServer.api);
        this.configureObservers();
        this.topResources = RDFaUtil.getTopRDFaResources();
    }

    configureObservers() {
        DOMUtil.setObserverNodeClass(this.clientConfig.targetObserverClass);
        this.observerNodes = DOMUtil.getObserverNodes();
        RDFaUtil.setObserverNodes(this.observerNodes);
        this.startObserver();
        this.setSelectionListener();
        this.setAnnotationAttributes();
    }

    setAnnotationAttributes() {
        for (var index = 0; index < this.observerNodes.length; index++) {
            this.setSelectWholeElement(this.observerNodes[index]);
            this.setUnselectable(this.observerNodes[index]);
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

    startObserver() {
        var observer = new MutationObserver((mutations) => {
            // if something in the observer nodes changes,
            // set unselectable and whole element attributes
            this.setAnnotationAttributes(this.observerNodes);
            // check if there are new resources
            if (this.resourcesChanged())
                AnnotationActions.loadResources(); // trigger reload of annotations
        });

        var observerConfig = { childList: true, attributes: true, subtree: true };

        for (var index = 0; index < this.observerNodes.length; index++) {
            observer.observe(this.observerNodes[index], observerConfig);
        }

    }

    setSelectionListener() {
        document.addEventListener("selectionchange", function() {
            SelectionUtil.setDOMSelection();
        });
    }

    setSelection(element, selection, mimeType) {
        SelectionUtil.setSelection(element, selection, mimeType);
    }

    annotateSelection(data) {
        try {
            SelectionUtil.setSelection(data.element, data.selection, data.mimeType);
            let candidateTargets = TargetUtil.getCandidateRDFaTargets();
            if (candidateTargets.highlighted) {
                AnnotationActions.createAnnotation([candidateTargets.highlighted]);
            } else {
                AnnotationActions.createAnnotation(candidateTargets.wholeNodes);
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    setImageSelection(element, coords) {
        SelectionUtil.setImageSelection(element, coords);
    }

    setAudioselection(element, interval) {
        SelectionUtil.setAudioSelection(element, interval);
    }

    setVideoselection(element, interval) {
        SelectionUtil.setVideoSelection(element, interval);
    }

    resourcesChanged() {
        let topResources = RDFaUtil.getTopRDFaResources();
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

