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
        let position = selection.anchorNode.compareDocumentPosition(selection.focusNode);
        if (position & Node.DOCUMENT_POSITION_PRECEDING) {
            return {
                startNode: selection.focusNode,
                startOffset: selection.focusOffset,
                endNode: selection.anchorNode,
                endOffset: selection.anchorOffset,
                selectionText: selection.toString()
            }
        }
        return {
            startNode: selection.anchorNode,
            startOffset: selection.anchorOffset,
            endNode: selection.focusNode,
            endOffset: selection.focusOffset,
            selectionText: selection.toString()
        };
    },


    // the function below is derived from code written by Tim Down, see
    // http://stackoverflow.com/questions/7380190/select-whole-word-with-getselection
    selectWholeElement : function() {
        var sel;

        // Check for existence of window.getSelection() and that it has a
        // modify() method. IE 9 has both selection APIs but no modify() method.
        if (window.getSelection && (sel = window.getSelection()).modify) {
            sel = window.getSelection();
            if (!sel.isCollapsed) {

                // Detect if selection is backwards
                var range = document.createRange();
                range.setStart(sel.anchorNode, sel.anchorOffset);
                range.setEnd(sel.focusNode, sel.focusOffset);
                var backwards = range.collapsed;
                range.detach();

                // modify() works on the focus of the selection
                var endNode = sel.focusNode, endOffset = sel.focusOffset;
                sel.collapse(sel.anchorNode, sel.anchorOffset);

                var direction = [];
                if (backwards) {
                    direction = ['backward', 'forward'];
                } else {
                    direction = ['forward', 'backward'];
                }

                sel.modify("move", direction[0], "character");
                sel.modify("move", direction[1], "paragraph");
                sel.extend(endNode, endOffset);
                sel.modify("extend", direction[1], "character");
                sel.modify("extend", direction[0], "paragraph");
            }
        } else if ( (sel = document.selection) && sel.type != "Control") {
            var textRange = sel.createRange();
            if (textRange.text) {
                textRange.expand("word");
                // Move the end back to not include the word's trailing space(s),
                // if necessary
                while (/\s$/.test(textRange.text)) {
                    textRange.moveEnd("character", -1);
                }
                textRange.select();
            }
        }
    }

}

export default SelectionUtil;
