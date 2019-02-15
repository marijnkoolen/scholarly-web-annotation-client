
"use strict";

require("isomorphic-fetch");
const chai = require("chai");
const chaiFetch = require("chai-fetch");
const mockServer = require("mockttp").getLocal();
chai.use(chaiFetch);
const expect = require("chai").expect;
require("es6-promise").polyfill();
const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
import RDFaUtil from "../util/RDFaUtil.js";
import FRBRooUtil from "../util/FRBRooUtil.js";
const $rdf = require("rdflib");

let localURL = "http://localhost:3001/";
var loadPage = (htmlSource) => {
    const jsdomConfig = {url: localURL}
    let dom = new JSDOM(htmlSource, jsdomConfig);
    global.document = dom.window.document;
    global.window = dom.window;
}

var loadRDFaPage = () => {
    let vocabulary = "http://localhost:3001/vangoghannotationontology.ttl#";
    let htmlSource = `
    <html>
        <head>
            <link rel="stylesheet" type="text/css" href="frbroo.css">
            <link rel="alternate" type="text/n3" href="frbroo_alternate.ttl">
        </head>
        <body class=\"annotation-target-observer\" vocab=${vocabulary}>
            <div typeof="EditionText" resource="urn:vangogh/letter=001:repr=original">Hello</div>
            <div typeof="EditionTranscript" resource="urn:vangogh/letter=001:repr=transcript">Goodbye</div>
        </body>
    </html>`;
    loadPage(htmlSource);
    let observerNodes = document.getElementsByClassName("annotation-target-observer");
    RDFaUtil.setObserverNodes(observerNodes);
}

var loadPlainPage = () => {
    let vocabulary = "http://localhost:3001/vangoghannotationontology.ttl#";
    let htmlSource = `
    <html>
        <head>
            <link rel="stylesheet" type="text/css" href="frbroo.css">
        </head>
        <body class=\"annotation-target-observer\">
            <div>Hello</div>
            <div>Goodbye</div>
        </body>
    </html>`;
    loadPage(htmlSource);
}

let frbrooRelationsString = `
@prefix hi: <http://localhost:3001/editionannotationontology.ttl#> .
@prefix vg: <http://localhost:3001/vangoghannotationontology.ttl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix ecrm: <http://erlangen-crm.org/current/> .

<urn:vangogh/letter=001> rdf:type vg:Letter.
<urn:vangogh/letter=001> hi:hasRepresentation <urn:vangogh/letter=001:repr=original>.
<urn:vangogh/letter=001:para=1> rdf:type vg:ParagraphInLetter.
<urn:vangogh/letter=001:para=1> hi:hasRepresentation <urn:vangogh/letter=001:para=1:repr=original>.
<urn:vangogh/letter=001> hi:hasWorkPart <urn:vangogh/letter=001:para=1>.
`;

