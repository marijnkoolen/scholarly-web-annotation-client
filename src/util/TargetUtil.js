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
        var startNodeOffset = TargetUtil.findNodeOffsetInContainer(container.node, selection.startNode);
        var startOffsetInContainer = startNodeOffset + selection.startOffset;
        var endOffsetInContainer = startOffsetInContainer + selection.selectionText.length;
        let textContent = RDFaUtil.getRDFaTextContent(container.node);
        let prefix = textContent.substr(startOffsetInContainer - 20, 20);
        let suffix = textContent.substr(endOffsetInContainer, 20);
        return {
            node: container.node,
            start: startOffsetInContainer,
            end: startOffsetInContainer + selection.selectionText.length,
            text: selection.selectionText,
            prefix: prefix,
            suffix: suffix,
            label: container.label,
            source: container.source,
            type: "resource"
        }
    },

    /*
    **************************
    * RDFa annotation target *
    * selection functions    *
    **************************
    */

    // given a list of nodes, select all RDFa enriched nodes
    // and return as candidate annotation targets
    getRDFaCandidates : function(nodes) {
        return RDFaUtil.getRDFaNodes(nodes).map(function(node) {
            return {
                node: node,
                type: "resource",
                text: RDFaUtil.getRDFaTextContent(node),
                label: node.getAttribute("typeof"),
                source: node.hasAttribute("resource") ? node.getAttribute("resource") : node.getAttribute("about")
            }
        });
    },

    // Return all potential annotation targets.
    // Annotation targets are elements containing
    // or contained in the selected passage.
    getCandidateRDFaTargets : function() {
        var selection = SelectionUtil.getStartEndSelection();
        var ancestors = DOMUtil.findCommonAncestors(selection.startNode, selection.endNode);
        selection.containerNode = ancestors[ancestors.length - 1];
        var biggerNodes = TargetUtil.getRDFaCandidates(ancestors);
        let selectionNodes = TargetUtil.findSelectionRDFaNodes(selection);
        let smallerNodes = TargetUtil.getRDFaCandidates(selectionNodes);
        var wholeNodes = biggerNodes.concat(smallerNodes);
        var highlighted = null;
        if (selection.startOffset) {
            let container = biggerNodes[biggerNodes.length - 1];
            highlighted = TargetUtil.findHighlighted(container, selection);
        }
        return {wholeNodes: wholeNodes, highlighted: highlighted};
    }

}

export default TargetUtil;



