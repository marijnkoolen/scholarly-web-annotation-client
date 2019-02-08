
"use strict";

import parse from "rdflib/lib/parse";
import Namespace from "rdflib/lib/namespace";
import DataFactory from "rdflib/lib/data-factory";
import rdf from "rdflib";
import DOMUtil from "./DOMUtil.js";
import StringUtil from "./StringUtil.js";
import RDFaUtil from "./RDFaUtil.js";

const FRBRooUtil = {

    store : null,
    RDF : Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#"),
    RDFS : Namespace("http://www.w3.org/2000/01/rdf-schema#"),

    newStore() {
        const store = DataFactory.graph();
        FRBRooUtil.store = store;
    },

    getAlternateLinkRefs() {
        let alternateLinks = FRBRooUtil.getAlternateLinks();
        return alternateLinks.map((link) => { return {url: link.href, mimeType: link.type }});
    },

    getAlternateLinks() {
        let linkElements = document.getElementsByTagName("link");
        return Array.from(linkElements).filter(FRBRooUtil.isAlternateLink);
    },

    isAlternateLink(node) {
        if (node.tagName !== "LINK") {
            return false;
        } else if (!node.getAttribute("rel") || node.getAttribute("rel") !== "alternate") {
            return false;
        } else if (!node.getAttribute("href")) {
            return false;
        } else {
            return true;
        }
    },

    checkExternalResources(callback) {
        let externalResourcesRefs = FRBRooUtil.getAlternateLinkRefs();
        var doIndexing = false;
        if (externalResourcesRefs.length === 0) {
            return callback(null, doIndexing);
        }
        externalResourcesRefs.forEach((ref) => {
            doIndexing = true;
            FRBRooUtil.readExternalResources(ref.url, (error, externalRelations) => {
                if (error) {
                    return callback(error, doIndexing);
                } else {
                    FRBRooUtil.storeExternalResources(externalRelations, ref.url, ref.mimeType);
                    return callback(null, doIndexing);
                }
            });
        });
    },

    readExternalResources(url, callback) {
        fetch(url, {
            method: "GET"
        }).then((response) => {
            return response.text();
        }).then((relationsData) => {
            return callback(null, relationsData);
        }).catch((error) => {
            return callback(error, null);
        });
    },

    storeExternalResources(frbrooRelationsString, baseURI, mimeType) {
        if (!FRBRooUtil.store) {
            FRBRooUtil.newStore();
        }
        parse(frbrooRelationsString, FRBRooUtil.store, baseURI, mimeType);
    },

    findExternalObjectRelations(resource, relationType) {
        let objectNode = rdf.sym(resource);
        var relationNode = undefined;
        if (relationType) {
            relationNode = rdf.sym(relationType);
        }
        return FRBRooUtil.store.statementsMatching(undefined, relationNode, objectNode);
    },

    findExternalSubjectRelations(resource, relationType) {
        let subjectNode = rdf.sym(resource);
        var relationNode = undefined;
        if (relationType) {
            relationNode = rdf.sym(relationType);
        }
        return FRBRooUtil.store.statementsMatching(subjectNode, relationNode, undefined);
    },

    findExternalResources(resources, relationType) {
        var relationNode = undefined;
        if (relationType) {
            relationNode = rdf.sym(relationType);
        }
        try {
            let resourceList = ensureList(resources);
            var relations = [];
            resourceList.forEach((resource) => {
                let node = rdf.sym(resource);
                var subjectRelations = FRBRooUtil.store.statementsMatching(node, relationNode, undefined);
                var objectRelations = FRBRooUtil.store.statementsMatching(undefined, relationNode, node);
                relations = relations.concat(subjectRelations, objectRelations);
            });
            return relations;
        } catch (error) {
            console.log(error);
            return null;
        }
    },

    gatherResourceProperties(resource) {
        let properties = {rdfaResource: resource};
        let node = rdf.sym(resource);
        var subjectRelations = FRBRooUtil.store.statementsMatching(node, undefined, undefined);
        var objectRelations = FRBRooUtil.store.statementsMatching(undefined, undefined, node);
        subjectRelations.forEach((relation) => {
            //console.log("resource:", resource);
            //console.log("\tpredicate:", relation.predicate.value);
            //console.log("\tobject:", relation.object.value);
            if (relation.predicate.value === FRBRooUtil.RDF('type').value) {
                FRBRooUtil.addResourceTypeProperty(properties, relation.object.value);
            }
        })
        if (subjectRelations.length + objectRelations.length === 0) {
            return null;
        } else {
            return properties;
        }
    },

    addResourceTypeProperty(properties, rdfaType) {
        if (!rdfaType) {
            return true;
        } else if (properties.hasOwnProperty("rdfaType") === false) {
            properties.rdfaType = rdfaType;
            return true;
        } else if (typeof properties.rdfaType === "string") {
            properties.rdfaType = [properties.rdfaType, rdfaType];
        } else if (Array.isArray(properties.rdfaType)){
            properties.rdfaType.push(rdfaType);
        } else {
            throw Error("properties.rdfaType should be string or array");
        }
    },

    indexExternalResources(resources, relation) {
        let relatedResourceIndex = {};
        resources.forEach((resource) => {
            let relations = FRBRooUtil.findExternalResources(resource, relation);
            relations.forEach((relation) => {
                FRBRooUtil.addIndexEntry(relatedResourceIndex, resource, relation);
            });
        });
        return relatedResourceIndex;
    },

    indexRepresentedResources(resources) {
        let representedResourceIndex = {};
        let hasRepresentation = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#hasRepresentation";
        let isRepresentationOf = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#isRepresentationOf";
        resources.forEach((resource) => {
            let representedObjects = FRBRooUtil.findExternalSubjectRelations(resource, isRepresentationOf);
            let representedSubjects = FRBRooUtil.findExternalObjectRelations(resource, hasRepresentation);
            representedObjects.forEach((relation) => {
                FRBRooUtil.addIndexEntry(representedResourceIndex, resource, relation);
            });
            representedSubjects.forEach((relation) => {
                FRBRooUtil.addIndexEntry(representedResourceIndex, resource, relation);
            });
        });
        return representedResourceIndex;
    },

    addIndexEntry(index, resource, relation) {
        if (typeof resource !== "string") {
            throw Error("resource must be a string");
        } else if (!FRBRooUtil.isRDFTriple(relation)) {
            throw Error("relation must be RDF triple")
        }
        if (!index.hasOwnProperty(resource)) {
            index[resource] = [];
        }
        var entry = null;
        if (relation.subject.value === resource) {
            entry = {resource: resource, relation: relation.predicate.value, relatedResource: relation.object.value};
        } else if (relation.object.value === resource) {
            entry = {resource: resource, relation: relation.predicate.value, relatedResource: relation.subject.value};
        } else {
            throw Error("relation must contain resource as subject or object");
        }
        index[resource].push(entry)
        return true;
    },

    isRDFTriple(triple) {
        if (!triple || typeof triple !== "object") {
            return false;
        } else if (!triple.hasOwnProperty("subject") || !triple.subject.hasOwnProperty("value")) {
            return false;
        } else if (!triple.hasOwnProperty("predicate") || !triple.subject.hasOwnProperty("value")) {
            return false;
        } else if (!triple.hasOwnProperty("object") || !triple.subject.hasOwnProperty("value")) {
            return false;
        } else {
            return true;
        }
    },
}

var ensureList = (resources) => {
    if (typeof(resources) === "string" || resources instanceof String) {
        return [resources];
    } else if (Array.isArray(resources)) {
        return resources;
    } else {
        throw Error("resources should be string or list of strings");
    }
}

export default FRBRooUtil;
