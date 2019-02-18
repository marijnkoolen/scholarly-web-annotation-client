
"use strict";

import parse from "rdflib/lib/parse";
import Namespace from "rdflib/lib/namespace";
import DataFactory from "rdflib/lib/data-factory";
import rdf from "rdflib";
import DOMUtil from "./DOMUtil.js";
import StringUtil from "./StringUtil.js";
import RDFaUtil from "./RDFaUtil.js";
import VocabularyUtil from "./VocabularyUtil.js";

const FRBRooUtil = {

    store : null,
    RDF : Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#"),
    RDFS : Namespace("http://www.w3.org/2000/01/rdf-schema#"),

    importPredicate : "http://www.w3.org/2002/07/owl#imports",
    baseAnnotationOntologyURL : null,

    newStore() {
        return DataFactory.graph();
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

    loadExternalResources(vocabularyStore, callback) {
        //console.log(vocabularyStore);
        let resourceStore = {};
        resourceStore.relations = FRBRooUtil.getRelations(vocabularyStore);
        //console.log("FRBRooUtil - loadExternalResources resourceStore:", resourceStore);
        FRBRooUtil.checkExternalResources((error, doIndexing, triples) => {
            if (error) {
                console.log(error);
                return callback(error, doIndexing, null);

            } else if (!doIndexing) {
                return callback(null, doIndexing, null);
            } else {
                resourceStore.triples = triples;
                return callback(null, doIndexing, resourceStore);
            }
        });
    },

    checkExternalResources(callback) {
        let externalResourcesRefs = FRBRooUtil.getAlternateLinkRefs();
        var doIndexing = false;
        if (externalResourcesRefs.length === 0) {
            return callback(null, doIndexing, null);
        }
        externalResourcesRefs.forEach((ref) => {
            doIndexing = true;
            let store = FRBRooUtil.newStore();
            FRBRooUtil.readExternalResources(ref.url, (error, externalRelations) => {
                if (error) {
                    console.log("Error reading external resources for URL", ref);
                    console.log(error);
                    return callback(error, doIndexing, store);
                } else {
                    try {
                        FRBRooUtil.storeExternalResources(store, externalRelations, ref.url, ref.mimeType);
                    } catch(error) {
                        console.log("Error storing external resources:", externalRelations);
                        return callback(error, false, null);
                    }
                    return callback(null, doIndexing, store);
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
            console.log("Error reading specified vocabulary:", url);
            console.log(error);
            return callback(error, null);
        });
    },

    storeExternalResources(store, frbrooRelationsString, baseURI, mimeType) {
        if (!store) {
            throw Error("Invalid store given");
        }
        parse(frbrooRelationsString, store, baseURI, mimeType);
    },

    findExternalObjectRelations(resourceStore, resource, relationType) {
        let objectNode = rdf.sym(resource);
        var relationNode = undefined;
        if (relationType) {
            relationNode = rdf.sym(relationType);
        }
        return resourceStore.triples.statementsMatching(undefined, relationNode, objectNode);
    },

    findExternalSubjectRelations(resourceStore, resource, relationType) {
        let subjectNode = rdf.sym(resource);
        var relationNode = undefined;
        if (relationType) {
            relationNode = rdf.sym(relationType);
        }
        return resourceStore.triples.statementsMatching(subjectNode, relationNode, undefined);
    },

    findExternalResources(resourceStore, resources, relationType) {
        var relationNode = undefined;
        if (relationType) {
            relationNode = rdf.sym(relationType);
        }
        try {
            let resourceList = ensureList(resources);
            var relations = [];
            resourceList.forEach((resource) => {
                let node = rdf.sym(resource);
                var subjectRelations = resourceStore.triples.statementsMatching(node, relationNode, undefined);
                var objectRelations = resourceStore.triples.statementsMatching(undefined, relationNode, node);
                relations = relations.concat(subjectRelations, objectRelations);
            });
            return relations;
        } catch (error) {
            console.log(error);
            return null;
        }
    },

    gatherResourceProperties(store, resource) {
        let properties = {rdfaResource: resource};
        let node = rdf.sym(resource);
        var subjectRelations = store.statementsMatching(node, undefined, undefined);
        var objectRelations = store.statementsMatching(undefined, undefined, node);
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

    getResourceType(resourceStore, resource) {
        let node = rdf.sym(resource);
        var triples = resourceStore.triples.statementsMatching(node, FRBRooUtil.RDF('type'), undefined);
        if (triples.length > 0) {
            return triples.map((triple) => { return triple.object.value; });
        }
        return null;
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

    indexExternalResources(resourceStore, resources) {
        let externalResourceIndex = {};
        resources.forEach((resource) => {
            let relation = FRBRooUtil.resourceGetParentRelation(resourceStore, resource);
            //console.log(resource, relation);
            if (relation) {
                externalResourceIndex[resource] = relation;
                let resourceType = FRBRooUtil.getResourceType(resourceStore, resource);
                externalResourceIndex[resource].type = "external";
                externalResourceIndex[resource].resourceType = resourceType;
                if (!externalResourceIndex.hasOwnProperty(relation.parentResource)) {
                    FRBRooUtil.indexExternalParentResource(resourceStore, externalResourceIndex, relation.parentResource);
                }
            }
        });
        return externalResourceIndex;
    },

    indexExternalParentResource(resourceStore, index, resource) {
        //console.log("FRBRooUtil - indexExternalParentResource:", resource);
        if (!FRBRooUtil.isKnownResource(resourceStore, resource)) {
            throw Error ("parentResource does not exist: " + resource);
        }
        let resourceInfo = {resource: resource, type: "external"};
        resourceInfo.resourceType = FRBRooUtil.getResourceType(resourceStore, resource);
        index[resource]
        let relation = FRBRooUtil.resourceGetParentRelation(resourceStore, resource);
        if (relation) {
            resourceInfo.parentResource = relation.parentResource;
            resourceInfo.relation = relation.relation;
            if (!index.hasOwnProperty(relation.parentResource)) {
                FRBRooUtil.indexExternalParentResource(resourceStore, index, relation.parentResource);
            }
        }
        //console.log("FRBRooUtil - indexExternalParentResource:", resource, resourceInfo);
        index[resource] = resourceInfo;
    },

    mapRepresentedResources(resourceStore, resources) {
        if (!resources || !Array.isArray(resources)) {
            throw Error("resources should be an array of resource IDs");
        }
        let representedResourceIndex = {};
        let hasRepresentation = FRBRooUtil.baseAnnotationOntologyURL + "#hasRepresentation";
        let isRepresentationOf = FRBRooUtil.baseAnnotationOntologyURL + "#isRepresentationOf";
        //console.log(hasRepresentation);
        resources.forEach((resource) => {
            //console.log("FRBRooUtil - resource:", resource);
            let subjectRelations = FRBRooUtil.findExternalSubjectRelations(resourceStore, resource, isRepresentationOf);
            let objectRelations = FRBRooUtil.findExternalObjectRelations(resourceStore, resource, hasRepresentation);
            if (subjectRelations.length > 0) {
                FRBRooUtil.addIndexEntry(representedResourceIndex, resource, subjectRelations[0]);
            } else if (objectRelations.length > 0) {
                FRBRooUtil.addIndexEntry(representedResourceIndex, resource, objectRelations[0]);
            }
        });
        return representedResourceIndex;
    },

    addIndexEntry(index, resource, relation) {
        if (typeof resource !== "string") {
            throw Error("resource must be a string");
        } else if (!FRBRooUtil.isRDFTriple(relation)) {
            throw Error("relation must be RDF triple")
        }
        var entry = null;
        if (relation.subject.value === resource) {
            entry = {resource: resource, relation: relation.predicate.value, parentResource: relation.object.value};
        } else if (relation.object.value === resource) {
            entry = {resource: resource, relation: relation.predicate.value, parentResource: relation.subject.value};
        } else {
            throw Error("relation must contain resource as subject or object");
        }
        index[resource] = entry;
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

    readVocabularies(vocabularyURLs, callback) {
        let vocabularies = [];
        if (vocabularyURLs.length === 0) {
            return callback(null, vocabularies);
        }
        let lastURL = vocabularyURLs[vocabularyURLs.length - 1];
        vocabularyURLs.forEach((vocabularyURL) => {
            FRBRooUtil.readVocabulary(vocabularyURL, (error, vocabulary) => {
                if (error) {
                    return callback(error, null);
                } else  {
                    vocabularies.push(vocabulary);
                    if (vocabularyURL === lastURL) {
                        return callback(null, vocabularies);
                    }
                }
            });
        });
    },

    readVocabulary(vocabularyURL, callback) {
        if (vocabularyURL.endsWith("#")) {
            vocabularyURL = vocabularyURL.substring(0, vocabularyURL.length - 1);
        }
        let vocab = {
            url: vocabularyURL,
            data: null
        }
        FRBRooUtil.readExternalResources(vocabularyURL, (error, data) => {
            if (error) {
                return callback(error, null);
            } else {
                vocab.data = data;
                return callback(null, vocab);
            }
        });
    },

    makeVocabularyStore(vocabularies) {
        if (!Array.isArray(vocabularies)) {
            throw Error("cannot make store if no vocabulary data is given");
        }
        let store = {vocabularies: [], triples: DataFactory.graph()};
        vocabularies.forEach((vocabulary) => {
            if (!FRBRooUtil.isValidVocabulary(vocabulary)) {
                throw Error("Invalid vocabulary data! vocabulary should have properties 'url' and 'data'");
            }
            store.vocabularies.push(vocabulary.url);
            parse(vocabulary.data, store.triples, vocabulary.url, undefined);
        })
        return store;
    },

    isValidVocabulary(vocabulary) {
        if (!vocabulary || typeof vocabulary !== "object") {
            return false;
        } else if (!vocabulary.hasOwnProperty("url")) {
            return false;
        } else if (!vocabulary.hasOwnProperty("data")) {
            return false;
        } else {
            return true;
        }
    },

    isValidVocabularyStore(vocabularyStore) {
        if (!vocabularyStore || typeof vocabularyStore !== "object") {
            return false;
        } else if (!vocabularyStore.hasOwnProperty("vocabularies")) {
            return false;
        } else if (!vocabularyStore.hasOwnProperty("triples")) {
            return false;
        } else {
            return true;
        }
    },

    getHierarchicalRelations(vocabularyStore) {
        let relations = {includes: [], isIncludedIn: []};
        let includesProperty = VocabularyUtil.getLabelClass(vocabularyStore.triples, 'includes');
        if (!includesProperty) {
            //console.log("FRBRooUtil - vocabularyStore", vocabularyStore);
            throw Error("Cannot read base includes property");
        }
        let includesSubProperties = VocabularyUtil.getDescendantProperties(vocabularyStore.triples, includesProperty);
        relations.includes.push(includesProperty);
        relations.includes = relations.includes.concat(includesSubProperties);
        relations.includes.forEach((includeProperty) => {
            let inverse = VocabularyUtil.getInverseOfRelation(vocabularyStore.triples, includeProperty);
            if (inverse) {
                relations.isIncludedIn.push(inverse);
            }
        });
        //console.log("includesProperty:", includesProperty);
        //console.log("includesSubProperties:", includesSubProperties);
        //console.log("relations:", relations);
        return relations;
    },

    getRepresentationRelations(vocabularyStore) {
        let relations = {hasRepresentation: [], isRepresentationOf: []};
        let hasRepresentationProperty = VocabularyUtil.getLabelClass(vocabularyStore.triples, 'hasRepresentation');
        let hasRepresentationSubProperties = VocabularyUtil.getDescendantProperties(vocabularyStore.triples, hasRepresentationProperty);
        relations.hasRepresentation.push(hasRepresentationProperty);
        relations.hasRepresentation = relations.hasRepresentation.concat(hasRepresentationSubProperties);
        relations.isRepresentationOf = relations.hasRepresentation.map((includeProperty) => {
            return VocabularyUtil.getInverseOfRelation(vocabularyStore.triples, includeProperty);
        })
        //console.log("includesProperty:", includesProperty);
        //console.log("includesSubProperties:", includesSubProperties);
        //console.log("relations:", relations);
        return relations;
    },

    getRelations(vocabularyStore) {
        let relations = {};
        let hierarchicalRelations = FRBRooUtil.getHierarchicalRelations(vocabularyStore);
        let representationRelations = FRBRooUtil.getRepresentationRelations(vocabularyStore);
        relations.includes = hierarchicalRelations.includes;
        relations.isIncludedIn = hierarchicalRelations.isIncludedIn;
        relations.hasRepresentation = representationRelations.hasRepresentation;
        relations.isRepresentationOf = representationRelations.isRepresentationOf;
        return relations;
    },

    getImports(vocabularyStore) {
        if (!FRBRooUtil.isValidVocabularyStore(vocabularyStore)) {
            throw Error("Invalid vocabularyStore given");
        }
        if (!FRBRooUtil.baseAnnotationOntologyURL) {
            console.log("No baseAnnotationOntologyURL set!");
        }
        let imports = [];
        vocabularyStore.vocabularies.forEach((vocabularyURL) => {
            let vocabularyNode = rdf.sym(vocabularyURL);
            let importNode = rdf.sym(FRBRooUtil.importPredicate);
            //console.log("vocabularyNode:", vocabularyNode);
            //console.log("importNode:", importNode);
            let triples = vocabularyStore.triples.each(vocabularyNode, importNode, undefined);
            //console.log("triples:", triples);
            if (vocabularyURL === FRBRooUtil.baseAnnotationOntologyURL) {
                // don't import beyond the base annotation ontology
                return;
            }
            triples.forEach((triple) => {
                if (!vocabularyStore.vocabularies.includes(triple.value)) {
                    imports.push(triple.value);
                }
            })
        });
        return imports;
    },

    updateVocabularyStore(vocabularyStore, vocabularies) {
        if (!FRBRooUtil.isValidVocabularyStore(vocabularyStore)) {
            throw Error("Invalid vocabularyStore given");
        } else if (!vocabularies || !Array.isArray(vocabularies)) {
            throw Error("vocabularies must be an Array of vocabulary objects");
        } else {
            vocabularies.forEach((vocabulary) => {
                if (!FRBRooUtil.isValidVocabulary(vocabulary)) {
                    throw Error("Invalid vocabulary data! vocabulary should have properties 'url' and 'data'");
                }
            });
        }
        vocabularies.forEach((vocabulary) => {
            vocabularyStore.vocabularies.push(vocabulary.url);
            parse(vocabulary.data, vocabularyStore.triples, vocabulary.url, undefined);
        });
    },

    importAndUpdate(vocabularyStore, callback) {
        if (!FRBRooUtil.isValidVocabularyStore(vocabularyStore)) {
            throw Error("Invalid vocabularyStore given");
        }
        let imports = FRBRooUtil.getImports(vocabularyStore);
        //console.log("imports:", imports);
        if (imports.length > 0) {
            FRBRooUtil.readVocabularies(imports, (error, vocabularies) => {
                if (error) {
                    return callback(error, false);
                }
                FRBRooUtil.updateVocabularyStore(vocabularyStore, vocabularies);
                FRBRooUtil.importAndUpdate(vocabularyStore, (error, done) => {
                    if (error) {
                        console.log(error);
                        return callback(error, false);
                    } else {
                        return callback(null, done);
                    }
                });
            });
        } else {
            return callback(null, true);
        }
    },

    loadVocabularies(callback) {
        let vocabularyURLs = [];
        let vocabData = [];
        RDFaUtil.listVocabularyURLs(document, vocabularyURLs);
        // read initial vocabularies
        //console.log("vocabularyURLs:", vocabularyURLs);
        if (vocabularyURLs.length === 0) {
            // make an empty store if there are no vocabularies
            let vocabularyStore = FRBRooUtil.makeVocabularyStore([]);
            return callback(null, null);
        }
        FRBRooUtil.readVocabularies(vocabularyURLs, (error, vocabularies) => {
            if (error) {
                return callback(error, null);
            } else {
                // make vocabulary store
                //console.log("vocabularies:", vocabularies);
                let vocabularyStore = FRBRooUtil.makeVocabularyStore(vocabularies);
                //console.log("vocabularyStore:", vocabularyStore);
                // iterate: 1) get imports, 2) update store
                FRBRooUtil.importAndUpdate(vocabularyStore, (error, updatesDone) => {
                    if (error) {
                        return callback(error, vocabularyStore);
                    } else {
                        return callback(null, vocabularyStore);
                    }
                });
            }
        });
    },

    determineResourceHierarchy(resourceStore, resource) {
        if (!resourceStore) {
            throw Error("Invalid resourceStore");
        } else if (!FRBRooUtil.isKnownResource(resourceStore, resource)) {
            throw Error("Unknown resource");
        }
        let parentRelation = FRBRooUtil.resourceGetParentRelation(resourceStore, resource);
        if (parentRelation) {
            return parentRelation;
        } else {
            return {resource: resource};
        }
    },

    resourceGetParentRelation(resourceStore, resource) {
        // assumption is that in external resources store, each resource has a single parent.
        var relation = null;
        relation = FRBRooUtil.resourceGetParentSubjectRelation(resourceStore, resource);
        if (relation) {
            return relation;
        }
        relation = FRBRooUtil.resourceGetParentObjectRelation(resourceStore, resource);
        return relation;
    },

    resourceHasParent(resourceStore, resource) {
        if (!FRBRooUtil.isKnownResource(resourceStore, resource)) {
            throw Error("Unknown resource");
        }
        let relation = FRBRooUtil.resourceGetParentRelation(resourceStore, resource)
        if (relation) {
            return true;
        } else {
            return false;
        }
    },

    resourceGetParentSubjectRelation(resourceStore, resource) {
        let resourceNode = rdf.sym(resource);
        let parentRelation = null;
        resourceStore.relations.includes.some((relation) => {
            let relationNode = rdf.sym(relation);
            let subject = resourceStore.triples.any(undefined, relationNode, resourceNode);
            if (subject) {
                parentRelation = {resource: resource, parentResource: subject.value, relation: relation};
            }
        });
        return parentRelation;
    },

    resourceGetParentObjectRelation(resourceStore, resource) {
        let resourceNode = rdf.sym(resource);
        let parentRelation = null;
        resourceStore.relations.isIncludedIn.some((relation) => {
            let relationNode = rdf.sym(relation);
            let object = resourceStore.triples.any(resourceNode, relationNode, undefined);
            if (object) {
                parentRelation = {resource: resource, parentResource: object.value, relation: relation};
            }
        });
        return parentRelation;
    },

    isKnownResource(resourceStore, resource) {
        if (!resourceStore) {
            throw Error("Invalid resourceStore");
        } else if (!resource) {
            throw Error("Invalid resource");
        }
        let resourceNode = rdf.sym(resource);
        var triple = resourceStore.triples.any(resourceNode, undefined, undefined);
        if (!triple) {
            triple = resourceStore.triples.any(undefined, undefined, resourceNode);
        }
        return triple !== undefined;
    },

    addBreadcrumb(labelTrail, source) {
        labelTrail.unshift({
            id: source.data.rdfaResource,
            property: source.data.rdfaProperty,
            type: source.data.rdfaTypeLabel
        });
    },

    createBreadcrumbTrail(externalResourceIndex, resourceId) {
        var rootFound = false;
        var labelTrail = [];
        while (!rootFound) {
            if (!externalResourceIndex.hasOwnProperty(resourceId)) {
                throw Error("Invalid resource");
            }
            let data = externalResourceIndex[resourceId];
            var breadcrumb = {};
            breadcrumb.type = data.resourceType;
            breadcrumb.id = resourceId;
            breadcrumb.property = data.relation;
            labelTrail.unshift(breadcrumb);
            if (resourceId !== undefined && data.hasOwnProperty("parentResource")) {
                resourceId = data.parentResource;
            } else {
                rootFound = true;
            }
        }
        return labelTrail;
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

var invalidVocabularyStore = (vocabularyStore) => {
    throw Error("Invalid vocabularyStore given");
}

export default FRBRooUtil;
