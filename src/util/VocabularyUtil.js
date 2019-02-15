
"use strict";

import Fetcher from "rdflib/lib/fetcher";
import Namespace from "rdflib/lib/namespace";
import DataFactory from "rdflib/lib/data-factory";
import rdf from "rdflib";

const VocabularyUtil = {

    //rdf : rdf,
    rdfStore : null,
    fetcher : null,
    OWL : Namespace("http://www.w3.org/2002/07/owl#"),
    RDF : Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#"),
    RDFS : Namespace("http://www.w3.org/2000/01/rdf-schema#"),

    newStore : () => {
        const store = DataFactory.graph();
        VocabularyUtil.fetcher = new Fetcher(store, 500);
        return store;
    },

    prefixes : {
        // common prefixes for ease of reference
        rdfs: "http://www.w3.org/2000/01/rdf-schema#",
        owl: "http://www.w3.org/2002/07/owl#"
    },

    importPredicate : "http://www.w3.org/2002/07/owl#imports",

    readVocabulariesFromURL : (vocabularyURLs, callback) => {
        vocabularyURLs.forEach((vocabularyURL, index) => {
            VocabularyUtil.readVocabularyFromURL(vocabularyURL, (error) => {
                if (error) {
                    window.alert("Error reading vocabulary from " + vocabularyURLi + "\n" + error.toString());
                    return callback(error);
                }
                if (index+1 == vocabularyURLs.length)
                    return callback(null);
            })
        });
    },

    readVocabularyFromURL : (vocabularyURL, callback) => {
        VocabularyUtil.fetcher.nowOrWhenFetched(vocabularyURL, undefined, (ok, body) => {
            if (!ok) {
                return callback(body, null);
            }
            else {
                return callback(null, body);
            }
        });
    },

    toString : function(literal) {
        return literal.replace(/['"]/g, "");
    },

    toStrings : function(literals) {
        return literals.map(function(literal) {
            return VocabularyUtil.toString(literal);
        });
    },

    getLabelClass : (store, classLabel) => {
        let predicate = VocabularyUtil.RDFS('label');
        let subject = store.any(undefined, predicate, classLabel);
        if (!subject) {
            return null;
        } else {
            return subject.value;
        }
    },

    getClassLabel : (store, classURI) => {
        let classNode = rdf.sym(classURI);
        let predicate = VocabularyUtil.RDFS('label');
        let object = store.any(classNode, predicate, undefined);
        if (!object) {
            return null;
        } else {
            return object.value;
        }
    },

    getInverseOfRelation : (rdfStore, propertyURI) => {
        let predicate = VocabularyUtil.OWL('inverseOf');
        let propertyNode = rdf.sym(propertyURI);
        let object = rdfStore.any(undefined, predicate, propertyNode);
        if (!object) {
            return null;
        } else {
            return object.value;
        }
    },

    getSubProperties : (rdfStore, propertyURI) => {
        let predicate = VocabularyUtil.RDFS('subPropertyOf');
        let propertyNode = rdf.sym(propertyURI);
        let objects = rdfStore.each(undefined, predicate, propertyNode);
        return objects.map((object) => { return object.value; });
    },

    getDescendantProperties : (rdfStore, propertyURI) => {
        if (!propertyURI) {
            throw Error("propertyURI undefined!");
        }
        let predicate = VocabularyUtil.RDFS('subPropertyOf');
        let propertyNode = rdf.sym(propertyURI);
        let objects = rdfStore.each(undefined, predicate, propertyNode);
        let descendantURIs = objects.map((object) => { return object.value; });
        descendantURIs.forEach((descendantURI) => {
            let deeperDescendants = VocabularyUtil.getDescendantProperties(rdfStore, descendantURI);
            descendantURIs = descendantURIs.concat(deeperDescendants);
        });
        return descendantURIs;
    },

    getSubClasses : function(rdfStore, classURI) {
        if (!classURI) {
            throw Error("classURI undefined!");
        }
        //let predicate = VocabularyUtil.expand("rdfs:subClassOf");
        let predicate = VocabularyUtil.RDFS('subClassOf');
        let classNode = rdf.sym(classURI);
        let objects = rdfStore.each(undefined, predicate, classNode);
        return objects.map((object) => { return object.value; });
    },

    getDescendantClasses : function(rdfStore, classURI) {
        if (!classURI) {
            throw Error("classURI undefined!");
        }
        //let predicate = VocabularyUtil.expand("rdfs:subClassOf");
        let predicate = VocabularyUtil.RDFS('subClassOf');
        let classNode = rdf.sym(classURI);
        let objects = rdfStore.each(undefined, predicate, classNode);
        let descendantURIs = objects.map((object) => { return object.value; });
        descendantURIs.forEach((descendantURI) => {
            let deeperDescendants = VocabularyUtil.getDescendantClasses(rdfStore, descendantURI);
            descendantURIs = descendantURIs.concat(deeperDescendants);
        });
        return descendantURIs;
    },

    getSuperClass : function(classURI) {
        let predicate = VocabularyUtil.expand("rdfs:subClassOf");
        let object = VocabularyUtil.rdfStore.any(classURI, predicate, undefined);
        if (!object) {
            return null;
        } else {
            return object.value;
        }
    },

    getSuperClasses : function(className) {
        var superClasses = [];
        var superClass = VocabularyUtil.getSuperClass(className);
        while (superClass) {
            superClasses.push(superClass);
            superClass = VocabularyUtil.getSuperClass(className);
        }
        return superClasses;
    },

    expand : function(prefixedName) {
        let prefix = prefixedName.split(":")[0];
        let name = prefixedName.split(":")[1];
        return VocabularyUtil.prefixes[prefix] + name;
    }
};

export default VocabularyUtil;