let editionOntologyString = `
@prefix hi: <http://localhost:3001/editionannotationontology.ttl#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix ecrm: <http://erlangen-crm.org/current/> .
@prefix efrbroo: <http://erlangen-crm.org/efrbroo/> .
@base <http://localhost:3001/editionannotationontology.ttl> .
<http://localhost:3001/editionannotationontology.ttl> rdf:type owl:Ontology .

<http://localhost:3001/editionannotationontology.ttl>  owl:imports  <https://raw.githubusercontent.com/erlangen-crm/efrbroo/releases/efrbroo_20160715.owl>.

hi:AnnotatableThing rdf:type owl:Class ;
    rdfs:label "AnnotatableThing" ;
    rdfs:subClassOf ecrm:E71_Man-Made_Thing ;
    rdfs:comment "E71 can be either E24_Physical_Man-Made_Thing (i.e. documents) or E28_Conceptual_Object (i.e. works)" .
hi:EditableThing rdf:type owl:Class ;
    rdfs:label "EditableThing" ;
    rdfs:subClassOf hi:AnnotatableThing ;
    rdfs:comment "Realm of things that can be or have been edited" .
hi:EditionThing rdf:type owl:Class ;
    rdfs:label "EditionThing" ;
    rdfs:subClassOf hi:AnnotatableThing ;
    rdfs:comment "Realm of things that result from editing" .

hi:includes rdf:type owl:ObjectProperty ;
    rdfs:domain hi:AnnotatableThing;
    rdfs:range hi:AnnotatableThing;
    rdfs:label "includes" ;
    rdfs:comment "Superproperty for all relations that are considered hierarchical".

hi:Work rdf:type owl:Class ;
    rdfs:label "Work" ;
    rdfs:subClassOf efrbroo:F1_Work ;
    rdfs:subClassOf hi:EditableThing ;
    rdfs:comment "Works that are editid" .
hi:PartOfWork rdf:type owl:Class ;
    rdfs:label "PartOfWork" ;
    rdfs:subClassOf hi:EditableThing ;
    rdfs:subClassOf ecrm:E89_Propositional_Object ;
    rdfs:comment "Consists of parts of works that are edited" .
hi:WorkOrPartOfWork rdf:type owl:Class ;
    rdfs:label "WorkOrPartOfWork" ;
    owl:unionOf (hi:Work hi:PartOfWork);
    rdfs:comment "Consists of works that are edited and parts of them" .

hi:hasWorkPart rdf:type owl:ObjectProperty ;
    rdfs:domain hi:Work;
    rdfs:range hi:PartOfWork;
    rdfs:label "hasWorkPart" ;
    rdfs:comment "Describes relation between Works and parts of Works";
    rdfs:subPropertyOf hi:includes.
hi:isWorkPartOf rdf:type owl:ObjectProperty ;
    rdfs:domain hi:PartOfWork;
    rdfs:range hi:Work;
    rdfs:label "isWorkPartOf" ;
    rdfs:comment "Describes relation between parts of Works and Works";
    owl:inverseOf hi:hasWorkPart.


hi:EditionText rdf:type owl:Class ;
    rdfs:label "EditionText" ;
    rdfs:subClassOf efrbroo:F2_Expression ;
    rdfs:subClassOf hi:EditionThing ;
    rdfs:comment "Edition reading text" .

hi:hasRepresentation rdf:type owl:ObjectProperty ;
    rdfs:domain hi:EditableThing;
    rdfs:range hi:EditionThing;
    rdfs:label "hasRepresentation"  ;
    rdfs:comment "Connects an editable thing (doc, work, ptf) to its representation in the edition" ;
    rdfs:subPropertyOf hi:includes.
hi:isRepresentationOf rdf:type owl:ObjectProperty ;
    rdfs:domain hi:EditionThing;
    rdfs:range hi:EditableThing;
    rdfs:label "isRepresentationOf"  ;
    rdfs:comment "Connects a representation to what it represents";
    owl:inverseOf hi:hasRepresentation.

`;

let vangoghOntologyString = `
@prefix hi: <http://localhost:3001/editionannotationontology.ttl#> .
@prefix vg: <http://localhost:3001/vangoghannotationontology.ttl#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@base <http://localhost:3001/vangoghannotationontology.ttl> .
<http://localhost:3001/vangoghannotationontology.ttl> rdf:type owl:Ontology .

<http://localhost:3001/vangoghannotationontology.ttl>  owl:imports  <http://localhost:3001/editionannotationontology.ttl>.

vg:Letter rdf:type owl:Class ;
    rdfs:label "Letter" ;
    rdfs:subClassOf hi:Work.
vg:ParagraphInLetter rdf:type owl:Class ;
    rdfs:label "ParagraphInLetter" ;
    rdfs:subClassOf hi:PartOfWork.
`;



