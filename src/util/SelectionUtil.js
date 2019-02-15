/*
 * Taken from http://jsfiddle.net/8mdX4/1211/
 * See stackoverflow discussion: http://stackoverflow.com/questions/6240139/highlight-text-range-using-javascript
 * Originally created by Tim Down
 * Contributors:
 *   - Marijn Koolen
 *
 */

"use strict";

import RDFaUtil from "./RDFaUtil.js";
import DOMUtil from "./DOMUtil.js";

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
                SelectionUtil.makeEditableAndHighlight(colour);
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

            for (var i = 0; i < textNodes.length; i++) {
                let textNode = textNodes[i];
                // offset of display text w.r.t underlying text content (e.g. removed leading whitespace)
                let displayOffset = DOMUtil.getTextNodeDisplayOffset(textNode);
                let displayText = DOMUtil.getTextNodeDisplayText(textNode);
                endCharCount = charCount + displayText.length;
                if (!foundStart && start >= charCount && (start < endCharCount || (start === endCharCount && i <= textNodes.length))) {
                    range.setStart(textNode, start - charCount + displayOffset);
                    foundStart = true;
                }
                if (foundStart && end === -1) {
                    let lastTextNode = textNodes[textNodes.length-1];
                    range.setEnd(lastTextNode, lastTextNode.length);
                    break;
                }
                else if (foundStart && end !== -1 && end <= endCharCount) {
                    range.setEnd(textNode, end - charCount + displayOffset);
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

    checkDOMElement : (element) => {
        if (element === undefined)
            throw Error("argument 'element' is required.");
        if (!(element instanceof Element) || !document.contains(element))
            throw Error("element must be a DOM element.");
        return true;
    },

    checkRectangle : (rect) => {
        if (rect === undefined)
            throw Error("argument 'rect' is required.");
        if (!(rect instanceof Object))
            throw Error("rect should be an object with properties: x, y, w, h.");
        let keys = Object.keys(rect);
        ["x", "y", "w", "h"].forEach((prop) => {
            if (!keys.includes(prop))
                throw Error("rect is missing required property " + prop + ".");
            if (!Number.isInteger(rect[prop]))
                throw Error("rect property " + prop + " is not an integer.");
        });
        return true;
    },

    checkInterval : (interval) => {
        if (interval === undefined)
            throw Error("argument 'interval' is required.");
        if (!(interval instanceof Object))
            throw Error("interval should be an object with properties: start, end.");
        let keys = Object.keys(interval);
        ["start", "end"].forEach((prop) => {
            if (!keys.includes(prop))
                throw Error("interval is missing required property " + prop + ".");
            if (Number.isNaN(interval[prop]))
                throw Error("interval property " + prop + " is not a number.");
            //if (!Number.isInteger(interval[prop]))
            //    interval[prop] = parseInt(interval[prop]);
        });
        return true;
    },

    setSelection : function(element, selection, mimeType) {
        SelectionUtil.checkDOMElement(element);
        SelectionUtil.currentSelection = {
            startNode: element,
            endNode: element,
            mimeType: mimeType
        };
        if (!selection) {
            return true;
        } else if (mimeType.startsWith("video") || mimeType.startsWith("audio")) {
            SelectionUtil.checkInterval(selection);
            SelectionUtil.currentSelection.interval = selection;
        } else if (mimeType.startsWith("image")) {
            SelectionUtil.checkRectangle(selection);
            SelectionUtil.currentSelection.rect = selection;
        }
    },

    setImageSelection : function(element, rect) {
        SelectionUtil.checkDOMElement(element);
        SelectionUtil.checkRectangle(rect);
        SelectionUtil.currentSelection = {
            startNode: element,
            endNode: element,
            rect: rect,
            mimeType: "image"
        };
    },

    setAudioSelection : function(element, interval) {
        SelectionUtil.checkDOMElement(element);
        SelectionUtil.checkInterval(interval);
        SelectionUtil.currentSelection = {
            startNode: element,
            endNode: element,
            interval: interval,
            mimeType: "audio"
        };
    },

    setVideoSelection : function(element, interval) {
        SelectionUtil.checkDOMElement(element);
        SelectionUtil.checkInterval(interval);
        SelectionUtil.currentSelection = {
            startNode: element,
            endNode: element,
            interval: interval,
            mimeType: "video"
        };
    },

    setDOMSelection : function() {
        var selection = null;
        if (document.getSelection) {
            selection = document.getSelection();
        }
        if (!selection || selection.isCollapsed) {
            let observerNodes = DOMUtil.getObserverNodes();
            SelectionUtil.currentSelection = {
                startNode: observerNodes[0],
                endNode: observerNodes[observerNodes.length - 1],
                mimeType: "multipart" // TODO: FIX based on actual content
            };
        }
        else {
            let position = selection.anchorNode.compareDocumentPosition(selection.focusNode);
            let backwards = position & Node.DOCUMENT_POSITION_PRECEDING;
            if (position === 0 && selection.anchorOffset > selection.focusOffset)
                backwards = 1;
            var focusOffset = SelectionUtil.getTrimmedOffset(selection.focusNode, selection.focusOffset);
            var anchorOffset = SelectionUtil.getTrimmedOffset(selection.anchorNode, selection.anchorOffset);
            SelectionUtil.currentSelection = {
                startNode: backwards ? selection.focusNode : selection.anchorNode,
                startOffset: backwards ? focusOffset : anchorOffset,
                endNode: backwards ? selection.anchorNode : selection.focusNode,
                endOffset: backwards ? anchorOffset : focusOffset,
                selectionText: selection.toString(),
                mimeType: "text"
            };
        }
        let endParent = SelectionUtil.currentSelection.endNode.parentNode;
        if (RDFaUtil.isRDFaIgnoreNode(endParent)) {
            let prevNode = DOMUtil.getPreviousTextNode(SelectionUtil.currentSelection.endNode);
            SelectionUtil.currentSelection.endNode = prevNode;
            SelectionUtil.currentSelection.endOffset = prevNode.length;
            SelectionUtil.adjustSelection(SelectionUtil.currentSelection);
            selection = document.getSelection();
            SelectionUtil.currentSelection.selectionText = selection.toString();
        }
    },

    getTrimmedOffset : function(node, offset) {
        if (node.nodeType === window.Node.TEXT_NODE && offset > 0) {
            //let textContent = node.textContent;
            if (offset > 0)
                offset -= DOMUtil.getTextNodeDisplayOffset(node);
            //offset -= textContent.length - textContent.trimLeft().length;
        }
        return offset;
    },

    // Find nodes and offsets corresponding to the selection.
    // Start node is always before end node in presentation order
    // regardless of whether selection is done forwards or backwards.
    getCurrentSelection : function() {
        if (!SelectionUtil.currentSelection)
            SelectionUtil.setDOMSelection();
        return SelectionUtil.currentSelection;
    },

    checkSelectionRange : function() {
        // 1. do nothing if selection is collapsed (e.g. does not span a range)
        if (document.getSelection().isCollapsed) {
            return null;
        }
        // 2. get start and end nodes of selection in display order
        var selection = SelectionUtil.getCurrentSelection();
        // 3. if selection start node has SelectWholeElement property
        let startNode = SelectionUtil.selectWholeElement(selection.startNode);
        let endNode = SelectionUtil.selectWholeElement(selection.endNode);
        if (selection.startOffset !== undefined && startNode) {
            // move selection to start of start node
            selection.startOffset = 0;
            selection.startNode = startNode;
        }
        // 4. if selection end node has SelectWholeElement property
        if (selection.endOffset !== undefined && endNode) {
            // move selection to end of end node
            let textNodes = DOMUtil.getTextNodes(endNode);
            selection.endNode = textNodes[textNodes.length - 1];
            selection.endOffset = selection.endNode.length;
        }
        // 5. if start and/or end nodes have SelectWholeElement property,
        // make sure the offsets are set properly
        if (startNode || endNode){
            SelectionUtil.adjustSelection(selection);
        }
    },

    adjustSelection : (selection) => {
        var range = document.createRange();
        range.setStart(selection.startNode, selection.startOffset);
        range.setEnd(selection.endNode, selection.endOffset);
        var sel = document.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    },

    selectWholeElement : function(node) {
        let ancestors = DOMUtil.getAncestors(node);
        let nodes = ancestors.concat([node]).reverse();
        for (var index = 0; index < nodes.length; index++) {
            var checkNode = nodes[index];
            if (checkNode.attributes && checkNode.hasAttribute("property") && checkNode.getAttribute("property") === "selectWholeElement") {
                return checkNode;
            }
        }
        return null;
    },

};

export default SelectionUtil;
