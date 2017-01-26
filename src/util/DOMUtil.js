
'use strict'

const DOMUtil = {
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

    /*
    ***********************************
    * DOM element selection functions *
    ***********************************
    */

    // return all text nodes in a list of nodes
    getTextNodes : function(nodes) {
        return nodes.filter(function(node) {
            return node.nodeName === "#text";
        })
    },


    // return all non-text nodes in a list of nodes
    getNonTextNodes : function(nodes) {
        return nodes.filter(function(node) {
            return node.nodeName !== "#text";
        })
    },


    // return all ancestor nodes of a node
    getAncestors : function(node) {
        var parentNode = node.parentNode;
        var ancestors = [];
        if (parentNode.nodeName !== "#document") {
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
        var currNode = endNode;
        // find lowest common ancestor
        while (!(startAncestors.includes(currNode))) {
            currNode = currNode.parentNode;
        }
        // return elements from lowest common ancestor upwards
        return startAncestors.slice(0, startAncestors.indexOf(currNode)+1);
    },

}

export default DOMUtil;

