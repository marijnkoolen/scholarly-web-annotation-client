
'use strict'

import VocabularyUtil from './VocabularyUtil.js';
import DOMUtil from './DOMUtil.js';
import StringUtil from './StringUtil.js';
import AnnotationActions from './../flux/AnnotationActions.js';


// RDFa property names
//let RDFaAttrs = ["about", "content", "datatype", "href", "property", "rel", "resource", "rev", "src", "typeof", "vocab"];
let RDFaAttrs = ["about", "property", "resource", "typeof", "vocab"];

const RDFaUtil = {

    /*
    **************************
    * Configuration functions *
    **************************
    */

   setObserverNodes(observerNodes) {
       this.observerNodes = Array.from(observerNodes);
   },

    /*
    **************************
    * RDFa related functions *
    **************************
    */

    // Return RDFa attributes of an element.
    getRDFaAttributes : function(node) {
        var nodeRDFaAttrs = {};
        if (node.nodeType === window.Node.ELEMENT_NODE) {
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

    getRDFaIgnoreNodes : function(node) {
        return DOMUtil.getDescendants(node).filter(RDFaUtil.isRDFaIgnoreNode);
    },

    getSelectWholeNodes : function(node) {
        return DOMUtil.getDescendants(node).filter(RDFaUtil.isSelectWholeNode);
    },

    filterIgnoreNodes : function(nodes) {
        return nodes.filter(function(node) { return RDFaUtil.isRDFaIgnoreNode(node) === false; });
    },

    getNotIgnoreDescendants : function(node) {
        let descendants = [];
        node.childNodes.forEach((childNode) => {
            if (!RDFaUtil.isRDFaIgnoreNode(childNode)) {
                descendants.push(childNode);
                descendants = descendants.concat(RDFaUtil.getNotIgnoreDescendants(childNode));
            }
        });
        return descendants;
    },

    selectRDFaNodes : function(nodes) {
        return nodes.filter(RDFaUtil.hasRDFaResource);
    },

    getRDFaTextNodes : function(node) {
        var textNodes = [];
        if (RDFaUtil.isRDFaIgnoreNode(node))
            return textNodes;
        node.childNodes.forEach((childNode) => {
            if (childNode.nodeType === window.Node.TEXT_NODE)
                textNodes.push(childNode);
            else
                textNodes = textNodes.concat(RDFaUtil.getRDFaTextNodes(childNode));
        });
        return textNodes;
    },

    getRDFaTextContent : function(node) {
        var textContent = "";
        if (RDFaUtil.isRDFaIgnoreNode(node) || node.nodeType === window.Node.COMMENT_NODE)
            return "";
        node.childNodes.forEach((childNode) => {
            var childTextContent;
            if (childNode.nodeType === window.Node.TEXT_NODE) {
                // deal with surrounding whitespace of child nodes
                // based on browser behaviour
                childTextContent = DOMUtil.getTextNodeDisplayText(childNode);
                /*
                childTextContent = StringUtil.collapseWhitespace(childNode.textContent);
                if (textContent === "" && DOMUtil.getDisplayType(node) === "block")
                    childTextContent = childTextContent.trimLeft();
                if (childNode === node.lastChild && DOMUtil.getDisplayType(node) === "block")
                    childTextContent = childTextContent.trimRight();
                */
            }
            else if (childNode.nodeType === window.Node.ELEMENT_NODE) {
                childTextContent = RDFaUtil.getRDFaTextContent(childNode);
                if (DOMUtil.getDisplayType(childNode) === "block") {
                    if (textContent.length > 0)
                        textContent = textContent.trimRight() + "\n";
                    childTextContent = childTextContent.trim() + "\n";
                }
            }
            textContent += childTextContent;
        });
        return textContent;
    },

    getRDFaResource : (node) => {
        return node.hasAttribute("resource") ? node.getAttribute("resource") : node.getAttribute("about")
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

    getTopRDFaResources : function() {
        var topResources = [];
        RDFaUtil.observerNodes.forEach((node) => {
            let topRDFaNodes = RDFaUtil.getTopRDFaNodes(node);
            RDFaUtil.getAnnotatableResouces(node);
            topRDFaNodes.forEach(function(topRDFaNode) {
                let attrs = RDFaUtil.getRDFaAttributes(topRDFaNode);
                topResources.push(attrs.resource || attrs.about);
            });
        });
        return topResources;
    },

    getAnnotatableResouces : function(node) {
        RDFaUtil.getTopRDFaNodes(node).forEach(function(topRDFaNode) {
            let attrs = RDFaUtil.getRDFaAttributes(topRDFaNode);
            VocabularyUtil.getVocabulary(attrs.vocab, function(error) {
                if (error)
                    console.error(error);
                else {
                    let annotatableThings = VocabularyUtil.listAnnotatableThings();
                }
            });
        });

    },

    createBreadcrumbTrail(resourceId) {
        var rootFound = false;
        var breadcrumb = {};
        var labelcrumb = [];
        breadcrumb[resourceId] = {id: resourceId};
        while (!rootFound) {
            let source = AnnotationActions.lookupIdentifier(resourceId);
            breadcrumb[source.data.rdfaResource].type = source.data.rdfaType;
            labelcrumb.unshift({
                id: source.data.rdfaResource,
                node: source.data.domNode,
                property: source.data.rdfaProperty,
                type: source.data.rdfaType
            });
            if (source !== undefined && source.data.rdfaParent) {
                var val = {id: source.data.rdfaParent};
                val[source.data.rdfaProperty] = breadcrumb[source.data.rdfaResource];
                breadcrumb[source.data.rdfaParent] = val;
                delete breadcrumb[source.data.rdfaResource];
                resourceId = source.data.rdfaParent;
            } else {
                rootFound = true;
            }
        }
        return labelcrumb;
    },

    makeIndexEntry(node, vocabulary) {
        return {
            rdfaResource: node.getAttribute("resource"),
            rdfaVocabulary: vocabulary,
            domNode: node,
            rdfaType: node.getAttribute("typeof"),
            rdfaProperty: node.getAttribute("property"),
            text: RDFaUtil.getRDFaTextContent(node)
        }
    },

    updateStack : function(stack, node) {
        var top = stack[stack.length - 1];
        var position = top.compareDocumentPosition(node);
        while (!(position & window.Node.DOCUMENT_POSITION_CONTAINED_BY)) {
            stack.pop();
            var top = stack[stack.length - 1];
            var position = top.compareDocumentPosition(node);
        }
    },

    /*
     **************************
     * RDFa resource relation *
     * and index functions    *
     **************************
     */

    indexRDFaResources : function() {
        var index = {};
        // inex all top-level RDFa resources
        RDFaUtil.observerNodes.forEach((observerNode) => {
            RDFaUtil.getTopRDFaNodes(observerNode).forEach(function(rdfaResourceNode) {
                let topAttrs = RDFaUtil.getRDFaAttributes(rdfaResourceNode);
                index[topAttrs.about] = RDFaUtil.makeIndexEntry(rdfaResourceNode, topAttrs.vocab);
                index[topAttrs.about].rdfaResource = topAttrs.about;
                // index all RDFa sub-resources of top-level resource
                RDFaUtil.indexRDFaSubResources(index, rdfaResourceNode, topAttrs);
            });
        });
        return index;
    },

    indexRDFaSubResources(index, rdfaResourceNode, topAttrs) {
        var resourceStack = [rdfaResourceNode];
        var nodes = RDFaUtil.getNotIgnoreDescendants(rdfaResourceNode);
        RDFaUtil.selectRDFaNodes(nodes).forEach(function(node) {
            let resourceAttrs = RDFaUtil.getRDFaAttributes(node);
            RDFaUtil.updateStack(resourceStack, node);
            var parentAttrs = RDFaUtil.getRDFaAttributes(resourceStack[resourceStack.length - 1]);
            var rdfaParent = parentAttrs.about ? parentAttrs.about : parentAttrs.resource;
            // if top level resource isPartOf a larger resource,
            // store as partOf information on top level resource,
            index[resourceAttrs.resource] = RDFaUtil.makeIndexEntry(node, topAttrs.vocab);
            if (resourceAttrs.property === "isPartOf") {
                index[resourceAttrs.resource].rdfaParent = null;
                index[topAttrs.about].rdfaProperty = "hasPart";
                index[topAttrs.about].rdfaParent = resourceAttrs.resource;
            } else {
                index[resourceAttrs.resource].rdfaParent = rdfaParent;
            }
            resourceStack.push(node);
        });

    },

    buildResourcesMaps : function() {
        var maps = {};
        RDFaUtil.observerNodes.forEach((observerNode) => {
            RDFaUtil.getTopRDFaNodes(observerNode).forEach((rdfaResourceNode) => {
                let map = RDFaUtil.buildResourceMap(rdfaResourceNode);
                map.source = {
                    location: window.location.href,
                    origin: window.location.origin,
                    pathname: window.location.pathname
                }
                maps[map.id] = map;
            });
        });
        return maps;
    },

    buildResourceMap : function(rdfaResourceNode) {
        var resourceMap = RDFaUtil.makeRDFaAttributeMap(rdfaResourceNode);
        RDFaUtil.getRDFaSubresources(rdfaResourceNode).forEach((subresourceNode) => {
            var subresourceMap = RDFaUtil.buildResourceMap(subresourceNode);
            let property = subresourceMap.property;
            if (!Object.keys(resourceMap).includes(property))
                resourceMap[property] = [];
            resourceMap[property].push(subresourceMap);
        })
        return resourceMap;
    },

    makeRDFaAttributeMap : function(rdfaResourceNode) {
        let attrs = RDFaUtil.getRDFaAttributes(rdfaResourceNode);
        var map = {};
        Object.keys(attrs).forEach((name) => {
            if (name === "typeof") {
                map["type"] = attrs[name];
                if (attrs[name].indexOf(" ") >= 0)
                    map["type"] = attrs[name].split(" ");
            }
            else if (name === "resource" || name === "about")
                map["id"] = attrs[name];
            else if (name === "vocab" && attrs[name].includes("#"))
                map[name] = attrs[name].replace(/#$/,"");
            else
                map[name] = attrs[name];
        });
        return map;
    },

    getRDFaSubresources : function(node) {
        var subresourceNodes = [];
        if (!node.childNodes)
            return subresourceNodes;
        node.childNodes.forEach((childNode) => {
            if (childNode.nodeType !== window.Node.ELEMENT_NODE)
                return null;
            if (RDFaUtil.hasRDFaResource(childNode))
                subresourceNodes.push(childNode);
            else {
                let subsubresourceNodes = RDFaUtil.getRDFaSubresources(childNode);
                subresourceNodes = subresourceNodes.concat(subsubresourceNodes);
            }
        });
        return subresourceNodes;
    },

    findResourceRelations : function(resources, resourceIndex) {
        var hasParent = {};
        resources.forEach(function(resource) {
            var parent = resourceIndex[resource].rdfaParent;
            while (parent) {
                hasParent[resource] = parent;
                resource = parent;
                parent = resourceIndex[resource].rdfaParent;
            }
        });
        var relations = [];
        for (var resource in hasParent) {
            relations.push({body: resource, target: hasParent[resource]});
        }
        return relations;
    },

    filterExistingRelationAnnotations(relations, annotations) {
        return relations.filter((relation) =>
            RDFaUtil.relationAnnotationExists(relation, annotations) === false
        );
    },

    relationAnnotationExists : function(relation, annotations) {
        return annotations.some(function(annotation) {
            if (annotation.target.source !== relation.target){
                return false;
            }
            if (annotation.body.source !== relation.body) {
                return false;
            }
            return true;
        });
    },


}

export default RDFaUtil;