describe("FRBRooUtil", () => {

    before(() => {
        FRBRooUtil.baseAnnotationOntologyURL = "http://localhost:3001/editionannotationontology.ttl";
    });

    describe("readVocabularies", () => {


        beforeEach((done) => {
            mockServer.start((3001));
            done();
        });

        afterEach((done) => {
            mockServer.stop();
            done();
        });

        it("should return empty array if no vocabularies found", (done) => {
            loadPlainPage();
            let vocabularies = [];
            FRBRooUtil.readVocabularies(vocabularies, (error, vocabData) => {
                expect(error).to.equal(null);
                expect(vocabData.length).to.equal(0);
                done();
            });
        });

        it("should find specified vocabulary url", (done) => {
            loadRDFaPage();
            let vocabularyURLs = [];
            RDFaUtil.listVocabularyURLs(document, vocabularyURLs);
            let url = "http://localhost:3001/vangoghannotationontology.ttl";
            mockServer.get("/vangoghannotationontology.ttl").thenReply(200, vangoghOntologyString).then(() => {
                FRBRooUtil.readVocabularies(vocabularyURLs, (error, vocabData) => {
                    expect(vocabData.length).to.equal(1);
                    expect(vocabData[0].hasOwnProperty("url")).to.equal(true);
                    expect(vocabData[0].url).to.equal(url);
                    expect(vocabData[0].data).to.equal(vangoghOntologyString);
                    done();
                });
            });
        });
    });

    describe("readVocabulary", () => {

        beforeEach((done) => {
            mockServer.start((3001));
            done();
        });

        afterEach((done) => {
            mockServer.stop();
            done();
        });

        it("should return null if vocabulary URL does not exist", (done) => {
            let url = "http://localhost:3001/doesnotexist";
            mockServer.get("/doesnotexist").thenReply(404, "not found").then(() => {
                FRBRooUtil.readVocabulary(url, (error, vocabData) => {
                    expect(error).to.not.equal(null);
                    done();
                });
            });
        });

        it("should return vocabulary data if vocabulary URL exists", (done) => {
            let url = "http://localhost:3001/vangoghannotationontology.ttl";
            mockServer.get("/vangoghannotationontology.ttl").thenReply(200, vangoghOntologyString).then(() => {
                FRBRooUtil.readVocabulary(url, (error, vocabData) => {
                    expect(error).to.equal(null);
                    expect(vocabData.data).to.equal(vangoghOntologyString);
                    done();
                });
            });
        });
    });

    describe("makeVocabularyStore", () => {

        it("should throw an error if no vocabulary data is given", (done) => {
            let error = null;
            try {
                let store = FRBRooUtil.makeVocabularyStore(null);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            expect(error.message).to.equal("cannot make store if no vocabulary data is given");
            done();
        });

        it("should throw an error if invalid vocabulary data is given", (done) => {
            let error = null;
            try {
                let store = FRBRooUtil.makeVocabularyStore(["hello"]);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            expect(error.message).to.equal("Invalid vocabulary data! vocabulary should have properties 'url' and 'data'");
            done();
        });

        it("should return an object with a vocabulary list and an RDFLib store", (done) => {
            let url = "http://localhost:3001/vangoghannotationontology.ttl";
            let vocabData = [{url: url, data: vangoghOntologyString}];
            let store = FRBRooUtil.makeVocabularyStore(vocabData);
            expect(store).to.not.equal(null);
            expect(store.hasOwnProperty("vocabularies")).to.equal(true);
            expect(store.vocabularies[0]).to.equal(url);
            expect(store.hasOwnProperty("triples")).to.equal(true);
            done();
        });
    });

    describe("isValidVocabulary", () => {

        it("should return false if no vocabulary data is given", (done) => {
            let isValid = FRBRooUtil.isValidVocabulary(null);
            expect(isValid).to.equal(false);
            done();
        });

        it("should return false if invalid vocabulary data is given", (done) => {
            let isValid = FRBRooUtil.isValidVocabulary(["hello"]);
            expect(isValid).to.equal(false);
            done();
        });

        it("should return false if incomplete vocabulary data is given", (done) => {
            let url = "http://localhost:3001/vangoghannotationontology.ttl";
            let isValid = FRBRooUtil.isValidVocabulary({url: url});
            expect(isValid).to.equal(false);
            done();
        });

        it("should return true if valid vocabulary data is given", (done) => {
            let url = "http://localhost:3001/vangoghannotationontology.ttl";
            let vocabData = {url: url, data: vangoghOntologyString};
            let isValid = FRBRooUtil.isValidVocabulary(vocabData);
            expect(isValid).to.equal(true);
            done();
        });
    });

    describe("isValidVocabularyStore", () => {

        it("should return false if no store is given", (done) => {
            let isValid = FRBRooUtil.isValidVocabularyStore(null);
            expect(isValid).to.equal(false);
            done();
        });

        it("should return false if invalid store is given", (done) => {
            let url = "http://localhost:3001/vangoghannotationontology.ttl";
            let vocab = {url: url, data: vangoghOntologyString};
            let isValid = FRBRooUtil.isValidVocabularyStore(vocab);
            expect(isValid).to.equal(false);
            done();
        });

        it("should return true if valid store is given", (done) => {
            let url = "http://localhost:3001/vangoghannotationontology.ttl";
            let vocab = {url: url, data: vangoghOntologyString};
            let vocabStore = FRBRooUtil.makeVocabularyStore([vocab]);
            let isValid = FRBRooUtil.isValidVocabularyStore(vocabStore);
            expect(isValid).to.equal(true);
            done();
        });
    });

    describe("getImports", () => {

        it("should throw an error if no store is given", (done) => {
            let url = "http://localhost:3001/vangoghannotationontology.ttl";
            let vocab = {url: url, data: vangoghOntologyString};
            let error = null;
            try {
                FRBRooUtil.getImports(vocab);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            expect(error.message).to.equal("Invalid vocabularyStore given");
            done();
        });

        it("should return empty list if vocabulary has no imports", (done) => {
            let url = "http://localhost:3001/vangoghannotationontology.ttl";
            let vocabularies = [{url: url, data: ""}];
            let vocabStore = FRBRooUtil.makeVocabularyStore(vocabularies);
            let imports = FRBRooUtil.getImports(vocabStore);
            expect(Array.isArray(imports)).to.equal(true);
            expect(imports.length).to.equal(0);
            done();
        });

        it("should return empty list if vocabulary is base annotation ontology", (done) => {
            let url = "http://localhost:3001/editionannotationontology.ttl";
            FRBRooUtil.baseAnnotationOntologyURL = "http://localhost:3001/editionannotationontology.ttl";
            let vocabularies = [{url: url, data: editionOntologyString}];
            let vocabStore = FRBRooUtil.makeVocabularyStore(vocabularies);
            let imports = FRBRooUtil.getImports(vocabStore);
            expect(Array.isArray(imports)).to.equal(true);
            expect(imports.length).to.equal(0);
            done();
        });

        it("should return non-empty list if vocabulary has imports", (done) => {
            let url = "http://localhost:3001/vangoghannotationontology.ttl";
            let vocabularies = [{url: url, data: vangoghOntologyString}];
            let vocabStore = FRBRooUtil.makeVocabularyStore(vocabularies);
            let imports = FRBRooUtil.getImports(vocabStore);
            expect(Array.isArray(imports)).to.equal(true);
            expect(imports.length).to.equal(1);
            done();
        });
    });

    describe("updateVocabularyStore", () => {

        it("should throw an error if no store is given", (done) => {
            let error = null;
            try {
                FRBRooUtil.updateVocabularyStore(null, null);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            expect(error.message).to.equal("Invalid vocabularyStore given");
            done();
        });

        it("should throw an error if no vocabularies is given", (done) => {
            let url = "http://localhost:3001/vangoghannotationontology.ttl";
            let vocabularies = [{url: url, data: vangoghOntologyString}];
            let vocabStore = FRBRooUtil.makeVocabularyStore(vocabularies);
            let error = null;
            try {
                FRBRooUtil.updateVocabularyStore(vocabStore, null);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            expect(error.message).to.equal("vocabularies must be an Array of vocabulary objects");
            done();
        });

        it("should throw an error if invalid vocabularies is given", (done) => {
            let url = "http://localhost:3001/vangoghannotationontology.ttl";
            let vocabularies = [{url: url, data: vangoghOntologyString}];
            let vocabStore = FRBRooUtil.makeVocabularyStore(vocabularies);
            let error = null;
            try {
                FRBRooUtil.updateVocabularyStore(vocabStore, [editionOntologyString]);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            expect(error.message).to.equal("Invalid vocabulary data! vocabulary should have properties 'url' and 'data'");
            done();
        });

        it("should update the store if new vocabularies are given", (done) => {
            let url = "http://localhost:3001/vangoghannotationontology.ttl";
            let vocabularies = [{url: url, data: vangoghOntologyString}];
            let vocabStore = FRBRooUtil.makeVocabularyStore(vocabularies);
            let newUrl = "http://localhost:3001/editionannotationontology.ttl";
            let newVocabularies = [{url: newUrl, data: editionOntologyString}];
            FRBRooUtil.updateVocabularyStore(vocabStore, newVocabularies);
            expect(vocabStore.vocabularies.includes(newUrl)).to.equal(true);
            done();
        });
    });

    describe("importAndUpdate", () => {

        beforeEach((done) => {
            mockServer.start((3001));
            done();
        });

        afterEach((done) => {
            mockServer.stop();
            done();
        });

        it("should do nothing if no new ontologies are imported in given ontology", (done) => {
            let url = "http://localhost:3001/editionannotationontology.ttl";
            let vocabularies = [{url: url, data: editionOntologyString}];
            let vocabularyStore = FRBRooUtil.makeVocabularyStore(vocabularies);
            let numVocabularies = vocabularyStore.vocabularies.length;
            FRBRooUtil.importAndUpdate(vocabularyStore, (error, updatesDone) => {
                expect(updatesDone).to.equal(true);
                expect(vocabularyStore.vocabularies.length).to.equal(numVocabularies);
                done();
            });
        });

        it("should add ontology if new ontology is imported in given ontology", (done) => {
            let url = "http://localhost:3001/vangoghannotationontology.ttl";
            let vocabularies = [{url: url, data: vangoghOntologyString}];
            let vocabularyStore = FRBRooUtil.makeVocabularyStore(vocabularies);
            let newUrl = "http://localhost:3001/editionannotationontology.ttl";
            let newVocabularies = [{url: newUrl, data: editionOntologyString}];
            let numVocabularies = vocabularyStore.vocabularies.length;
            mockServer.get("/editionannotationontology.ttl").thenReply(200, editionOntologyString).then(() => {
                FRBRooUtil.importAndUpdate(vocabularyStore, (error, updatesDone) => {
                    expect(updatesDone).to.equal(true);
                    expect(vocabularyStore.vocabularies.length).to.equal(numVocabularies + 1);
                    expect(vocabularyStore.vocabularies.includes(newUrl)).to.equal(true);
                    done();
                });
            });
        });
    });

    describe("loadVocabularies", () => {

        beforeEach((done) => {
            mockServer.start((3001));
            done();
        });

        afterEach((done) => {
            mockServer.stop();
            done();
        });

        it("should return an empty store if no vocabularies are specified in document", (done) => {
            loadPlainPage();
            FRBRooUtil.loadVocabularies((error, vocabularyStore) => {
                expect(vocabularyStore).to.not.equal(undefined);
                expect(vocabularyStore.hasOwnProperty("vocabularies")).to.equal(true);
                expect(vocabularyStore.vocabularies.length).to.equal(0);
                done();
            });
        });

        it("should return a non-empty store if vocabularies are specified in document", (done) => {
            loadRDFaPage();
            let vangoghURL = "http://localhost:3001/vangoghannotationontology.ttl";
            let editionURL = "http://localhost:3001/editionannotationontology.ttl";
            mockServer.get("/vangoghannotationontology.ttl").thenReply(200, vangoghOntologyString).then(() => {});
            mockServer.get("/editionannotationontology.ttl").thenReply(200, editionOntologyString).then(() => {});
            FRBRooUtil.loadVocabularies((error, vocabularyStore) => {
                expect(error).to.equal(null);
                expect(vocabularyStore).to.not.equal(undefined);
                expect(vocabularyStore.hasOwnProperty("vocabularies")).to.equal(true);
                expect(vocabularyStore.vocabularies.length).to.equal(2);
                expect(vocabularyStore.vocabularies.includes(vangoghURL)).to.equal(true);
                expect(vocabularyStore.vocabularies.includes(editionURL)).to.equal(true);
                done();
            });
        });
    });

    describe("getHierarchicalRelations", () => {

        var vocabularyStore = null;

        beforeEach((done) => {
            mockServer.start((3001));
            mockServer.get("/vangoghannotationontology.ttl").thenReply(200, vangoghOntologyString).then(() => {});
            mockServer.get("/editionannotationontology.ttl").thenReply(200, editionOntologyString).then(() => {});
            FRBRooUtil.loadVocabularies((error, store) => {
                vocabularyStore = store;
                done();
            });
        });

        afterEach((done) => {
            mockServer.stop();
            done();
        });

        it("should return an object with properties 'includes' and 'isIncludedIn'", (done) => {
            let relations = FRBRooUtil.getHierarchicalRelations(vocabularyStore);
            expect(relations).to.not.equal(undefined);
            expect(relations.hasOwnProperty("includes")).to.equal(true);
            expect(relations.hasOwnProperty("isIncludedIn")).to.equal(true);
            done();
        });

        it("should find hasWorkPart as hierarchical includes relation", (done) => {
            let hasWorkPart = "http://localhost:3001/editionannotationontology.ttl#hasWorkPart";
            let relations = FRBRooUtil.getHierarchicalRelations(vocabularyStore);
            expect(relations.includes.includes(hasWorkPart)).to.equal(true);
            done();
        });

        it("should find isWorkPartOf as hierarchical isIncludedIn relation", (done) => {
            let isWorkPartOf = "http://localhost:3001/editionannotationontology.ttl#hasWorkPart";
            let relations = FRBRooUtil.getHierarchicalRelations(vocabularyStore);
            expect(relations.includes.includes(isWorkPartOf)).to.equal(true);
            done();
        });

        /*
        it("should not find hasRepresentation as hierarchical includes relation", (done) => {
            let hasRepresentation = "http://localhost:3001/editionannotationontology.ttl#hasRepresentation";
            let relations = FRBRooUtil.getHierarchicalRelations(vocabularyStore);
            expect(relations.includes.includes(hasRepresentation)).to.equal(false);
            done();
        });

        it("should find hasRepresentation as hierarchical hasRepresentation relation", (done) => {
            let hasRepresentation = "http://localhost:3001/editionannotationontology.ttl#hasRepresentation";
            let relations = FRBRooUtil.getHierarchicalRelations(vocabularyStore);
            expect(relations.hasRepresentation.includes(hasRepresentation)).to.equal(true);
            done();
        });

        it("should find isRepresentationOf as hierarchical isRepresentationOf relation", (done) => {
            let isRepresentationOf = "http://localhost:3001/editionannotationontology.ttl#isRepresentationOf";
            let relations = FRBRooUtil.getHierarchicalRelations(vocabularyStore);
            expect(relations.isRepresentationOf.includes(isRepresentationOf)).to.equal(true);
            done();
        });
        */
    });

    describe("getRepresentationRelations", () => {

        var vocabularyStore = null;

        beforeEach((done) => {
            mockServer.start((3001));
            mockServer.get("/vangoghannotationontology.ttl").thenReply(200, vangoghOntologyString).then(() => {});
            mockServer.get("/editionannotationontology.ttl").thenReply(200, editionOntologyString).then(() => {});
            FRBRooUtil.loadVocabularies((error, store) => {
                vocabularyStore = store;
                done();
            });
        });

        afterEach((done) => {
            mockServer.stop();
            done();
        });

        it("should find hasRepresentation as hasRepresentation relation", (done) => {
            let hasRepresentation = "http://localhost:3001/editionannotationontology.ttl#hasRepresentation";
            let relations = FRBRooUtil.getRepresentationRelations(vocabularyStore);
            expect(relations.hasRepresentation.includes(hasRepresentation)).to.equal(true);
            done();
        });

        it("should find isRepresentationOf as isRepresentationOf relation", (done) => {
            let isRepresentationOf = "http://localhost:3001/editionannotationontology.ttl#isRepresentationOf";
            let relations = FRBRooUtil.getRepresentationRelations(vocabularyStore);
            expect(relations.isRepresentationOf.includes(isRepresentationOf)).to.equal(true);
            done();
        });
    });

    describe("getRelations", () => {

        var vocabularyStore = null;

        beforeEach((done) => {
            mockServer.start((3001));
            mockServer.get("/vangoghannotationontology.ttl").thenReply(200, vangoghOntologyString).then(() => {});
            mockServer.get("/editionannotationontology.ttl").thenReply(200, editionOntologyString).then(() => {});
            FRBRooUtil.loadVocabularies((error, store) => {
                vocabularyStore = store;
                done();
            });
        });

        afterEach((done) => {
            mockServer.stop();
            done();
        });

        it("should find hasRepresentation and includes relations", (done) => {
            let hasRepresentation = "http://localhost:3001/editionannotationontology.ttl#hasRepresentation";
            let hasWorkPart = "http://localhost:3001/editionannotationontology.ttl#hasWorkPart";
            let relations = FRBRooUtil.getRelations(vocabularyStore);
            expect(relations.hasOwnProperty("includes")).to.equal(true);
            expect(relations.hasOwnProperty("isIncludedIn")).to.equal(true);
            expect(relations.hasOwnProperty("hasRepresentation")).to.equal(true);
            expect(relations.hasOwnProperty("isRepresentationOf")).to.equal(true);
            done();
        });

        it("should only return valid includes relations", (done) => {
            let relations = FRBRooUtil.getRelations(vocabularyStore);
            expect(relations.includes.includes(null)).to.equal(false);
            done();
        });

        it("should only return valid isIncludedIn relations", (done) => {
            let relations = FRBRooUtil.getRelations(vocabularyStore);
            expect(relations.isIncludedIn.includes(null)).to.equal(false);
            done();
        });

        it("should only return valid hasRepresentation relations", (done) => {
            let relations = FRBRooUtil.getRelations(vocabularyStore);
            expect(relations.hasRepresentation.includes(null)).to.equal(false);
            done();
        });

        it("should only return valid isRepresentationOf relations", (done) => {
            let relations = FRBRooUtil.getRelations(vocabularyStore);
            expect(relations.isRepresentationOf.includes(null)).to.equal(false);
            done();
        });

    });

});


