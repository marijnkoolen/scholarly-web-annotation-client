
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
import AnnotationActions from "../flux/AnnotationActions.js";
import AnnotationStore from "../flux/AnnotationStore.js";
const $rdf = require("rdflib");

let localURL = "http://localhost:3001/";
var loadPage = (htmlSource) => {
    const jsdomConfig = {url: localURL}
    let dom = new JSDOM(htmlSource, jsdomConfig);
    global.document = dom.window.document;
    global.window = dom.window;
}

var loadRDFaPage = () => {
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

let htmlSource = `
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="frbroo.css">
        <link rel="alternate" type="text/n3" href="frbroo_alternate.ttl">
    </head>
    <body class=\"annotation-target-observer\" vocab=\"http://localhost:3001/vangoghannotationontology.ttl#\">
        <div typeof="EditionText" resource="urn:vangogh/letter=001:repr=original">Hello</div>
        <div typeof="EditionTranscript" resource="urn:vangogh/letter=001:repr=transcript">Goodbye</div>
    </body>
</html>`;

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


let frbrooRelationsString = `
@prefix hi: <http://localhost:3001/editionannotationontology.ttl#> .
@prefix vg: <http://localhost:3001/vangoghannotationontology.ttl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

<urn:vangogh/letter=001> rdf:type vg:Letter.
<urn:vangogh/letter=001> hi:hasRepresentation <urn:vangogh/letter=001:repr=original>.
<urn:vangogh/letter=001> hi:hasRepresentation <urn:vangogh/letter=001:repr=transcript>.
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

describe("AnnotationActions", () => {

    let originalResource = "urn:vangogh/letter=001:repr=original";
    let transcriptResource = "urn:vangogh/letter=001:repr=transcript";
    let resources = [originalResource, transcriptResource];

    describe("indexResources", (done) => {

        beforeEach((done) => {
            loadRDFaPage();
            done();
        });

        it("should index letter representation", (done) => {
            AnnotationActions.indexResources((error) => {
                expect(Object.keys(AnnotationStore.resourceIndex).length).to.equal(2);
                expect(AnnotationStore.resourceIndex.hasOwnProperty(originalResource)).to.equal(true);
                done();
            });
        })
    });

    describe("indexExternalResources", (done) => {

        let baseAnnotationOntologyURL = "http://localhost:3001/editionannotationontology.ttl";

        beforeEach((done) => {
            loadRDFaPage();
            mockServer.start((3001));
            mockServer.get("/frbroo_alternate.ttl").thenReply(200, frbrooRelationsString);
            mockServer.get("/vangoghannotationontology.ttl").thenReply(200, vangoghOntologyString);
            mockServer.get("/editionannotationontology.ttl").thenReply(200, editionOntologyString);
            FRBRooUtil.store = null;
            AnnotationActions.setBaseAnnotationOntology(baseAnnotationOntologyURL);
            done();
        });

        afterEach((done) => {
            mockServer.stop();
            done();
        });

        it("should not return an error", (done) => {
            AnnotationActions.indexExternalResources(resources, (error) => {
                expect(error).to.equal(null);
                done();
            });
        });

        it("should add vocabularyStore", (done) => {
            AnnotationActions.indexExternalResources(resources, (error) => {
                expect(AnnotationStore.vocabularyStore).to.exist;
                done();
            });
        });

        it("should add resourceStore", (done) => {
            AnnotationActions.indexExternalResources(resources, (error) => {
                expect(AnnotationStore.resourceStore).to.exist;
                done();
            });
        });

        it("should index abstract letter", (done) => {
            AnnotationActions.indexExternalResources(resources, (error) => {
                expect(AnnotationStore.externalResourceIndex).to.exist;
                done();
            });
        });

        it("should index abstract letter", (done) => {
            AnnotationActions.indexExternalResources(resources, (error) => {
                expect(AnnotationStore.externalResourceIndex.hasOwnProperty(originalResource)).to.equal(true);
                done();
            });
        });
    });

    describe("hasExternalResource", () => {

        beforeEach((done) => {
            mockServer.start((3001));
            mockServer.get("/frbroo_alternate.ttl").thenReply(200, frbrooRelationsString);
            FRBRooUtil.store = null;
            done();
        });

        afterEach((done) => {
            mockServer.stop();
            done();
        });

        it("should return false if resource is unknown", (done) => {
            loadRDFaPage();
            let resourceId = "urn:unknown";
            let hasExternalResource = AnnotationActions.hasExternalResource(resourceId);
            expect(hasExternalResource).to.equal(false);
            done();
        });

        it("should return true if resource has represented abstract resource", (done) => {
            loadRDFaPage();
            AnnotationActions.indexExternalResources(resources, (error) => {
                let hasExternalResource = AnnotationActions.hasExternalResource(originalResource);
                expect(hasExternalResource).to.equal(true);
                done();
            });
        });
    });


    describe("getExternalResource", () => {

        beforeEach((done) => {
            mockServer.start((3001));
            mockServer.get("/frbroo_alternate.ttl").thenReply(200, frbrooRelationsString);
            mockServer.get("/vangoghannotationontology.ttl").thenReply(200, vangoghOntologyString);
            mockServer.get("/editionannotationontology.ttl").thenReply(200, editionOntologyString);
            FRBRooUtil.store = null;
            done();
        });

        afterEach((done) => {
            mockServer.stop();
            done();
        });

        it("should return null if resource is unknown", (done) => {
            loadRDFaPage();
            let resourceId = "urn:unknown";
            let externalResources = AnnotationActions.getExternalResource(resourceId);
            expect(externalResources).to.equal(null);
            done();
        });

        it("should return external resource object if resource has represented abstract resource", (done) => {
            loadRDFaPage();
            AnnotationActions.indexExternalResources(resources, (error) => {
                let externalResources = AnnotationActions.getExternalResource(originalResource);
                expect(typeof externalResources).to.equal("object");
                done();
            });
        });

        it("should return object with relation property if resource has represented abstract resource", (done) => {
            loadRDFaPage();
            AnnotationActions.indexExternalResources(resources, (error) => {
                let externalResources = AnnotationActions.getExternalResource(originalResource);
                expect(externalResources.hasOwnProperty("relation")).to.equal(true);
                done();
            });
        });
    });


});


