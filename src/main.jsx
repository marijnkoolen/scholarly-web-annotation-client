
'use strict'

import React from 'react';
import ReactDOM from 'react-dom';
import AnnotationViewer from './components/annotation/AnnotationViewer.jsx';
import RDFaUtil from './util/RDFaUtil.js';
import SelectionUtil from './util/SelectionUtil.js';
import DOMUtil from './util/DOMUtil.js';
import defaultConfig from './rdfa-annotation-config.js';
import AnnotationActions from './flux/AnnotationActions.js';

ReactDOM.render(
    <AnnotationViewer
        config={defaultConfig}
    />,
    document.getElementById('annotation-viewer')
);

document.onreadystatechange = function () {
    if (document.readyState === "complete") {
        console.log("document ready!");
        var observerTargets = document.getElementsByClassName("annotation-target-observer");
        startObserver(observerTargets);
        setAnnotationAttributes(observerTargets);
    }
}

var setAnnotationAttributes = function(observerTargets) {
    for (var index = 0; index < observerTargets.length; index++) {
        setSelectWholeElement(observerTargets[index]);
        setUnselectable(observerTargets[index]);
    }
}

var setSelectWholeElement = function(node) {
    let selectWholeNodes = RDFaUtil.getSelectWholeNodes(node);
    selectWholeNodes.forEach(function(selectWholeNode) {
        selectWholeNode.addEventListener('mouseup', SelectionUtil.checkSelectionRange, false);
    });
}

var setUnselectable = function(node) {
    let ignoreNodes = RDFaUtil.getRDFaIgnoreNodes(node);
    ignoreNodes.forEach(function(ignoreNode) {
        ignoreNode.style.webkitUserSelect = "none";
        ignoreNode.style.cursor = "not-allowed";
    });
}

var observer = new MutationObserver((mutations) => {
    var observerTargets = document.getElementsByClassName("annotation-target-observer");
    // if something in the observer nodes changes ...
    // set unselectable and whole element attributes
    setAnnotationAttributes(observerTargets);
    // trigger reload of annotations based on updated DOM
    AnnotationActions.reload();
});

var startObserver = function(observerTargets) {
    var observerConfig = { childList: true, attributes: false, subtree: true };

    for (var index = 0; index < observerTargets.length; index++) {
        observer.observe(observerTargets[index], observerConfig);
    }

}

