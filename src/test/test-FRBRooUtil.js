
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
        <body class=\"annotation-target-observer\" vocab=${vocabulary}>
            <div typeof="EditionText" resource="urn:vangogh/letter=001:repr=original">Hello</div>
            <div typeof="EditionTranscript" resource="urn:vangogh/letter=001:repr=transcript">Goodbye</div>
        </body>
    </html>`;
    loadPage(htmlSource);
    let observerNodes = document.getElementsByClassName("annotation-target-observer");
    RDFaUtil.setObserverNodes(observerNodes);
}

let frbrooRelationsString = `
@prefix hi: <http://localhost:3001/editionannotationontology.ttl#> .
@prefix vg: <http://localhost:3001/vangoghannotationontology.ttl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

<urn:vangogh/letter=001> rdf:type vg:Letter.
<urn:vangogh/letter=001> hi:hasRepresentation <urn:vangogh/letter=001:repr=original>.
<urn:vangogh/letter=001> hi:hasRepresentation <urn:vangogh/letter=001:repr=transcript>.
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


var prefillStore = () => {
    FRBRooUtil.newStore();
    try {
        let mimeType = "text/turtle";
        let baseUri = "http://localhost:3001/frbroo_alternate.ttl";
        $rdf.parse(frbrooRelationsString, FRBRooUtil.rdfStore, baseUri, mimeType);
        FRBRooUtil.rdfStore = FRBRooUtil.rdfStore;
    } catch (error) {
        console.log(error);
    }
}

