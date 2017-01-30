
'use strict'

import VocabularyUtil from './VocabularyUtil.js';
import DOMUtil from './DOMUtil.js';
import StringUtil from './StringUtil.js';

// RDFa property names
let RDFaAttrs = ["about", "content", "datatype", "href", "property", "rel", "resource", "rev", "src", "typeof", "vocab"];

const RDFaUtil = {
    /*
    **************************
    * RDFa related functions *
    **************************
    */

    // Return RDFa attributes of an element.
    getRDFaAttributes : function(node) {
        var nodeRDFaAttrs = {};
        if (node.nodeName !== "#text" && node.nodeName !== "#comment") {
            RDFaAttrs.forEach(function(attr) {
                if (node.hasAttribute(attr)) {
                    nodeRDFaAttrs[attr] = node.getAttribute(attr);
                }
            });
        }
        return nodeRDFaAttrs;
    },

    isRDFaIgnoreNode : function(node) {
        let nodeRDFaAttrs = RDFaUtil.getRDFaAttributes(node);
        return nodeRDFaAttrs.typeof === "IgnorableElement" ? true : false;
    },

    isSelectWholeNode : function(node) {
        let nodeRDFaAttrs = RDFaUtil.getRDFaAttributes(node);
        return nodeRDFaAttrs.property === "selectWholeElement" ? true : false;
    },

    hasRDFaAttributes : function(node) {
        let attrs = RDFaUtil.getRDFaAttributes(node);
        return Object.keys(attrs).length > 0 && (!RDFaUtil.isRDFaIgnoreNode(node)) ? true : false;
    },

    hasRDFaResource : function(node) {
        let attrs = RDFaUtil.getRDFaAttributes(node);
        return attrs.hasOwnProperty("resource") || attrs.hasOwnProperty("about") ? true : false;
    },

    getRDFaIgnoreNodes : function(nodes) {
        return nodes.filter(RDFaUtil.isRDFaIgnoreNode);
    },

    getRDFaIgnoreDescendants : function(ignoreRDFaNodes) {
        var descendants = [];
        ignoreRDFaNodes.forEach(function(ignoreRDFaNode) {
            descendants = descendants.concat(DOMUtil.getDescendants(ignoreRDFaNode));
        });
        return descendants;
    },

    getSelectWholeNodes : function(nodes) {
        return nodes.filter(RDFaUtil.isSelectWholeNode);
    },

    filterIgnoreNodes : function(nodes) {
        let ignoreRDFaNodes = RDFaUtil.getRDFaIgnoreNodes(nodes);
        let ignoreDescendants = RDFaUtil.getRDFaIgnoreDescendants(ignoreRDFaNodes);
        let ignoreNodes = ignoreRDFaNodes.concat(ignoreDescendants);
        return nodes.filter(function(node) { return ignoreNodes.indexOf(node) === -1; });
    },

    getNotIgnoreDescendants : function(node) {
        let descendants = DOMUtil.getDescendants(node);
        return RDFaUtil.filterIgnoreNodes(descendants);
    },

    getRDFaNodes : function(nodes) {
        return nodes.filter(RDFaUtil.hasRDFaResource);
    },

    getRDFaTextNodes : function(node) {
        var textNodes = [];
        if (RDFaUtil.isRDFaIgnoreNode(node)) {
            return textNodes;
        }
        node.childNodes.forEach(function(childNode) {
            if (childNode.nodeName === "#text") {
                textNodes.push(childNode);
            }
            else {
                let childTextNodes = RDFaUtil.getRDFaTextNodes(childNode);
                textNodes = textNodes.concat(childTextNodes);
            }
        });
        return textNodes;
    },

    getRDFaTextContent : function(node) {
        var textContent = "";
        if (RDFaUtil.isRDFaIgnoreNode(node) || node.nodeName === "#comment") {
            return "";
        }
        node.childNodes.forEach(function(childNode) {
            var childTextContent;
            if (childNode.nodeName === "#text") {
                childTextContent = StringUtil.collapse(childNode.textContent);
                if (textContent === "" && DOMUtil.getDisplayType(node) === "block") {
                    childTextContent = childTextContent.trimLeft();
                }
                if (childNode === node.lastChild && DOMUtil.getDisplayType(node) === "block") {
                    childTextContent = childTextContent.trimRight();
                }
            }
            else if (childNode.nodeName === "#comment") {
                return false;
            }
            else {
                childTextContent = RDFaUtil.getRDFaTextContent(childNode);
                if (DOMUtil.getDisplayType(childNode) === "block") {
                    if (textContent.length > 0) {
                        textContent = textContent.trimRight() + "\n";
                    }
                    childTextContent = childTextContent.trim() + "\n";
                }
            }
            textContent += childTextContent;
        });
        return textContent;
    },


    getTopRDFaNodes : function(node) {
        var topRDFaNodes = [];
        // if node itself has RDFa properties it is the top RDFa node
        if (RDFaUtil.hasRDFaResource(node)) {
            topRDFaNodes.push(node);
            return topRDFaNodes;
        }
        node.childNodes.forEach(function(childNode) {
            topRDFaNodes = topRDFaNodes.concat(RDFaUtil.getTopRDFaNodes(childNode));
        })
        return topRDFaNodes;
    },

    getTopRDFaResources : function(node) {
        let topRDFaNodes = RDFaUtil.getTopRDFaNodes(node);
        RDFaUtil.getAnnotatableResouces(node);
        return topRDFaNodes.map(function(topRDFaNode) {
            let attrs = RDFaUtil.getRDFaAttributes(topRDFaNode);
            return attrs.resource || attrs.about;
        });
    },

    getAnnotatableResouces : function(node) {
        RDFaUtil.getTopRDFaNodes(node).forEach(function(topRDFaNode) {
            let attrs = RDFaUtil.getRDFaAttributes(topRDFaNode);
            VocabularyUtil.getVocabulary(attrs.vocab, function(error) {
                if (error)
                    console.log(error);
                else {
                    let annotatableThings = VocabularyUtil.listAnnotatableThings();
                    //console.log(annotatableThings);
                }
            });
        });

    },

    makeIndexEntry(node) {
        return {
            rdfaResource: node.getAttribute("resource"),
            domNode: node,
            rdfaType: node.getAttribute("typeof"),
            rdfaProperty: node.getAttribute("property"),
            text: RDFaUtil.getRDFaTextContent(node)
        }
    },

    updateStack : function(stack, node) {
        var top = stack[stack.length - 1];
        var position = top.compareDocumentPosition(node);
        while (!(position & Node.DOCUMENT_POSITION_CONTAINED_BY)) {
            stack.pop();
            var top = stack[stack.length - 1];
            var position = top.compareDocumentPosition(node);
        }
    },

    indexRDFaResources : function() {
        var index = {};
        // get all top-level RDFa resources
        RDFaUtil.getTopRDFaNodes(document.body).forEach(function(rdfaResourceNode) {
            index[rdfaResourceNode.getAttribute("about")] = RDFaUtil.makeIndexEntry(rdfaResourceNode);
            index[rdfaResourceNode.getAttribute("about")].rdfaResource = rdfaResourceNode.getAttribute("about");
            var resourceStack = [rdfaResourceNode];
            // add all RDFa sub-resources
            var nodes = RDFaUtil.getNotIgnoreDescendants(rdfaResourceNode);
            RDFaUtil.getRDFaNodes(nodes).forEach(function(node) {
                RDFaUtil.updateStack(resourceStack, node);
                var rdfaParent = resourceStack[resourceStack.length - 1];
                // if top level resource isPartOf a larger resource,
                // store as partOf information on top level resource,
                index[node.getAttribute("resource")] = RDFaUtil.makeIndexEntry(node);
                if (node.getAttribute("property") === "isPartOf") {
                    index[node.getAttribute("resource")].rdfaParent = null;
                    index[rdfaResourceNode.getAttribute("about")].rdfaProperty = "hasPart";
                    index[rdfaResourceNode.getAttribute("about")].rdfaParent = node.getAttribute("resource");
                } else {
                    index[node.getAttribute("resource")].rdfaParent = rdfaResourceNode.getAttribute("about");
                }
                resourceStack.push(node);
            })
        });
        return index;
    },

    setRDFaSelectionRange : function(el, start, end) {
        if (document.createRange && window.getSelection) {
            var range = document.createRange();
            range.selectNodeContents(el);
            var textNodes = RDFaUtil.getRDFaTextNodes(el);
            var foundStart = false;
            var charCount = 0, endCharCount;

            for (var i = 0, textNode; textNode = textNodes[i++]; ) {
                endCharCount = charCount + textNode.length;
                if (!foundStart && start >= charCount && (start < endCharCount || (start == endCharCount && i <= textNodes.length))) {
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
    }

}

export default RDFaUtil;

