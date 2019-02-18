/*
 * TargetUtil.js allows user to select text fragments
 * in RDFa enriched HTML documents.
 *
 * This package calculates offsets of selected/highlighted text w.r.t.
 * anchor and focus nodes and their parent nodes. For this, browser
 * interpretation and treatment of whitespaces is relevant.
 * See:
 *   - https://www.w3.org/TR/html401/struct/text.html#h-9.1
 *   - https://www.w3.org/TR/html401/appendix/notes.html#notes-line-breaks
 *   - http://stackoverflow.com/questions/27025877/are-leading-and-trailing-whitespaces-ignored-in-html
 *
 * Detecting wether an element is displayed ineline:
 *   - http://stackoverflow.com/questions/2880957/detect-inline-block-type-of-a-dom-element
 */

"use strict";

import DOMUtil from "./DOMUtil.js";
import RDFaUtil from "./RDFaUtil.js";
import FRBRooUtil from "./FRBRooUtil.js";
import SelectionUtil from "./SelectionUtil.js";
import AnnotationUtil from "./AnnotationUtil.js";
import AnnotationActions from "../flux/AnnotationActions.js";
import AnnotationStore from "../flux/AnnotationStore.js";

const TargetUtil = {

    /*
     **************************
     * RDFa annotation target *
     * selection functions    *
     **************************
     */

    // return all RDFa enriched nodes within range of a text selection
    findSelectionRDFaNodes : function(selection) {
        let descendants = RDFaUtil.getNotIgnoreDescendants(selection.containerNode);
        var selectionNodes;
        if (selection.startNode === selection.containerNode) {
            selectionNodes = descendants;
        }
        else {
            // select all descendants in depth first traversal order
            // from start node up and including end node
            let startNodeIndex = descendants.indexOf(selection.startNode);
            let endNodeIndex = descendants.indexOf(selection.endNode);
            selectionNodes = descendants.slice(startNodeIndex, endNodeIndex+1);
            // ancestors of startnode which are descendants of container node
            // are also selection nodes
            let startAncestors = DOMUtil.getAncestors(selection.startNode);
            var containerIndex = startAncestors.indexOf(selection.containerNode);
            var startAncestorsInSelection = startAncestors.slice(containerIndex+1);
            selectionNodes = startAncestorsInSelection.concat(selectionNodes);
        }
        return selectionNodes;
    },

    findNodeOffsetInContainer : function(container, targetNode) {
        let descendants = RDFaUtil.getNotIgnoreDescendants(container);
        let precedingNodes = descendants.slice(0, descendants.indexOf(targetNode));
        let textNodes = DOMUtil.filterTextNodes(precedingNodes);
        var targetOffset = 0;
        textNodes.forEach(function(node) {
            let displayText = DOMUtil.getTextNodeDisplayText(node);
            targetOffset += node.textContent.length;
        });
        return targetOffset;
    },

    findHighlighted : function(container, selection) {
        var params = null;
        if (selection.mimeType.startsWith("text")) {
            if (selection.selectionText.length > 0) {
                params = TargetUtil.makeTextSelectors(container, selection);
            }
        } else if (selection.mimeType.startsWith("image")) {
            if (selection.rect !== undefined) {
                params = {rect: selection.rect};
            }
        } else if (selection.mimeType.startsWith("audio") || selection.mimeType.startsWith("video")) {
            if (selection.interval !== undefined) {
                params = {interval: selection.interval};
            }
        } else {
            //console.error("Selection has unknown mimetype:", selection);
        }
        params.breadcrumbs = RDFaUtil.createBreadcrumbTrail(container.source);
        return {
            node: container.node,
            mimeType: selection.mimeType,
            params: params,
            label: container.label,
            source: container.source,
            type: "resource"
        };
    },

    makeTextSelectors : function(container, selection) {
        var startNodeOffset = TargetUtil.findNodeOffsetInContainer(container.node, selection.startNode);
        var endNodeOffset = TargetUtil.findNodeOffsetInContainer(container.node, selection.endNode);
        selection.startContainerOffset = startNodeOffset + selection.startOffset;
        selection.endContainerOffset = endNodeOffset + selection.endOffset;
        return {
            position: this.makeTextPositionParams(container, selection),
            quote: this.makeTextQuoteParams(container, selection)
        };
    },

    makeTextPositionParams : function(container, selection) {
        return {
            start: selection.startContainerOffset,
            end: selection.endContainerOffset
        };
    },

    makeTextQuoteParams : function(container, selection) {
        let textContent = RDFaUtil.getRDFaTextContent(container.node);
        let maxPrefix = selection.startContainerOffset >= 20 ? 20 : selection.startContainerOffset;
        let selectionLength = selection.endContainerOffset - selection.startContainerOffset;
        return {
            exact: textContent.substr(selection.startContainerOffset, selectionLength),
            prefix: textContent.substr(selection.startContainerOffset - maxPrefix, maxPrefix),
            suffix: textContent.substr(selection.endContainerOffset, 20)
        };
    },

    // given a list of nodes, select all RDFa enriched nodes
    // and return as candidate annotation targets
    getRDFaCandidates : function(nodes) {
        return RDFaUtil.selectRDFaNodes(nodes).map(function(node) {
            let resourceId = RDFaUtil.getRDFaResource(node);
            return {
                node: node,
                type: "resource",
                mimeType: "text", // TODO - fix based on actual content
                params: {
                    breadcrumbs: RDFaUtil.createBreadcrumbTrail(resourceId),
                    text: RDFaUtil.getRDFaTextContent(node),
                },
                label: node.getAttribute("typeof"),
                source: resourceId
            };
        });
    },

    // Return all potential annotation targets.
    getCandidates : function(annotations, defaultTargets) {
        let candidateResources = TargetUtil.getCandidateRDFaTargets(defaultTargets);
        let candidateAnnotations = TargetUtil.selectCandidateAnnotations(annotations, candidateResources.highlighted);
        let candidateExternalResources = TargetUtil.getCandidateExternalResources(candidateResources);
        return {resource: candidateResources, annotation: candidateAnnotations, external: candidateExternalResources};
    },

    // Given a set of potential target resources, return a list of all associated external resources
    getCandidateExternalResources(resources) {
        let externalResources = {highlighted: null, wholeNodes: []};
        //console.log(resources.highlighted);
        if (resources.highlighted && AnnotationActions.hasRepresentedResource(resources.highlighted.source)) {
            let highlighted = TargetUtil.getCandidateExternalResource(resources.highlighted);
            //console.log(highlighted);
            externalResources.highlighted = highlighted;
            //console.log(resources.highlighted);
        }
        //console.log(resources.wholeNodes);
        //let resourceIds = resources.wholeNodes.map((resource) => { return resource.source });
        let wholeNodes = resources.wholeNodes.filter((resource) => { return AnnotationActions.hasExternalResource(resource.source); });
        //let hasExternalResources = resourceIds.filter(AnnotationActions.hasExternalResource);
        //console.log("resourceIds:", resourceIds);
        //console.log("hasExternalResources:", hasExternalResources);
        //externalResources.wholeNodes = hasExternalResources.map((resourceId) => {
        //    return TargetUtil.getCandidateExternalResource(resourceId);
        //});
        externalResources.wholeNodes = wholeNodes.map((wholeNode) => {
            return TargetUtil.getCandidateExternalResource(wholeNode);
        });
        return externalResources;
    },

    getCandidateExternalResource(resource) {
        //console.log("resource:", resource);
        //console.log(AnnotationStore.representedResourceMap);
        if (AnnotationActions.hasRepresentedResource(resource.source)) {
            let representationResource = AnnotationStore.representedResourceMap[resource.source];
            let externalMap = AnnotationStore.externalResourceIndex[representationResource.parentResource];
            let externalResource = {
                resource: externalMap.resource,
                parentResource: externalMap.parentResource,
                relation: externalMap.relation,
                resourceType: externalMap.resourceType,
                type: externalMap.type,
            };
            externalResource.params = {};
            if (resource.params.hasOwnProperty("quote")) {
                externalResource.params.quote = resource.params.quote;
            }
            if (resource.params.hasOwnProperty("position")) {
                externalResource.params.position = resource.params.position
            }
            if (resource.params.hasOwnProperty("text")) {
                externalResource.params.text = resource.params.text;
            }
            externalResource.params.position = resource.params.position;
            externalResource.params.breadcrumbs = FRBRooUtil.createBreadcrumbTrail(AnnotationStore.externalResourceIndex, externalResource.resource)
            externalResource.mimeType = resource.mimeType;
            externalResource.label = externalResource.resourceType.map((resourceType) => {
                return resourceType.substr(resourceType.indexOf("#") + 1);
            })
            externalResource.source = externalResource.resource;
            //console.log(externalResource);
            return externalResource;
        } else {
            return null;
        }
    },

    // Annotation targets are elements containing
    // or contained in the selected passage.
    getCandidateRDFaTargets : function(defaultTargets) {
        var selection = SelectionUtil.getCurrentSelection();
        var ancestors = DOMUtil.findCommonAncestors(selection.startNode, selection.endNode);
        selection.containerNode = ancestors[ancestors.length - 1];
        var biggerNodes = TargetUtil.getRDFaCandidates(ancestors);
        let selectionNodes = TargetUtil.findSelectionRDFaNodes(selection);
        let smallerNodes = TargetUtil.getRDFaCandidates(selectionNodes);
        var wholeNodes = biggerNodes.concat(smallerNodes);
        var highlighted = null;
        if (selection.startOffset !== undefined || selection.rect !== undefined || selection.interval !== undefined) {
            let container = biggerNodes[biggerNodes.length - 1];
            highlighted = TargetUtil.findHighlighted(container, selection);
        }
        else if (defaultTargets !== undefined && Array.isArray(defaultTargets)){
            wholeNodes = wholeNodes.filter((resource) => {
                return defaultTargets.includes(resource.label);
            });
        }
        return {wholeNodes: wholeNodes, highlighted: highlighted};
    },

    selectCandidateAnnotations : function(annotations, highlighted) {
        if (!highlighted)
            return TargetUtil.addCandidateAnnotations(annotations);
        let candidates = annotations.filter(function(annotation) {
            var targets = Array.isArray(annotation.target) ? annotation.target : [annotation.target];
            return targets.some(TargetUtil.hasOverlap);
        });
        return TargetUtil.addCandidateAnnotations(candidates);
    },

    hasOverlap : function(target, highlighted) {
        // if annotation target is not highlighted resource
        // then annotation is not a candidate target
        if (target.source != highlighted.source)
            return false;
        // double check that annotation target and
        // selected candidate have same mime type
        if (target.type != TargetUtil.mapMimeType(highlighted.mimeType))
            return false;
        // if Text target has no selector, it overlaps
        // with highlighted range
        if (!target.selector)
            return true;
        // if selection and annotation target are of type Text
        // check if text position of annotation target overlaps
        // with highlighted range
        if (target.type === "Text") {
            let textPosition = TargetUtil.getSelectorByType(target, "TextPositionSelector");
            // if a Text target has a selector, it should have a text position selector
            if (textPosition && highlighted.start < textPosition.end && highlighted.end > textPosition.start)
                return true;
            // otherwise, assume target doesn't overlap with highlighted range
            return false;
        }
    },

    addCandidateAnnotations : function(annotations) {
        return annotations.map(function(annotation) {
            var text = "";
            var label = "";
            if (annotation.body && annotation.body.length > 0) {
                text = annotation.body[0].value;
                label = annotation.body[0].purpose;
            }
            return {
                source: annotation.id,
                type: "annotation",
                params: {
                    text: text
                },
                label: label,
                target: {
                    source: annotation.id
                }
            };
        });
    },

    /*
     ********************
     * RDFa annotation  *
     * helper functions *
     ********************
     */

    getSelectorTypes : function(target) {
        if (!target.selector)
            return null;

        let selectorTypes = [];

        let selectors = Array.isArray(target.selector) ? target.selector : [target.selector];
        selectors.forEach(function(selector) {
            selectorTypes.push(selector.type);
            if (selector.refinedBy) {
                let refinements = Array.isArray(selector.refinedBy) ? selector.refinedBy : [selector.refinedBy];
                refinements.forEach(function(refinement) {
                    selectorTypes.push(refinement.type);
                });
            }
        });
        return selectorTypes;
    },

    getSelectorByType : function(target, selectorType) {
        if (!target.selector)
            return null;

        let typeSelector = null;

        let selectors = Array.isArray(target.selector) ? target.selector : [target.selector];
        selectors.forEach(function(selector) {
            if (selector.type === selectorType)
                typeSelector = selector;
            else if (selector.refinedBy) {
                let refinements = Array.isArray(selector.refinedBy) ? selector.refinedBy : [selector.refinedBy];
                refinements.forEach(function(refinement) {
                    if (refinement.type === selectorType)
                        typeSelector = refinement;
                });
            }
        });
        return typeSelector;

    },

    mimeTypeMap : {
        "text": "Text",
        "image": "Image",
        "audio": "Audio",
        "video": "Video",
        "application": "Data"
    },

    mapMimeType : function(mimeType) {
        return TargetUtil.mimeTypeMap[mimeType];
    },

    mapTargetsToDOMElements : function(annotation) {
        var domTargets = [];
        AnnotationUtil.extractTargets(annotation).forEach((target) => {
            var targetId = AnnotationUtil.extractTargetIdentifier(target);
            if (!targetId) // target is not loaded in browser window
                return [];
            var source = AnnotationActions.lookupIdentifier(targetId);

            if (source.type === undefined) {
                //console.error("source information for target " + targetId + " should have a type:", source);
            } else if (source.type === "annotation"){
                //AnnotationUtil.extractTargets(source.data).forEach((target) => {
                AnnotationUtil.extractTargets(source.data).forEach(() => {
                    domTargets = domTargets.concat(TargetUtil.mapTargetsToDOMElements(source.data));
                    domTargets = domTargets.concat(TargetUtil.mapTargetsToDOMElements(source.data));
                });
            } else if (source.type === "resource") {
                if (target.type === undefined) {
                    //console.error("Target should have a type property:", target);
                } else if (target.type === "Text") {
                    domTargets.push(TargetUtil.makeTextRange(target, source.data.domNode));
                } else if (target.type === "Image") {
                    domTargets.push(TargetUtil.makeImageRegion(target, source.data.domNode));
                } else if (target.type === "Video" || target.type === "Audio") {
                    domTargets.push(TargetUtil.makeTemporalSegment(target, source.data.domNode));
                } else {
                    //console.error("Unknown target type", target);
                }
            } else {
                //console.error("no source type for source:", source);
            }
        });
        return domTargets;
    },

    makeImageRegion : function(target, node) {
        var imageRegion = {
            type: "Image",
            node: node
        };
        if (target.selector !== undefined && target.selector !== null) {
            let mediaFragment = TargetUtil.getTargetMediaFragment(target);
            imageRegion.rect = mediaFragment.rect;
        }
        return imageRegion;
    },

    makeTextRange(target, node) {
        var targetRange = {
            type: "Text",
            start: 0,
            end: -1,
            node: node
        };
        let textPosition = TargetUtil.getSelectorByType(target, "TextPositionSelector");
        if (textPosition && textPosition.start !== undefined) {
            targetRange.start = textPosition.start;
            targetRange.end = textPosition.end;
        }
        return targetRange;
    },

    makeTemporalSegment : function(target, node) {
        var segment = {
            type: target.type,
            node: node
        };
        if (target.selector !== undefined && target.selector !== null) {
            let mediaFragment = TargetUtil.getTargetMediaFragment(target);
            segment.interval = mediaFragment.interval;
        }
        return segment;
    },

    getTargetText(target, resource) {
        // if whole resource is the target,
        // return the text content of the corresponding node
        if (!target.selector)
            return resource.data.text;
        var selector = target.selector;
        if (target.selector.refinedBy)
            selector = target.selector.refinedBy;
        // if there are multiple selectors, pick any selector since they are alternatives
        if (TargetUtil.hasQuoteSelector(selector)) {
            selector = TargetUtil.getQuoteSelector(selector);
            return selector.exact;
        }
        selector = Array.isArray(selector) ? selector[0] : selector;
        if (!selector.type)
            return null;
        if (selector.type === "TextQuoteSelector")
            return selector.exact;
        if (selector.type === "TextPositionSelector")
            return TargetUtil.getTargetRangeText(resource.data.domNode, selector.start, selector.end);
        return ""; // if no text can is targeted, return empty string
    },

    hasQuoteSelector(selector) {
        let quoteSelector = null;
        if(Array.isArray(selector)) {
            return selector.some((s) => { return s.type === "TextQuoteSelector"});
        } else if (selector.hasOwnProperty("type")) {
            //console.log("selector:", selector);
            throw Error("Invalid selector:");
        } else {
            return selector.type === "TextQuoteSelector";
        }
    },

    getQuoteSelector(selector) {
        let quoteSelector = null;
        if(Array.isArray(selector)) {
            selector.forEach((s) => {
                if (s.type === "TextQuoteSelector") {
                    quoteSelector = s;
                }
            });
            return quoteSelector
        } else if (selector.hasOwnProperty("type")) {
            console.log("selector:", selector);
            throw Error("Invalid selector:");
        } else {
            return selector.type === "TextQuoteSelector";
        }
    },

    getTargetRangeText(node, start, end) {
        SelectionUtil.setRDFaSelectionRange(node, start, end);
        var selection = window.document.getSelection();
        var text = selection.toString();
        selection.removeAllRanges();
        return text;
    },

    getTargetMediaFragment(target) {
        if (typeof(target) === "string")
            return null;
        if (target.selector && target.selector.type === "FragmentSelector") {
            return target.selector;
        } else if (target.selector.refinedBy && target.selector.refinedBy.type === "FragmentSelector") {
            return target.selector.refinedBy;
        }
    },

    toggleHighlight(targetDOMElements, highlighted) {
        targetDOMElements.forEach((target) => {
            if (target.type === undefined) {
                //console.error("Target should have a type:", target);
            } else if (target.type === "Text") {
                TargetUtil.toggleTextHighlight(target, highlighted);
            } else if (target.type === "Audio") {
                TargetUtil.toggleAudioHighlight(target, highlighted);
            } else if (target.type === "Image") {
                TargetUtil.toggleImageHighlight(target, highlighted);
            } else if (target.type === "Video") {
                TargetUtil.toggleVideoHighlight(target, highlighted);
            } else {
                //console.error("Unknown target type:", target);
            }
        });
    },

    toggleTextHighlight(target, highlighted) {
        if (highlighted )
            SelectionUtil.selectAndRemoveRange(target.node, target.start, target.end);
        else
            SelectionUtil.selectAndHighlightRange(target.node, target.start, target.end);
    },

    toggleImageHighlight(target, highlighted) {
        // trigger toggleOverlay event with target node and rectangle as detail
        let toggleOverlay = new CustomEvent("toggle-annotation-overlay", {
            detail: {rect: target.rect, highlighted: highlighted}
        });
        target.node.dispatchEvent(toggleOverlay);
    },

    toggleVideoHighlight(target, started) {
        // trigger toggleOverlay event with target node and rectangle as detail
        let toggleOverlay = new CustomEvent("play-video-segment", {
            detail: {interval: target.interval, started: started}
        });
        target.node.dispatchEvent(toggleOverlay);
    }

};

export default TargetUtil;



