/*
 * Taken from http://jsfiddle.net/8mdX4/1211/
 * See stackoverflow discussion: http://stackoverflow.com/questions/6240139/highlight-text-range-using-javascript
 * Originally created by Tim Down
 * Contributors:
 *   - Marijn Koolen
 *
 */

'use strict'

import RDFaUtil from './RDFaUtil.js';
import DOMUtil from './DOMUtil.js';

const SelectionUtil = {

    currentSelection : null,

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
            sel = window.getSelection();
        } else if (document.selection && document.selection.createRange) {
            // IE <= 8 case
            range = document.selection.createRange();
            range.execCommand("BackColor", false, colour);
        }
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
        SelectionUtil.setRDFaSelectionRange(node, start, end);
        SelectionUtil.addHighlight("yellow");
    },

    selectAndRemoveRange : function(node, start, end) {
        SelectionUtil.setRDFaSelectionRange(node, start, end);
        SelectionUtil.removeHighlight();
    },

    setRDFaSelectionRange : function(el, start, end) {
        if (document.createRange && window.getSelection) {
            var range = document.createRange();
            range.selectNodeContents(el);
            var textNodes = RDFaUtil.getRDFaTextNodes(el);
            var foundStart = false;
            var charCount = 0, endCharCount;

            for (var i = 0, textNode; textNode = textNodes[i]; i++) {
                endCharCount = charCount + textNode.length;
                if (!foundStart && start >= charCount && (start < endCharCount || (start === endCharCount && i <= textNodes.length))) {
                    range.setStart(textNode, start - charCount);
                    foundStart = true;
                }
                if (foundStart && end === -1) {
                    let lastTextNode = textNodes[textNodes.length-1];
                    range.setEnd(lastTextNode, lastTextNode.length);
                    break;
                }
                else if (foundStart && end !== -1 && end <= endCharCount) {
                    range.setEnd(textNode, end - charCount);
                    break;
                }
                charCount = endCharCount;
            }
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);

        } else if (document.selection && document.body.createTextRange) {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(true);
            textRange.moveEnd("character", end);
            textRange.moveStart("character", start);
            textRange.select();
        }
    },

    setImageSelection : function(element, coords) {
        console.log("setting image selection");
        SelectionUtil.currentSelection = {
            startNode: element,
            endNode: element,
            coords: coords,
            mimeType: "image"
        }
    },

    setAudioSelection : function(element, interval) {
        console.log("setting audio selection");
        SelectionUtil.currentSelection = {
            startNode: element,
            endNode: element,
            interval: interval,
            mimeType: "audio"
        }
    },

    setVideoSelection : function(element, interval) {
        console.log("setting video selection");
        SelectionUtil.currentSelection = {
            startNode: element,
            endNode: element,
            interval: interval,
            mimeType: "video"
        }
    },

    updateSelection : function() {
        console.log("setting text selection");
        var selection = document.getSelection();
        if (selection.isCollapsed) {
            let observerNodes = DOMUtil.getObserverNodes();
            SelectionUtil.currentSelection = {
                startNode: observerNodes[0],
                endNode: observerNodes[observerNodes.length - 1],
                mimeType: "multipart" // TODO: FIX based on actual content
            }
        }
        else {
            let position = selection.anchorNode.compareDocumentPosition(selection.focusNode);
            let backwards = position & Node.DOCUMENT_POSITION_PRECEDING;
            if (position === 0 && selection.anchorOffset > selection.focusOffset)
                backwards = 1;
            SelectionUtil.currentSelection = {
                startNode: backwards ? selection.focusNode : selection.anchorNode,
                startOffset: backwards ? selection.focusOffset : selection.anchorOffset,
                endNode: backwards ? selection.anchorNode : selection.focusNode,
                endOffset: backwards ? selection.anchorOffset : selection.focusOffset,
                selectionText: selection.toString(),
                mimeType: "text"
            };
        }
    },

    // Find nodes and offsets corresponding to the selection.
    // Start node is always before end node in presentation order
    // regardless of whether selection is done forwards or backwards.
    getStartEndSelection : function() {
        return SelectionUtil.currentSelection;
    },

    checkSelectionRange : function() {
        // 1. do nothing if selection is collapsed (e.g. does not span a range)
        if (document.getSelection().isCollapsed) {
            return null;
        }
        // 2. get start and end nodes of selection in display order
        var selection = SelectionUtil.getStartEndSelection();
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
