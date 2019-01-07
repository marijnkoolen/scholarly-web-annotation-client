
"use strict";

import StringUtil from "./StringUtil.js";

const DOMUtil = {

    setObserverNodeClass(observerNodeClass) {
        this.observerNodeClass = observerNodeClass;
    },

    getObserverNodes() {
        return document.getElementsByClassName(this.observerNodeClass);
    },

    /*
    *****************************************
    * functions to trim whitespace usage in *
    * text elements to align the HTML DOM   *
    * with the browser view layer           *
    *****************************************
    */

    getDisplayType : function (node) {
        var cStyle = node.currentStyle || window.getComputedStyle(node, "");
        return cStyle.display;
    },

    getTextNodeDisplayOffset : function (textNode) {
        var displayText = textNode.textContent;
        let parentDisplayType = DOMUtil.getDisplayType(textNode.parentNode);
        if (parentDisplayType === "inline") {
            // if parent is inline element,
            // multiple leading whitespace characters are collapsed to a single whitespace
            if (displayText.length === 0 || !displayText.match(/^\s+/)) {
                return 0;
            }
            let leadingSpaces = displayText.match(/^\s+/)[0];
            if (leadingSpaces.length > 1) {
                return leadingSpaces.length - 1;
            } else {
                return leadingSpaces.length;
            }
            /*
            return 0;
            */
        } else {
            if (textNode === textNode.parentNode.firstChild) {
                displayText = displayText.trimLeft();
            } else {
                displayText = StringUtil.collapseLeftWhitespace(displayText);
            }
            return textNode.textContent.length - displayText.length;
        }
    },

    getTextNodeDisplayText : function (textNode) {
        var displayText = textNode.textContent;
        let parentDisplayType = DOMUtil.getDisplayType(textNode.parentNode);
        if (parentDisplayType === "block") {
            if (textNode === textNode.parentNode.firstChild) {
                displayText = displayText.trimLeft();
            } else {
                displayText = StringUtil.collapseLeftWhitespace(displayText);
            }
            if (textNode === textNode.parentNode.lastChild) {
                displayText = displayText.trimRight();
            } else {
                displayText = StringUtil.collapseRightWhitespace(displayText);
            }
        } else {
            //displayText = StringUtil.collapseWhitespace(displayText);
        }
        return displayText;
    },

    /*
    ***********************************
    * DOM element selection functions *
    ***********************************
    */

    getPreviousTextNode : (textNode) => {
        //var previousTextNode = null;
        var parentNode = textNode.parentNode;
        var parentTextNodes = DOMUtil.getTextNodes(parentNode);
        while (parentNode !== document && parentTextNodes.indexOf(textNode) === 0) {
            parentNode = parentNode.parentNode;
            parentTextNodes = DOMUtil.getTextNodes(parentNode);
        }
        if (parentTextNodes.indexOf(textNode) === 0)
            return null;
        return parentTextNodes[parentTextNodes.indexOf(textNode)-1];
    },

    // return all text nodes contained within a node
    getTextNodes : function(node) {
        return DOMUtil.getDescendants(node).filter(function(node) {
            return node.nodeType === window.Node.TEXT_NODE;
        });
    },

    // return all text nodes in a list of nodes
    filterTextNodes : function(nodes) {
        return nodes.filter(function(node) {
            return node.nodeType === window.Node.TEXT_NODE;
        });
    },

    // return all ELEMENT_NODE nodes in a list of nodes
    getElementNodes : function(nodes) {
        return nodes.filter(function(node) {
            return node.nodeType === window.Node.ELEMENT_NODE;
        });
    },

    // return all non-text nodes in a list of nodes
    getNonTextNodes : function(nodes) {
        return nodes.filter(function(node) {
            return node.nodeType !== window.Node.TEXT_NODE;
        });
    },

    // return all ancestor nodes of a node
    getAncestors : function(node) {
        var parentNode = node.parentNode;
        var ancestors = [];
        if (parentNode && parentNode.nodeType !== window.Node.DOCUMENT_NODE) {
            ancestors = DOMUtil.getAncestors(parentNode);
            ancestors.push(parentNode);
        }
        return ancestors;
    },

    // return all descendant nodes of a node
    // using depth-first traversal
    getDescendants : function(node) {
        var descendants = [];
        if (!node.hasChildNodes()) {
            return descendants;
        }
        node.childNodes.forEach(function(childNode) {
            // only consider element and text nodes, i.e. types 1 and 3
            if (childNode.nodeType <= 3) {
                descendants.push(childNode);
                descendants = descendants.concat(DOMUtil.getDescendants(childNode));
            }
        });
        return descendants;
    },

    // select all larger elements (excluding document)
    findCommonAncestors : function(startNode, endNode) {
        var startAncestors = DOMUtil.getAncestors(startNode);
        startAncestors.push(startNode);
        var currNode = endNode;
        // find lowest common ancestor
        while (!(startAncestors.includes(currNode))) {
            currNode = currNode.parentNode;
        }
        // return elements from lowest common ancestor upwards
        return startAncestors.slice(0, startAncestors.indexOf(currNode)+1);
    },

    determineNodeMimeType : (node) => {
        var mimetype = null;
        // 1. ignore non-element, non-text nodes
        if (node.nodeType !== 3 && node.nodeType !== 1)
            return null;
        // 2. check if node has children
        if (!node.hasChildren()) {
            // options:
            switch(node.nodeName) {

            case "#text":
                mimetype = "text";
                break;
            case "CANVAS":
                mimetype = "image";
                break;
            case "IMG":
                mimetype = "image";
                break;
            case "VIDEO":
                mimetype = "video";
                break;
            default:
                mimetype = "text";
                break;
            }
            return {node: node, mimetype: mimetype};
        } else {
            let childMimeTypes = node.forEach((childNode) => {
                return DOMUtil.determineNodeMimeType(childNode);
            });
            mimetype = childMimeTypes[0];
            let singleType = childMimeTypes.every((childMimeType) => {
                childMimeType === mimetype;
            });
            if (singleType) {
                return mimetype;
            } else {
                return "mixed";
            }
        }
        // 2a. if has children, determine mimetype of children
        // 2
    }

};

export default DOMUtil;

