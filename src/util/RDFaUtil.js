
"use strict";

import VocabularyUtil from "./VocabularyUtil.js";
import DOMUtil from "./DOMUtil.js";
import AnnotationActions from "./../flux/AnnotationActions.js";


// RDFa property names
//let RDFaAttrs = ["about", "content", "datatype", "href", "property", "rel", "resource", "rev", "src", "typeof", "vocab"];
let RDFaAttrs = ["about", "prefix", "property", "resource", "typeof", "vocab"];
VocabularyUtil.newStore();

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
                    let vocURI = parts[i+1];
                    prefix.push({vocabularyPrefix: vocPrefix, vocabularyURI: vocURI});
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
            type: source.data.rdfaTypeLabel
        });
    },

    createBreadcrumbTrail(resourceId) {
        var rootFound = false;
        var breadcrumb = {};
        var labelTrail = [];
        breadcrumb[resourceId] = {id: resourceId};
        while (!rootFound) {
            let source = AnnotationActions.lookupIdentifier(resourceId);
            breadcrumb[source.data.rdfaResource].type = source.data.rdfaTypeLabel;
            RDFaUtil.addBreadcrumb(labelTrail, source);
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
                uri: prefixIndex[prefix] + term,
                vocabulary: prefixIndex[prefix],
                term: term
            }
        } else {
            console.log("UNKNOWN PREFIX:", label, prefix);
            return null;
        }
    },

    getTypeURIs(rdfaTypeLabels, prefixIndex, vocabularies) {
        if (!rdfaTypeLabels) {
            return null;
        }
        return rdfaTypeLabels.map((label) => {
            if (RDFaUtil.labelHasPrefix(label)) {
                let labelInfo = RDFaUtil.labelParsePrefix(label, prefixIndex);
                let typeURI = labelInfo.uri;
                vocabularies.push(labelInfo.vocabulary);
                return typeURI;
            } else if (VocabularyUtil.getLabelClass(label)){
                let typeURI = VocabularyUtil.getLabelClass(label);
                let vocabulary = typeURI.substr(0, typeURI.indexOf("#")+1);
                if (!vocabularies.includes(vocabulary)) {
                    vocabularies.push(vocabulary);
                }
                return typeURI;
            } else {
                console.log("ERROR - unknown RDFa type:", label);
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

    expandProperty(propertyLabel, prefixIndex) {
        if (!propertyLabel) {
            return null;
        } else if (RDFaUtil.labelHasPrefix(propertyLabel)) {
            let labelInfo = RDFaUtil.labelParsePrefix(propertyLabel, prefixIndex);
            return labelInfo.uri;
        } else {
            let propertyURI = VocabularyUtil.getLabelClass(propertyLabel);
            if (!propertyURI) {
                console.log("ERROR - Unknown property:", propertyLabel);
            }
            return propertyURI;
        }
    },

    makeIndexEntry(node, prefixIndex) {
        var rdfaTypeLabels ;
        var typeURIs;
        let vocabularies = [];
        rdfaTypeLabels = RDFaUtil.getRDFaTypeLabels(node);
        typeURIs = RDFaUtil.getTypeURIs(rdfaTypeLabels, prefixIndex, vocabularies);
        return {
            rdfaResource: RDFaUtil.getRDFaResource(node),
            rdfaVocabulary: vocabularies,
            domNode: node,
            rdfaTypeLabel: rdfaTypeLabels,
            rdfaTypeURI: typeURIs,
            rdfaProperty: RDFaUtil.expandProperty(node.getAttribute("property"), prefixIndex),
            text: RDFaUtil.getRDFaTextContent(node)
        };
    },

    hasVocabulary : (node) => {
        let attrs = RDFaUtil.getRDFaAttributes(node);
        return attrs.hasOwnProperty("vocab");
    },

    listVocabularies : (node, vocabularies) => {
        if (RDFaUtil.hasVocabulary(node)) {
            let attrs = RDFaUtil.getRDFaAttributes(node);
            if (!vocabularies.includes(attrs.vocab)) {
                vocabularies.push(attrs.vocab);
            }
        }
        DOMUtil.getDescendants(node).forEach((descendant) => {
            RDFaUtil.listVocabularies(descendant, vocabularies);
        });
    },

    indexRDFa : (callback) => {
        var index = {
            resources: {},
            relations: {}
        };
        var vocabularies = [];
        RDFaUtil.listVocabularies(document, vocabularies);
        VocabularyUtil.readVocabularies(vocabularies, (error) => {
            if (error) {
                return callback(error, null);
            }
            RDFaUtil.observerNodes.forEach((observerNode) => {
                RDFaUtil.getTopRDFaNodes(observerNode).forEach(function(rdfaResourceNode) {
                    var prefixIndex = {};
                    RDFaUtil.indexPrefixes(rdfaResourceNode, prefixIndex);
                    var topAttrs = RDFaUtil.getRDFaAttributes(rdfaResourceNode);
                    var indexEntry = RDFaUtil.makeIndexEntry(rdfaResourceNode, prefixIndex);
                    index.resources[indexEntry.rdfaResource] = indexEntry;
                    RDFaUtil.indexRDFaResources(index, rdfaResourceNode, indexEntry.rdfaResource, prefixIndex);
                });
            });
            return callback(null, index);
        });
    },

    indexRDFaResources(index, node, parentResource, prefixIndex) {
        node.childNodes.forEach((childNode) => {
            if (RDFaUtil.hasRDFaResource(childNode)) {
                RDFaUtil.indexPrefixes(childNode, prefixIndex);
                var indexEntry = RDFaUtil.makeIndexEntry(childNode, prefixIndex);
                indexEntry.rdfaParent = parentResource;
                if (!index.resources.hasOwnProperty(indexEntry.rdfaResource)) {
                    index.resources[indexEntry.rdfaResource] = indexEntry;
                }
                RDFaUtil.indexRDFaRelations(index.relations, indexEntry);
                RDFaUtil.indexRDFaResources(index, childNode, indexEntry.rdfaResource, prefixIndex);
            } else {
                RDFaUtil.indexRDFaResources(index, childNode, parentResource, prefixIndex);
            }
        });
    },

    indexRDFaRelations(relationIndex, resourceIndexEntry) {
        RDFaUtil.indexParentRelation(relationIndex, resourceIndexEntry);
        RDFaUtil.indexTypeRelation(relationIndex, resourceIndexEntry);
    },

    indexTypeRelation(relationIndex, resourceIndexEntry) {
        if (!resourceIndexEntry.rdfaTypeLabel) {
            return false;
        } else {
            resourceIndexEntry.rdfaTypeURI.forEach((rdfaType) => {
                let relation = {
                    subject: resourceIndexEntry.rdfaResource,
                    predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                    object: rdfaType
                }
                relationIndex[relation.subject].push(relation);
            });
        }
    },

    indexParentRelation(relationIndex, resourceIndexEntry) {
        let relation = {
            subject: resourceIndexEntry.rdfaParent,
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
                prefixIndex[prefix.vocabularyPrefix] = prefix.vocabularyURI;
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


};

export default RDFaUtil;