describe("FRBRooUtil", () => {

    beforeEach((done) => {
        loadRDFaPage();
        done();
    });

    describe("isAlternateLink", () => {
        it("shoud return false if element is not link", (done) => {
            let element = document.getElementsByTagName("div")[0];
            expect(FRBRooUtil.isAlternateLink(element)).to.equal(false);
            done();
        });

        it("shoud return false if element is link but rel is not alternate", (done) => {
            let element = document.getElementsByTagName("link")[0];
            expect(FRBRooUtil.isAlternateLink(element)).to.equal(false);
            done();
        });

        it("shoud return true if element is link and rel is alternate", (done) => {
            let element = document.getElementsByTagName("link")[1];
            expect(FRBRooUtil.isAlternateLink(element)).to.equal(true);
            done();
        });

    });

    describe("getAlternateLinks", () => {

        it("should find link", (done) => {
            let links = FRBRooUtil.getAlternateLinks();
            expect(Array.isArray(links)).to.equal(true);
            expect(links.length).to.equal(1);
            done();
        });

    });

    describe("getAlternateLinkRefs", () => {

        it("should find link URL", (done) => {
            let links = FRBRooUtil.getAlternateLinkRefs();
            let link = links[0];
            expect(link.url).to.equal(localURL + "frbroo_alternate.ttl");
            expect(link.mimeType).to.equal("text/n3")
            done();
        });

    });

    describe("readExternalResources", () => {

        beforeEach((done) => {
            mockServer.start((3001));
            mockServer.get("/doesnotexist").thenReply(404, "not found");
            mockServer.get("/frbroo_alternate.ttl").thenReply(200, frbrooRelationsString);
            done();
        });

        afterEach((done) => {
            mockServer.stop();
            done();
        });

        it("should return null when relations file does not exist", (done) => {
            let url = "http://localhost:3001/doesnotexist";
            let frbrooRelations = FRBRooUtil.readExternalResources(url, (error, frbrooRelations) => {
                expect(error).to.not.equal(null);
                expect(frbrooRelations).to.equal(null);
                done();
            });
        });

        it("should return an RDFLib store when relations file does exist", (done) => {
            let url = "http://localhost:3001/frbroo_alternate.ttl";
            let frbrooRelations = FRBRooUtil.readExternalResources(url, (error, frbrooRelations) => {
                expect(error).to.equal(null);
                expect(frbrooRelations).to.equal(frbrooRelationsString);
                done();
            });
        });

    });

    describe("storeExternalResources", () => {

        it("should throw error when no store given", (done) => {
            let baseURI = "http://localhost:3001/frbroo_alternate.ttl";
            let mimeType = "text/n3";
            let store = null;
            var error = null;
            try {
                FRBRooUtil.storeExternalResources(store, "", baseURI, mimeType);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.be.null;
            done();
        });

        it("should have store", (done) => {
            let baseURI = "http://localhost:3001/frbroo_alternate.ttl";
            let mimeType = "text/n3";
            let store = FRBRooUtil.newStore();
            FRBRooUtil.storeExternalResources(store, "", baseURI, mimeType);
            expect(store).to.not.be.undefined;
            done();
        });

        it("should find Letter resource", (done) => {
            let rdfType = "http://localhost:3001/vangoghannotationontology.ttl#Letter";
            let predicate = FRBRooUtil.RDF('type');
            let baseURI = "http://localhost:3001/frbroo_alternate.ttl";
            let mimeType = "text/n3";
            let store = FRBRooUtil.newStore();
            FRBRooUtil.storeExternalResources(store, frbrooRelationsString, baseURI, mimeType);
            let object = $rdf.sym(rdfType);
            let subject = store.any(undefined, predicate, object);
            expect(subject.uri).to.equal("urn:vangogh/letter=001")
            done();
        });
    });

    describe("findExternalSubjectRelations", () => {

        let mimeType = "text/turtle";
        let baseUri = "http://localhost:3001/frbroo_alternate.ttl";
        let resourceStore = {
            triples: FRBRooUtil.newStore()
        }
        $rdf.parse(frbrooRelationsString, resourceStore.triples, baseUri, mimeType);

        it("should return null if unknown object is given", (done) => {
            let resource = "urn:unknown";
            let relations = FRBRooUtil.findExternalSubjectRelations(resourceStore, resource, undefined);
            expect(relations.length).to.equal(0);
            done();
        });

        it("should return representation objects and represented object type if represented of object is given", (done) => {
            let abstractResource = "urn:vangogh/letter=001";
            let originalResource = "urn:vangogh/letter=001:repr=original";
            let transcriptResource = "urn:vangogh/letter=001:repr=transcript";
            let abstractType = "http://localhost:3001/vangoghannotationontology.ttl#Letter";
            let relations = FRBRooUtil.findExternalSubjectRelations(resourceStore, abstractResource, undefined);
            let objects = relations.map((relation) => { return relation.object.value });
            expect(relations.length).to.equal(4);
            expect(objects).to.include(originalResource);
            expect(objects).to.include(transcriptResource);
            expect(objects).to.include(abstractType);
            done();
        });

        it("should return no relations if represented object and unknown relation are given", (done) => {
            let originalResource = "urn:vangogh/letter=001:repr=original";
            let abstractResource = "urn:vangogh/letter=001";
            let relation = "http://localhost:3001/editionannotationontology.ttl#hasUnkownRelation";
            let relations = FRBRooUtil.findExternalSubjectRelations(resourceStore, abstractResource, relation);
            expect(relations.length).to.equal(0);
            done();
        });

        it("should return represented object if representation of object and relation are given", (done) => {
            let originalResource = "urn:vangogh/letter=001:repr=original";
            let transcriptResource = "urn:vangogh/letter=001:repr=transcript";
            let abstractResource = "urn:vangogh/letter=001";
            let relation = "http://localhost:3001/editionannotationontology.ttl#hasRepresentation";
            let relations = FRBRooUtil.findExternalSubjectRelations(resourceStore, abstractResource, relation);
            expect(relations.length).to.equal(2);
            let objects = relations.map((relation) => { return relation.object.value });
            expect(objects).to.include(originalResource);
            expect(objects).to.include(transcriptResource);
            done();
        });
    });

    describe("findExternalObjectRelations", () => {

        let mimeType = "text/turtle";
        let baseUri = "http://localhost:3001/frbroo_alternate.ttl";
        let store = FRBRooUtil.newStore();
        let resourceStore = {
            triples: FRBRooUtil.newStore()
        }
        $rdf.parse(frbrooRelationsString, resourceStore.triples, baseUri, mimeType);

        it("should return null if unknown object is given", (done) => {
            let resource = "urn:unknown";
            let relations = FRBRooUtil.findExternalObjectRelations(resourceStore, resource, undefined);
            expect(relations.length).to.equal(0);
            done();
        });

        it("should return abstract object if representation of object is given", (done) => {
            let originalResource = "urn:vangogh/letter=001:repr=original";
            let abstractResource = "urn:vangogh/letter=001";
            let relations = FRBRooUtil.findExternalObjectRelations(resourceStore, originalResource, undefined);
            expect(relations.length).to.equal(1);
            expect(relations[0].subject.value).to.equal(abstractResource)
            done();
        });

        it("should return no relations if representation of object and unknown relation are given", (done) => {
            let originalResource = "urn:vangogh/letter=001:repr=original";
            let abstractResource = "urn:vangogh/letter=001";
            let relation = "http://localhost:3001/editionannotationontology.ttl#hasUnkownRelation";
            let relations = FRBRooUtil.findExternalObjectRelations(resourceStore, originalResource, relation);
            expect(relations.length).to.equal(0);
            done();
        });

        it("should return represented object if representation of object and relation are given", (done) => {
            let originalResource = "urn:vangogh/letter=001:repr=original";
            let abstractResource = "urn:vangogh/letter=001";
            let relation = "http://localhost:3001/editionannotationontology.ttl#hasRepresentation";
            let relations = FRBRooUtil.findExternalObjectRelations(resourceStore, originalResource, relation);
            expect(relations.length).to.equal(1);
            expect(relations[0].subject.value).to.equal(abstractResource);
            expect(relations[0].predicate.value).to.equal(relation);
            done();
        });
    });

    describe("findExternalResources", () => {

        let mimeType = "text/turtle";
        let baseUri = "http://localhost:3001/frbroo_alternate.ttl";
        let resourceStore = {
            triples: FRBRooUtil.newStore()
        }
        $rdf.parse(frbrooRelationsString, resourceStore.triples, baseUri, mimeType);

        beforeEach((done) => {
            let baseURI = "http://localhost:3001/frbroo_alternate.ttl";
            let mimeType = "text/n3";
            FRBRooUtil.storeExternalResources(resourceStore.triples, frbrooRelationsString, baseURI, mimeType);
            done();
        });

        it("should return empty list for unknown resources", (done) => {
            let original = "urn:unknown";
            let relatedResources = FRBRooUtil.findExternalResources(resourceStore, original);
            expect(relatedResources).to.not.equal(null);
            expect(relatedResources.length).to.equal(0);
            done();
        });

        it("should find abstract letter for original representation", (done) => {
            let originalLetter = "urn:vangogh/letter=001:repr=original";
            let abstractLetter = "urn:vangogh/letter=001";
            let relatedResources = FRBRooUtil.findExternalResources(resourceStore, originalLetter);
            expect(relatedResources.length).to.equal(1);
            expect(relatedResources[0].subject.value).to.equal(abstractLetter);
            done();
        });

        it("should return abstractLetter letter for list of resources", (done) => {
            let originalLetter = "urn:vangogh/letter=001:repr=original";
            let transcriptLetter = "urn:vangogh/letter=001:repr=transcript";
            let abstractLetter = "urn:vangogh/letter=001";
            let resources = [originalLetter, transcriptLetter];
            let relatedResources = FRBRooUtil.findExternalResources(resourceStore, resources);
            expect(relatedResources.length).to.equal(2);
            expect(relatedResources[0].subject.value).to.equal(abstractLetter);
            expect(relatedResources[1].subject.value).to.equal(abstractLetter);
            done();
        });

        it("should return abstractLetter letter for list of resources and known relation type", (done) => {
            let originalLetter = "urn:vangogh/letter=001:repr=original";
            let transcriptLetter = "urn:vangogh/letter=001:repr=transcript";
            let abstractLetter = "urn:vangogh/letter=001";
            let relationType = "http://localhost:3001/editionannotationontology.ttl#hasRepresentation";
            let resources = [originalLetter, transcriptLetter];
            let relatedResources = FRBRooUtil.findExternalResources(resourceStore, resources, relationType);
            expect(relatedResources.length).to.equal(2);
            expect(relatedResources[0].subject.value).to.equal(abstractLetter);
            expect(relatedResources[1].subject.value).to.equal(abstractLetter);
            done();
        });

        it("should return empty list for list of resources and unknown relation type", (done) => {
            let originalLetter = "urn:vangogh/letter=001:repr=original";
            let transcriptLetter = "urn:vangogh/letter=001:repr=transcript";
            let abstractLetter = "urn:vangogh/letter=001";
            let relationType = "http://localhost:3001/editionannotationontology.ttl#hasTranslation";
            let resources = [originalLetter, transcriptLetter];
            let relatedResources = FRBRooUtil.findExternalResources(resourceStore, resources, relationType);
            expect(relatedResources.length).to.equal(0);
            done();
        });

        it("should return ignore non-existing resrouce in resource list", (done) => {
            let unknownResource = "urn:unknown";
            let transcriptLetter = "urn:vangogh/letter=001:repr=transcript";
            let abstractLetter = "urn:vangogh/letter=001";
            let resources = [unknownResource, transcriptLetter];
            let relatedResources = FRBRooUtil.findExternalResources(resourceStore, resources);
            expect(relatedResources.length).to.equal(1);
            expect(relatedResources[0].subject.value).to.equal(abstractLetter);
            done();
        });
    });

    describe("addRDFTypeProperty", () => {

        it("should add no type if no type is given", (done) => {
            let properties = {};
            FRBRooUtil.addRDFTypeProperty(properties, null);
            expect(properties.hasOwnProperty("rdfType")).to.equal(false);
            done();
        });

        it("should add type as string if no previous type is given", (done) => {
            let properties = {};
            let rdfType = "http://localhost:3001/vangoghannotationontology.ttl#Letter";
            FRBRooUtil.addRDFTypeProperty(properties, rdfType);
            expect(properties.hasOwnProperty("rdfType")).to.equal(true);
            expect(properties.rdfType).to.equal(rdfType);
            done();
        });

        it("should throw error if properties.rdfType is not array or string", (done) => {
            let properties = {rdfType: {someProp: "someValue"}};
            let rdfType = "http://localhost:3001/vangoghannotationontology.ttl#Letter";
            var error = null;
            try {
                FRBRooUtil.addRDFTypeProperty(properties, rdfType);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            done();
        });

        it("should change rdfType to Array if single previous type is given", (done) => {
            var rdfType = "http://localhost:3001/vangoghannotationontology.ttl#Letter";
            let properties = {rdfType: rdfType};
            var rdfType = "http://localhost:3001/editionannotationontology.ttl#Work";
            FRBRooUtil.addRDFTypeProperty(properties, rdfType);
            expect(Array.isArray(properties.rdfType)).to.equal(true);
            done();
        });

        it("should add rdfType to Array if single previous type is given", (done) => {
            var rdfType = "http://localhost:3001/vangoghannotationontology.ttl#Letter";
            let properties = {rdfType: [rdfType]};
            var rdfType = "http://localhost:3001/editionannotationontology.ttl#Work";
            FRBRooUtil.addRDFTypeProperty(properties, rdfType);
            expect(Array.isArray(properties.rdfType)).to.equal(true);
            expect(properties.rdfType.length).to.equal(2);
            done();
        });
    });

    describe("gatherResourceProperties", () => {

        let mimeType = "text/turtle";
        let baseUri = "http://localhost:3001/frbroo_alternate.ttl";
        let store = FRBRooUtil.newStore();
        $rdf.parse(frbrooRelationsString, store, baseUri, mimeType);

        it("should return null for unknown resources", (done) => {
            let resource = "urn:unknown";
            let properties = FRBRooUtil.gatherResourceProperties(store, resource);
            expect(properties).to.equal(null);
            done();
        });

        it("should find Letter property for abstract letter", (done) => {
            let resource = "urn:vangogh/letter=001";
            var rdfType = "http://localhost:3001/vangoghannotationontology.ttl#Letter";
            let properties = FRBRooUtil.gatherResourceProperties(store, resource);
            expect(properties.hasOwnProperty("rdfType")).to.equal(true);
            expect(properties.rdfType).to.equal(rdfType);
            done();
        });
    });

    describe("isRDFTriple", () => {

        let mimeType = "text/turtle";
        let baseUri = "http://localhost:3001/frbroo_alternate.ttl";
        let store = FRBRooUtil.newStore();
        $rdf.parse(frbrooRelationsString, store, baseUri, mimeType);

        it("should throw an error if triple has no subject", (done) => {
            let error = null;
            let relation = {predicate: {value: "2"}, object: {value: "3"}};
            expect(FRBRooUtil.isRDFTriple(relation)).to.equal(false);
            done();
        });

        it("should throw an error if triple has no predicate", (done) => {
            let error = null;
            let relation = {subject: {value: "1"}, object: {value: "3"}};
            expect(FRBRooUtil.isRDFTriple(relation)).to.equal(false);
            done();
        });

        it("should throw an error if triple has no object", (done) => {
            let error = null;
            let relation = {subject: {value: "1"}, predicate: {value: "2"}};
            expect(FRBRooUtil.isRDFTriple(relation)).to.equal(false);
            done();
        });

        it("should return true if triple has subject, predicate and object", (done) => {
            let error = null;
            let relation = store.statementsMatching(undefined, FRBRooUtil.RDF('type'))[0];
            expect(FRBRooUtil.isRDFTriple(relation)).to.equal(true);
            done();
        });
    });

    describe("addIndexEntry", () => {

        let mimeType = "text/turtle";
        let baseUri = "http://localhost:3001/frbroo_alternate.ttl";
        let store = FRBRooUtil.newStore();
        $rdf.parse(frbrooRelationsString, store, baseUri, mimeType);

        it("should throw an error if no index is given", (done) => {
            let index = {};
            let resource = "urn:vangogh/letter=001";
            let relation = store.statementsMatching($rdf.sym(resource), FRBRooUtil.RDF('type'))[0];
            var error = null;
            try {
                FRBRooUtil.addIndexEntry(null, resource, relation);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            done();
        });

        it("should throw an error if no resource is given", (done) => {
            let index = {};
            let resource = "urn:vangogh/letter=001";
            let relation = store.statementsMatching($rdf.sym(resource), FRBRooUtil.RDF('type'))[0];
            var error = null;
            try {
                FRBRooUtil.addIndexEntry(index, null, relation);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            done();
        });

        it("should throw an error if no RDF relation is given", (done) => {
            let index = {};
            let resource = "urn:vangogh/letter=001";
            let relation = store.statementsMatching($rdf.sym(resource), FRBRooUtil.RDF('type'))[0];
            var error = null;
            try {
                FRBRooUtil.addIndexEntry(index, resource, null);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            done();
        });

        it("should add relation if index, resource and RDF relation are given", (done) => {
            let index = {};
            let resource = "urn:vangogh/letter=001";
            let relation = store.statementsMatching($rdf.sym(resource), FRBRooUtil.RDF('type'))[0];
            FRBRooUtil.addIndexEntry(index, resource, relation);
            expect(index.hasOwnProperty(resource)).to.equal(true);
            done();
        });

        it("should thrown an error if RDF relation does not contain resource", (done) => {
            let index = {};
            let resource = "urn:vangogh/letter=001";
            let otherResource = "urn:unknown";
            let relation = store.statementsMatching($rdf.sym(resource), FRBRooUtil.RDF('type'))[0];
            var error = null;
            try {
                FRBRooUtil.addIndexEntry(index, otherResource, relation);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            done();
        });
    });

    describe("mapRepresentedResources", () => {

        let mimeType = "text/turtle";
        let baseUri = "http://localhost:3001/frbroo_alternate.ttl";
        let resourceStore = {
            triples: FRBRooUtil.newStore()
        }
        $rdf.parse(frbrooRelationsString, resourceStore.triples, baseUri, mimeType);

        it("should return an empty index if no resources are given", (done) => {
            let resources = [];
            let representedResourceIndex = FRBRooUtil.mapRepresentedResources(resourceStore, resources, null);
            expect(Object.keys(representedResourceIndex).length).to.equal(0);
            done();
        });

        it("should return an empty index if unknown resources are given", (done) => {
            let resources = ["urn:unknown"];
            let representedResourceIndex = FRBRooUtil.mapRepresentedResources(resourceStore, resources, null);
            expect(Object.keys(representedResourceIndex).length).to.equal(0);
            done();
        });

        it("should return an empty index if known resource has no represented resource", (done) => {
            let translationLetter = "urn:vangogh/letter=001:repr=translation";
            let resources = [translationLetter];
            let representedResourceIndex = FRBRooUtil.mapRepresentedResources(resourceStore, resources, null);
            expect(Object.keys(representedResourceIndex).length).to.equal(0);
            done();
        });

        it("should return a non-empty index if known resource has represented resource", (done) => {
            let abstractLetter = "urn:vangogh/letter=001";
            let originalLetter = "urn:vangogh/letter=001:repr=original";
            let hasRepresentation = "http://localhost:3001/editionannotationontology.ttl#hasRepresentation";
            let resources = [originalLetter];
            let representedResourceIndex = FRBRooUtil.mapRepresentedResources(resourceStore, resources);
            expect(Object.keys(representedResourceIndex).length).to.equal(1);
            done();
        });

        it("should have object as index entries if known resource has represented resource", (done) => {
            let abstractLetter = "urn:vangogh/letter=001";
            let originalLetter = "urn:vangogh/letter=001:repr=original";
            let hasRepresentation = "http://localhost:3001/editionannotationontology.ttl#hasRepresentation";
            let resources = [originalLetter];
            let representedResourceIndex = FRBRooUtil.mapRepresentedResources(resourceStore, resources);
            expect(typeof representedResourceIndex[originalLetter]).to.equal("object");
            done();
        });

        it("should have parentResource in entry if known resource has represented resource", (done) => {
            let abstractLetter = "urn:vangogh/letter=001";
            let originalLetter = "urn:vangogh/letter=001:repr=original";
            let hasRepresentation = "http://localhost:3001/editionannotationontology.ttl#hasRepresentation";
            let resources = [originalLetter];
            let representedResourceIndex = FRBRooUtil.mapRepresentedResources(resourceStore, resources);
            let entry = representedResourceIndex[originalLetter];
            expect(entry.parentResource).to.equal(abstractLetter);
            done();
        });

        it("should have relation property in entry if known resource has represented resource", (done) => {
            let abstractLetter = "urn:vangogh/letter=001";
            let originalLetter = "urn:vangogh/letter=001:repr=original";
            let hasRepresentation = "http://localhost:3001/editionannotationontology.ttl#hasRepresentation";
            let resources = [originalLetter];
            let representedResourceIndex = FRBRooUtil.mapRepresentedResources(resourceStore, resources);
            let entry = representedResourceIndex[originalLetter];
            expect(entry.relation).to.equal(hasRepresentation);
            done();
        });
    });

    describe("loadExternalResources", () => {

        FRBRooUtil.baseAnnotationOntologyURL = "http://localhost:3001/editionannotationontology.ttl";
        let vocabularyStore = null;

        beforeEach((done) => {
            mockServer.start((3001));
            mockServer.get("/frbroo_alternate.ttl").thenReply(200, frbrooRelationsString);
            mockServer.get("/vangoghannotationontology.ttl").thenReply(200, vangoghOntologyString);
            mockServer.get("/editionannotationontology.ttl").thenReply(200, editionOntologyString);
            loadRDFaPage();
            FRBRooUtil.loadVocabularies((error, store) => {
                vocabularyStore = store;
                done();
            });
        });

        afterEach((done) => {
            mockServer.stop();
            done();
        });

        it("should do nothing if no external resources are specified", (done) => {
            loadPlainPage();
            FRBRooUtil.loadExternalResources(vocabularyStore, (error, store) => {
                expect(error).to.equal(null);
                expect(store).to.equal(null);
                done();
            });
        });

        it("should store relations if external resources are specified", (done) => {
            loadRDFaPage();
            FRBRooUtil.loadExternalResources(vocabularyStore, (error, store) => {
                expect(store).to.not.equal(null);
                expect(store.relations).to.exist;
                done();
            });
        });

        it("should store triples if external resources are specified", (done) => {
            loadRDFaPage();
            FRBRooUtil.loadExternalResources(vocabularyStore, (error, store) => {
                expect(error).to.equal(null);
                expect(store).to.not.equal(null);
                expect(store.triples).to.exist;
                done();
            });
        });
    });

    describe("checkExternalResources", () => {

        let store = FRBRooUtil.newStore();

        beforeEach((done) => {
            mockServer.start((3001));
            mockServer.get("/frbroo_alternate.ttl").thenReply(200, frbrooRelationsString);
            done();
        });

        afterEach((done) => {
            mockServer.stop();
            done();
        });

        it("should do nothing if no external resources are specified", (done) => {
            loadPlainPage();
            FRBRooUtil.checkExternalResources((error, doIndexing, store) => {
                expect(error).to.equal(null);
                expect(doIndexing).to.deep.equal(false);
                done();
            });
        });

        it("should store relations if external resources are specified", (done) => {
            loadRDFaPage();
            FRBRooUtil.checkExternalResources((error, doIndexing, store) => {
                expect(error).to.equal(null);
                expect(doIndexing).to.deep.equal(true);
                expect(store).to.not.equal(null);
                done();
            });
        });
    });
});


