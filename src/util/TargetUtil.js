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

'use strict'

import DOMUtil from './DOMUtil.js';
import RDFaUtil from './RDFaUtil.js';
import SelectionUtil from './SelectionUtil.js';

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
        let textNodes = DOMUtil.getTextNodes(precedingNodes);
        var targetOffset = 0;
        textNodes.forEach(function(node) {
            targetOffset += node.textContent.length;
        });
        return targetOffset;
    },

    findHighlighted : function(container, selection) {
        if (selection.selectionText.length === 0) {
            return false;
        }
        var params = this.makeTextPositionParams(container, selection);
        this.makeTextQuoteParams(container, params);
        return {
            node: container.node,
            mimeType: selection.mimeType,
            params: params,
            label: container.label,
            source: container.source,
            type: "resource"
        }
    },

    makeTextPositionParams : function(container, selection) {
        var startNodeOffset = TargetUtil.findNodeOffsetInContainer(container.node, selection.startNode);
        var endNodeOffset = TargetUtil.findNodeOffsetInContainer(container.node, selection.endNode);
        return {
            start: startNodeOffset + selection.startOffset,
            end: endNodeOffset + selection.endOffset
        }
    },

    makeTextQuoteParams : function(container, params) {
        let textContent = RDFaUtil.getRDFaTextContent(container.node);
        let maxPrefix = params.start >= 20 ? 20 : params.start;
        let selectionLength = params.end - params.start;
        params.text = textContent.substr(params.start, selectionLength);
        params.prefix = textContent.substr(params.start - maxPrefix, maxPrefix);
        params.suffix = textContent.substr(params.end, 20);
    },

    // given a list of nodes, select all RDFa enriched nodes
    // and return as candidate annotation targets
    getRDFaCandidates : function(nodes) {
        return RDFaUtil.selectRDFaNodes(nodes).map(function(node) {
            return {
                node: node,
                type: "resource",
                mimeType: "text",
                params: {
                    text: RDFaUtil.getRDFaTextContent(node)
                },
                label: node.getAttribute("typeof"),
                source: node.hasAttribute("resource") ? node.getAttribute("resource") : node.getAttribute("about")
            }
        });
    },

    // Return all potential annotation targets.
    // Annotation targets are elements containing
    // or contained in the selected passage.
    getCandidateRDFaTargets : function(defaultTargets) {
        var selection = SelectionUtil.getStartEndSelection();
        var ancestors = DOMUtil.findCommonAncestors(selection.startNode, selection.endNode);
        selection.containerNode = ancestors[ancestors.length - 1];
        var biggerNodes = TargetUtil.getRDFaCandidates(ancestors);
        let selectionNodes = TargetUtil.findSelectionRDFaNodes(selection);
        let smallerNodes = TargetUtil.getRDFaCandidates(selectionNodes);
        var wholeNodes = biggerNodes.concat(smallerNodes);
        var highlighted = null;
        if (selection.startOffset !== undefined) {
            let container = biggerNodes[biggerNodes.length - 1];
            highlighted = TargetUtil.findHighlighted(container, selection);
        }
        else {
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
            return false
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
            return {
                source: annotation.id,
                type: "annotation",
                params: {
                    text: annotation.body[0].value
                },
                label: annotation.body[0].purpose,
                target: {
                    source: annotation.id
                }
            }
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
}

export default TargetUtil;



