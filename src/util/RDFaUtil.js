
"use strict";

import DOMUtil from "./DOMUtil.js";
import StringUtil from "./StringUtil.js";
import AnnotationActions from "./../flux/AnnotationActions.js";


// RDFa property names
//let RDFaAttrs = ["about", "content", "datatype", "href", "property", "rel", "resource", "rev", "src", "typeof", "vocab"];
let RDFaAttrs = ["about", "prefix", "property", "resource", "typeof", "vocab"];

const RDFaUtil = {

    /*
    **************************
    * Configuration functions *
    **************************
    */

    setBaseAnnotationOntology(url) {
        //console.log("RDFaUtil - setting base ontology url:", url);
        RDFaUtil.baseAnnotationOntologyURL = url;
    },

    setObserverNodes(observerNodes) {
        this.observerNodes = Array.from(observerNodes);
    },

    resetIgnoreNodes() {
        var prefixIndex = {};
        var vocab = null;
        RDFaUtil.setIgnoreNodes(document, vocab, prefixIndex);
        return false;
    },

    setIgnoreNodes(node, vocab, prefixIndex) {
        RDFaUtil.indexPrefixes(node, prefixIndex);
        let attrs = RDFaUtil.getRDFaAttributes(node);
        if (attrs.hasOwnProperty("vocab")) {
            vocab = attrs.vocab;
        }
        RDFaUtil.setIgnoreNode(node, vocab, prefixIndex);
        if (node.hasChildNodes()) {
            node.childNodes.forEach((childNode) => {
                RDFaUtil.setIgnoreNodes(childNode, vocab, prefixIndex);
            });
        }
    },

    setIgnoreNode(node, vocab, prefixIndex) {
        let attrs = RDFaUtil.getRDFaAttributes(node);
        if (attrs.hasOwnProperty("typeof")) {
            //console.log("setIgnoreNode - typeof:", attrs.typeof);
            let rdfType = RDFaUtil.expandRDFaTerm(attrs.typeof, vocab, prefixIndex);
            //console.log("setIgnoreNode - rdfType:", rdfType);
            node.rdfaIgnorable = (RDFaUtil.isIgnoreClass(rdfType)) ? true : false;
            //console.log("ignore URL:", RDFaUtil.baseAnnotationOntologyURL + "#IgnorableElement");
        }
    },

    isIgnoreClass(url) {
        return url === RDFaUtil.baseAnnotationOntologyURL + "#IgnorableElement";
    },

    isIgnoreNode(node) {
        return node.rdfaIgnorable;
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
        return (node.hasOwnProperty("rdfaIgnorable") && node.rdfaIgnorable);
    },

    isSelectWholeNode : function(node) {
        let nodeRDFaAttrs = RDFaUtil.getRDFaAttributes(node);
        return nodeRDFaAttrs.property === "selectWholeElement" ? true : false;
    },

    hasRDFaAttributes : function(node) {
        let attrs = RDFaUtil.getRDFaAttributes(node);
        return Object.keys(attrs).length > 0 && (!RDFaUtil.isRDFaIgnoreNode(node)) ? true : false;
    },

    hasRDFaType : function(node) {
        let attrs = RDFaUtil.getRDFaAttributes(node);
        return attrs.hasOwnProperty("typeof");
    },

    hasRDFaPrefix : function(node) {
        let attrs = RDFaUtil.getRDFaAttributes(node);
        return attrs.hasOwnProperty("prefix");
    },

    hasRDFaResource : function(node) {
        let attrs = RDFaUtil.getRDFaAttributes(node);
        return attrs.hasOwnProperty("resource") || attrs.hasOwnProperty("about") ? true : false;
    },

    getRDFaPrefix : function(node) {
        let attrs = RDFaUtil.getRDFaAttributes(node);
        var prefix = [];
        if (!attrs.hasOwnProperty("prefix")) {
            return null;
        } else {
            let parts = attrs["prefix"].split(" ");
            if (parts.length % 2 !== 0) {
                return null;
            } else {
                for (var i = 0; i < parts.length; i = i+2) {
                    let vocPrefix = parts[i].substring(0,parts[i].length - 1);
                    let vocURL = parts[i+1];
                    prefix.push({vocabularyPrefix: vocPrefix, vocabularyURL: vocURL});
                }
                return prefix;
            }
        }
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
            var childTextContent = "";
            if (RDFaUtil.isIgnoreNode(childNode)) {
                // skip ignore nodes
            } if (childNode.nodeType === window.Node.TEXT_NODE) {
                // deal with surrounding whitespace of child nodes
                // based on browser behaviour
                childTextContent = DOMUtil.getTextNodeDisplayText(childNode);
                //console.log("getRDFaTextContent - TEXT_NODE - childTextContent: #" + childTextContent + "#");
                /*
                childTextContent = StringUtil.collapseWhitespace(childNode.textContent);
                if (textContent === "" && DOMUtil.getDisplayType(node) === "block")
                    childTextContent = childTextContent.trimLeft();
                if (childNode === node.lastChild && DOMUtil.getDisplayType(node) === "block")
                    childTextContent = childTextContent.trimRight();
                */
            } else if (childNode.nodeType === window.Node.ELEMENT_NODE) {
                childTextContent = RDFaUtil.getRDFaTextContent(childNode);
                /*
                if (DOMUtil.getDisplayType(childNode) === "block") {
                    if (textContent.length > 0)
                        textContent = textContent.trimRight() + "\n";
                    childTextContent = childTextContent.trim() + "\n";
                }
                */
                //console.log("getRDFaTextContent - ELEMENT_NODE - childTextContent: #" + childTextContent + "#");
            }
            textContent += childTextContent;
            //console.log("getRDFaTextContent - textContent: #" + textContent + "#");
        });
        return textContent;
    },

    getRDFaResource : (node) => {
        return node.hasAttribute("resource") ? node.getAttribute("resource") : node.getAttribute("about");
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
        });
        return topRDFaNodes;
    },

    getTopRDFaResources : function() {
        var topResources = [];
        RDFaUtil.observerNodes.forEach((node) => {
            let topRDFaNodes = RDFaUtil.getTopRDFaNodes(node);
            topRDFaNodes.forEach(function(topRDFaNode) {
                let attrs = RDFaUtil.getRDFaAttributes(topRDFaNode);
                topResources.push(attrs.resource || attrs.about);
            });
        });
        return topResources;
    },

    addBreadcrumb(labelTrail, source) {
        labelTrail.unshift({
            id: source.data.rdfaResource,
            node: source.data.domNode,
            property: source.data.rdfaProperty,
            type: source.data.rdfTypeLabel
        });
    },

    createBreadcrumbTrail(resourceId) {
        var rootFound = false;
        var breadcrumb = {};
        var labelTrail = [];
        breadcrumb[resourceId] = {id: resourceId};
        while (!rootFound) {
            let source = AnnotationActions.lookupIdentifier(resourceId);
            breadcrumb[source.data.rdfaResource].type = source.data.rdfTypeLabel;
            RDFaUtil.addBreadcrumb(labelTrail, source);
            if (source !== undefined && source.data.parentResource) {
                var val = {id: source.data.parentResource};
                val[source.data.rdfaProperty] = breadcrumb[source.data.rdfaResource];
                breadcrumb[source.data.parentResource] = val;
                delete breadcrumb[source.data.rdfaResource];
                resourceId = source.data.parentResource;
            } else {
                rootFound = true;
            }
        }
        return labelTrail;
    },

    updateStack : function(stack, node) {
        var top = stack[stack.length - 1];
        var position = top.compareDocumentPosition(node);
        while (!(position & window.Node.DOCUMENT_POSITION_CONTAINED_BY)) {
            stack.pop();
            top = stack[stack.length - 1];
            position = top.compareDocumentPosition(node);
        }
    },

    /*
     **************************
     * RDFa resource relation *
     * and index functions    *
     **************************
     */

    labelHasPrefix(label) {
        return (label.indexOf(":") !== -1);
    },

    labelParsePrefix(label, prefixIndex) {
        let prefix = label.substring(0, label.indexOf(":"));
        let term = label.substring(label.indexOf(":") + 1);
        if (prefixIndex.hasOwnProperty(prefix)) {
            return {
                url: prefixIndex[prefix] + term,
                vocabulary: prefixIndex[prefix],
                term: term
            }
        } else {
            //console.log("UNKNOWN PREFIX:", label, prefix);
            return null;
        }
    },

    getTypeURLs(rdfTypeLabels, vocabulary, prefixIndex) {
        if (!rdfTypeLabels) {
            return null;
        }
        return rdfTypeLabels.map((label) => {
            if (RDFaUtil.labelHasPrefix(label)) {
                let labelInfo = RDFaUtil.labelParsePrefix(label, prefixIndex);
                let typeURL = labelInfo.url;
                return typeURL;
            } else if (StringUtil.isURL(label)) {
                return label;
            } else if (vocabulary && label) {
                return vocabulary + label;
            } else if (vocabulary) {
                let message = "Unknown RDF type, not a valid label: " + label;
                //console.log(message);
                return null;
            } else {
                let message = "Unknown RDF type, not a valid URL: " + vocabulary;
                //console.log(message);
                return null;
            }
        });
    },

    getRDFaTypeLabels(node) {
        if (RDFaUtil.hasRDFaType(node)) {
            return node.getAttribute("typeof").split(" ");
        } else {
            return null;
        }
    },

    expandRDFaTerm(rdfaTerm, vocabulary, prefixIndex) {
        if (!rdfaTerm) {
            return null;
        } else if (StringUtil.isURL(rdfaTerm)) {
            return rdfaTerm;
        } else if (RDFaUtil.labelHasPrefix(rdfaTerm)) {
            let labelInfo = RDFaUtil.labelParsePrefix(rdfaTerm, prefixIndex);
            if (labelInfo) {
                return labelInfo.url;
            } else {
                return null;
            }
        } else if (vocabulary && rdfaTerm) {
            // assume rdfaTerm is defined by vocabulary
            return vocabulary + rdfaTerm;
        } else {
            let message = "ERROR - Unknown property: " + rdfaTerm;
            //console.log(message);
            return null;
        }
    },

    expandProperty(propertyLabel, vocabulary, prefixIndex) {
        if (!propertyLabel) {
            return null;
        } else if (RDFaUtil.labelHasPrefix(propertyLabel)) {
            let labelInfo = RDFaUtil.labelParsePrefix(propertyLabel, prefixIndex);
            return labelInfo.url;
        } else if (StringUtil.isURL(propertyLabel)) {
            return propertyLabel;
        } else if (vocabulary && propertyLabel) {
            // assume propertyLabel is defined by vocabulary
            return vocabulary + propertyLabel;
        } else {
            let message = "ERROR - Unknown property: " + propertyLabel;
            //console.log(message);
            return null;
        }
    },

    makeIndexEntry(node, vocabulary, prefixIndex) {
        var rdfTypeLabels ;
        var typeURLs;
        let vocabularies = [];
        rdfTypeLabels = RDFaUtil.getRDFaTypeLabels(node);
        typeURLs = RDFaUtil.getTypeURLs(rdfTypeLabels, vocabulary, prefixIndex);
        return {
            rdfaResource: RDFaUtil.getRDFaResource(node),
            rdfaVocabulary: vocabulary,
            domNode: node,
            rdfTypeLabel: rdfTypeLabels,
            rdfTypeURL: typeURLs,
            rdfaProperty: RDFaUtil.expandProperty(node.getAttribute("property"), vocabulary, prefixIndex),
            text: RDFaUtil.getRDFaTextContent(node)
        };
    },

    hasVocabulary : (node) => {
        let attrs = RDFaUtil.getRDFaAttributes(node);
        return attrs.hasOwnProperty("vocab");
    },

    getVocabulary : (node) => {
        let attrs = RDFaUtil.getRDFaAttributes(node);
        return attrs.vocab;
    },

    listVocabularyURLs : (node, vocabularyURLs) => {
        if (RDFaUtil.hasVocabulary(node)) {
            let vocabulary = RDFaUtil.getVocabulary(node);
            if (!vocabularyURLs.includes(vocabulary)) {
                vocabularyURLs.push(vocabulary);
            }
        }
        DOMUtil.getDescendants(node).forEach((descendant) => {
            RDFaUtil.listVocabularyURLs(descendant, vocabularyURLs);
        });
    },

    indexRDFa : (callback) => {
        var index = {
            resources: {},
            relations: {}
        };
        RDFaUtil.observerNodes.forEach((observerNode) => {
            var prefixIndex = {};
            var vocabulary = null;
            RDFaUtil.indexRDFaResources(index, observerNode, null, vocabulary, prefixIndex);
        });
        //console.log(index);
        return callback(null, index);
    },

    indexRDFaResources(index, node, parentResource, vocabulary, prefixIndex) {
        if (RDFaUtil.hasVocabulary(node)) {
            // update vocabulary if specified
            vocabulary = RDFaUtil.getVocabulary(node);
        }
        if (RDFaUtil.hasRDFaResource(node)) {
            RDFaUtil.indexPrefixes(node, prefixIndex);
            var indexEntry = RDFaUtil.makeIndexEntry(node, vocabulary, prefixIndex);
            if (parentResource) {
                indexEntry.parentResource = parentResource;
            }
            if (!index.resources.hasOwnProperty(indexEntry.rdfaResource)) {
                // only index resource at highest level.
                // lower levels mentions specify only relations
                index.resources[indexEntry.rdfaResource] = indexEntry;
            }
            RDFaUtil.indexRDFaRelations(index.relations, indexEntry);
            // only update parent resource if this node is an RDFa resource
            parentResource = indexEntry.rdfaResource;
        }
        node.childNodes.forEach((childNode) => {
            RDFaUtil.indexRDFaResources(index, childNode, parentResource, vocabulary, prefixIndex);
        });
    },

    indexRDFaRelations(relationIndex, resourceIndexEntry) {
        RDFaUtil.indexParentRelation(relationIndex, resourceIndexEntry);
        RDFaUtil.indexTypeRelation(relationIndex, resourceIndexEntry);
    },

    indexTypeRelation(relationIndex, resourceIndexEntry) {
        if (!resourceIndexEntry.rdfTypeLabel) {
            return false;
        } else {
            resourceIndexEntry.rdfTypeURL.forEach((rdfType) => {
                let relation = {
                    subject: resourceIndexEntry.rdfaResource,
                    predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                    object: rdfType
                }
                relationIndex[relation.subject].push(relation);
            });
        }
    },

    indexParentRelation(relationIndex, resourceIndexEntry) {
        let relation = {
            subject: resourceIndexEntry.parentResource,
            predicate: resourceIndexEntry.rdfaProperty,
            object: resourceIndexEntry.rdfaResource
        }
        if (!relationIndex.hasOwnProperty(relation.subject)) {
            relationIndex[relation.subject] = [];
        }
        if (!relationIndex.hasOwnProperty(relation.object)) {
            relationIndex[relation.object] = [];
        }
        relationIndex[relation.subject].push(relation);
        relationIndex[relation.object].push(relation);
    },

    indexPrefixes(rdfaResourceNode, prefixIndex) {
        if (RDFaUtil.hasRDFaPrefix(rdfaResourceNode)) {
            RDFaUtil.getRDFaPrefix(rdfaResourceNode).forEach((prefix) => {
                prefixIndex[prefix.vocabularyPrefix] = prefix.vocabularyURL;
            });
        }
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
                };
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
        });
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
            var parent = resourceIndex[resource].parentResource;
            while (parent) {
                hasParent[resource] = parent;
                resource = parent;
                parent = resourceIndex[resource].parentResource;
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


};

export default RDFaUtil;

