/*
 *
 * Taken from http://jsfiddle.net/8mdX4/1211/
 * See stackoverflow discussion: http://stackoverflow.com/questions/6240139/highlight-text-range-using-javascript
 * Originally created by Tim Down
 * Contributors: Marijn Koolen
 *
 */

'use strict'

import RDFaUtil from './RDFaUtil.js';
import DOMUtil from './DOMUtil.js';

const SelectionUtil = {

    makeEditableAndHighlight : function(colour) {
        var sel = window.getSelection();
        if (sel.rangeCount && sel.getRangeAt) {
            var range = sel.getRangeAt(0);
        }
        document.designMode = "on";
        if (range) {
            sel.removeAllRanges();
            sel.addRange(range);
        }
        // Use HiliteColor since some browsers apply BackColor to the whole block
        if (!document.execCommand("HiliteColor", false, colour)) {
            document.execCommand("BackColor", false, colour);
        }
        document.designMode = "off";
    },

    addHighlight : function(colour) {
        var range, sel;
        if (window.getSelection) {
            // IE9 and non-IE
            try {
                if (!document.execCommand("BackColor", false, colour)) {
                    SelectionUtil.makeEditableAndHighlight(colour);
                }
            } catch (ex) {
                SelectionUtil.makeEditableAndHighlight(colour)
            }
        } else if (document.selection && document.selection.createRange) {
            // IE <= 8 case
            range = document.selection.createRange();
            range.execCommand("BackColor", false, colour);
        }
        var sel = window.getSelection();
        sel.removeAllRanges();
    },

    removeHighlight : function() {
        document.designMode = "on";
        document.execCommand("removeFormat", false, null);
        document.designMode = "off";
        var sel = window.getSelection();
        sel.removeAllRanges();
    },

    selectAndHighlightRange : function (node, start, end) {
        RDFaUtil.setRDFaSelectionRange(node, start, end);
        SelectionUtil.addHighlight("yellow");
    },

    selectAndRemoveRange : function(node, start, end) {
        RDFaUtil.setRDFaSelectionRange(node, start, end);
        SelectionUtil.removeHighlight();
    },

    // find nodes and offsets corresponding to the selection
    // start node is always before end node in presentation order
    // regardless of whether selection is done forwards or backwards
    getStartEndSelection : function() {
        var selection = document.getSelection();
        if (selection.isCollapsed) {
            let observerNodes = DOMUtil.getObserverNodes();
            return {
                startNode: observerNodes[0],
                endNode: observerNodes[observerNodes.length - 1]
            }
        }
        let position = selection.anchorNode.compareDocumentPosition(selection.focusNode);
        let backwards = position & Node.DOCUMENT_POSITION_PRECEDING;
        return {
            startNode: backwards ? selection.focusNode : selection.anchorNode,
            startOffset: backwards ? selection.focusOffset : selection.anchorOffset,
            endNode: backwards ? selection.anchorNode : selection.focusNode,
            endOffset: backwards ? selection.anchorOffset : selection.focusOffset,
            selectionText: selection.toString(),
            mimeType: "text"
        };
    },

    checkSelectionRange : function() {
        // 1. do nothing selection is not collapsed
        if (document.getSelection().isCollapsed) {
            console.log('selection is collapsed');
            return null;
        }
        // 2. get start and end nodes of selection in display order
        var selection = SelectionUtil.getStartEndSelection();
        console.log(selection);
        // 3. if selection start node has SelectWholeElement property
        let startNode = SelectionUtil.selectWholeElement(selection.startNode)
        let endNode = SelectionUtil.selectWholeElement(selection.endNode)
        if (startNode) {
            // move selection to start of start node
            selection.startOffset = 0;
            selection.startNode = startNode;
        }
        // 4. if selection end node has SelectWholeElement property
        if (endNode) {
            // move selection to end of end node
            let textNodes = DOMUtil.getTextNodes(DOMUtil.getDescendants(endNode));
            console.log(textNodes);
            selection.endNode = textNodes[textNodes.length - 1];
            selection.endOffset = selection.endNode.length;
        }
        // 5. if start and/or end nodes have SelectWholeElement property,
        // make sure the offsets are set properly
        if (startNode || endNode){
            var range = document.createRange();
            range.setStart(selection.startNode, selection.startOffset);
            range.setEnd(selection.endNode, selection.endOffset);
            var sel = document.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    },

    selectWholeElement : function(node) {
        let ancestors = DOMUtil.getAncestors(node);
        let nodes = ancestors.concat([node]).reverse();
        var wholeElement = null;
        for (var index = 0, node; node = nodes[index++]; ) {
            if (node.attributes && node.hasAttribute("property") && node.getAttribute("property") === "selectWholeElement") {
                return node;
            }
        }
        return null;
    },
}

export default SelectionUtil;
