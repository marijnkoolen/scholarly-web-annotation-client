
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
    let vocabulary = "http://localhost:3001/vangoghannotationontology.ttl#";
    let htmlSource = `
    <html>
        <head>
            <link rel="stylesheet" type="text/css" href="frbroo.css">
            <link rel="alternate" type="text/n3" href="frbroo_alternate.ttl">
        </head>
        <body class=\"annotation-target-observer\" vocab=${vocabulary} prefix="hi:http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#">
            <div typeof="EditionText" resource="urn:vangogh/letter=001:repr=original">
                <div typeof="EditionText" resource="urn:vangogh/letter=001:para=1:repr=original" property"hi:hasWorkPart">
                    Hello
                </div>
            </div>
            <div typeof="EditionTranscript" resource="urn:vangogh/letter=001:repr=transcript">Goodbye</div>
        </body>
    </html>`;
    loadPage(htmlSource);
    let observerNodes = document.getElementsByClassName("annotation-target-observer");
    RDFaUtil.setObserverNodes(observerNodes);
}

var loadPlainPage = () => {
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
    let observerNodes = document.getElementsByClassName("annotation-target-observer");
    RDFaUtil.setObserverNodes(observerNodes);
}

let frbrooRelationsString = `
@prefix hi: <http://localhost:3001/editionannotationontology.ttl#> .
@prefix vg: <http://localhost:3001/vangoghannotationontology.ttl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix ecrm: <http://erlangen-crm.org/current/> .

<urn:vangogh/collection> rdf:type hi:Work.
<urn:vangogh/collection> hi:hasWorkPart <urn:vangogh/letter=001>.
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

    let vocabularyStore = null;
    let resourceStore = null;
    let relations = null;
    let resources = null;
    FRBRooUtil.baseAnnotationOntologyURL = "http://localhost:3001/editionannotationontology.ttl";

    beforeEach((done) => {

        mockServer.start((3001));
        mockServer.get("/frbroo_alternate.ttl").thenReply(200, frbrooRelationsString);
        mockServer.get("/vangoghannotationontology.ttl").thenReply(200, vangoghOntologyString);
        mockServer.get("/editionannotationontology.ttl").thenReply(200, editionOntologyString);
        loadRDFaPage();
        FRBRooUtil.loadVocabularies((error, store) => {
            vocabularyStore = store;
            FRBRooUtil.loadExternalResources(vocabularyStore, (error, store) => {
                resourceStore = store;
                done();
            });
        });
    });

    afterEach((done) => {
        mockServer.stop();
        done();
    });

    describe("isKnownResource", () => {

        it("should throw an error if invalid resourceStore is given", (done) => {
            let error = null;
            try {
                FRBRooUtil.isKnownResource(null, null);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            expect(error.message).to.equal("Invalid resourceStore");
            done();
        });

        it("should return false if no resource is given", (done) => {
            let error = null;
            try {
                FRBRooUtil.isKnownResource(resourceStore, undefined);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            expect(error.message).to.equal("Invalid resource");
            done();
        });

        it("should return false if unknown resource is given", (done) => {
            let isKnown = FRBRooUtil.isKnownResource(resourceStore, "urn:unknown");
            expect(isKnown).to.equal(false);
            done();
        });

        it("should return true if unknown resource is given", (done) => {
            let resource = "urn:vangogh/letter=001:para=1";
            let isKnown = FRBRooUtil.isKnownResource(resourceStore, resource);
            expect(isKnown).to.equal(true);
            done();
        });
    });

    describe("determineResourceHierarchy", () => {

        it ("should pass beforeEach without error", (done) => {
            done();
        });

        it("should throw an error if no resource is given", (done) => {
            let error = null;
            try {
                FRBRooUtil.determineResourceHierarchy(resourceStore, undefined);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            done();
        });

        it("should throw an error if unkonwn resource is given", (done) => {
            let error = null;
            let unknownResource = "urn:unknown";
            try {
                FRBRooUtil.determineResourceHierarchy(resourceStore, unknownResource);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            done();
        });

        it("should return resource hierarchy if known resource is given", (done) => {
            let resource = "urn:vangogh/letter=001:para=1";
            let hierarchy = FRBRooUtil.determineResourceHierarchy(resourceStore, resource);
            expect(hierarchy).to.not.be.undefined;
            done();
        });
    });

    describe("resourceGetParentRelation", () => {

        it("should return null if known resource has no parent", (done) => {
            let resource = "urn:vangogh/collection";
            let parentRelation = FRBRooUtil.resourceGetParentRelation(resourceStore, resource);
            expect(parentRelation).to.equal(null);
            done();
        });

        it("should return object with parent property if known resource has parent", (done) => {
            let resource = "urn:vangogh/letter=001:para=1";
            let parentRelation = FRBRooUtil.resourceGetParentRelation(resourceStore, resource);
            expect(parentRelation).to.not.equal(null);
            expect(parentRelation.hasOwnProperty("parentResource")).to.equal(true);
            done();
        });

        it("should return object with relation property if known resource has parent", (done) => {
            let resource = "urn:vangogh/letter=001:para=1";
            let parentRelation = FRBRooUtil.resourceGetParentRelation(resourceStore, resource, relations);
            expect(parentRelation).to.not.equal(null);
            expect(parentRelation.hasOwnProperty("relation")).to.equal(true);
            done();
        });
    });

    describe("resourceHasParent", () => {

        it("should throw an error if invalid resourceStore is given", (done) => {
            let error = null;
            try {
                FRBRooUtil.resourceHasParent(null, null);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            expect(error.message).to.equal("Invalid resourceStore");
            done();
        });

        it("should throw an error if no resource is given", (done) => {
            let error = null;
            try {
                FRBRooUtil.resourceHasParent(resourceStore, null);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            expect(error.message).to.equal("Invalid resource");
            done();
        });

        it("should throw an error if unknown resource is given", (done) => {
            let error = null;
            try {
                FRBRooUtil.resourceHasParent(resourceStore, "urn:unknown");
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            expect(error.message).to.equal("Unknown resource");
            done();
        });

        it("should return false if known resource has no parent", (done) => {
            let resource = "urn:vangogh/collection";
            let hasParent = FRBRooUtil.resourceHasParent(resourceStore, resource);
            expect(hasParent).to.equal(false);
            done();
        });

        it("should return true if known resource has parent", (done) => {
            let resource = "urn:vangogh/letter=001:para=1";
            let hasParent = FRBRooUtil.resourceHasParent(resourceStore, resource);
            expect(hasParent).to.equal(true);
            done();
        });
    });

    describe("indexExternalResources", () => {

        let rdfaResources = null;
        let representations = null;
        let externalResources = null;

        before((done) => {
            RDFaUtil.indexRDFa((error, index) => {
                rdfaResources = Object.keys(index.resources);
                representations = FRBRooUtil.mapRepresentedResources(resourceStore, rdfaResources);
                externalResources = Object.keys(representations).map((resource) => {
                    return representations[resource].parentResource;
                });
                done();
            });
        });

        it("should return an empty index if no resources are given", (done) => {
            let resources = [];
            let externalResourceIndex = FRBRooUtil.indexExternalResources(resourceStore, resources);
            expect(Object.keys(externalResourceIndex).length).to.equal(0);
            done();
        });

        it("should return an empty index if unknown resources are given", (done) => {
            let resources = ["urn:unknown"];
            let externalResourceIndex = FRBRooUtil.indexExternalResources(resourceStore, resources);
            expect(Object.keys(externalResourceIndex).length).to.equal(0);
            done();
        });

        it("should return an empty index if known resource has no related resource", (done) => {
            let translationLetter = "urn:vangogh/letter=001:repr=translation";
            let resources = [translationLetter];
            let externalResourceIndex = FRBRooUtil.indexExternalResources(resourceStore, resources);
            expect(Object.keys(externalResourceIndex).length).to.equal(0);
            done();
        });

        /*
        it("should return a non-empty index if known resource represents external resource", (done) => {
            let abstractLetter = "urn:vangogh/letter=001";
            let originalLetter = "urn:vangogh/letter=001:repr=original";
            let resources = [originalLetter];
            let externalResourceIndex = FRBRooUtil.indexExternalResources(resourceStore, resources);
            expect(Object.keys(externalResourceIndex).length).to.equal(1);
            done();
        });

        it("should have object as index entry if known resource represents external resource", (done) => {
            let abstractLetter = "urn:vangogh/letter=001";
            let originalLetter = "urn:vangogh/letter=001:repr=original";
            let resources = [originalLetter];
            let externalResourceIndex = FRBRooUtil.indexExternalResources(resourceStore, resources);
            expect(typeof externalResourceIndex[originalLetter]).to.equal("object");
            done();
        });

        it("should have parentResource property if known resource has index entry", (done) => {
            let abstractLetter = "urn:vangogh/letter=001";
            let originalLetter = "urn:vangogh/letter=001:repr=original";
            let resources = [originalLetter];
            let externalResourceIndex = FRBRooUtil.indexExternalResources(resourceStore, resources);
            let entry = externalResourceIndex[originalLetter];
            expect(entry.parentResource).to.equal(abstractLetter);
            done();
        });

        it("should have relation property if known resource has index entry", (done) => {
            let originalLetter = "urn:vangogh/letter=001:repr=original";
            let resources = [originalLetter];
            let externalResourceIndex = FRBRooUtil.indexExternalResources(resourceStore, externalResources);
            console.log(externalResourceIndex);
            let entry = externalResourceIndex[externalResources[0]];
            expect(entry.relation).to.exist;
            done();
        });
        */
    });

    describe("indexExternalParentResource", () => {

        it ("should throw an error is parentResource does not exist", (done) => {
            let error = null;
            let resource = "urn:unknown";
            let index = {};
            try {
                FRBRooUtil.indexExternalParentResource(resourceStore, index, resource);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            expect(error.message).to.equal("parentResource does not exist: " + resource);
            done();
        });

        it ("should not throw an error when existing resource is given", (done) => {
            let error = null;
            let abstractParagraph = "urn:vangogh/letter=001:para=1";
            let index = {};
            try {
                FRBRooUtil.indexExternalParentResource(resourceStore, index, abstractParagraph);
            } catch (err) {
                error = err;
            }
            expect(error).to.equal(null);
            done();
        });

        it ("should index resource", (done) => {
            let abstractLetter = "urn:vangogh/letter=001";
            let abstractParagraph = "urn:vangogh/letter=001:para=1";
            let index = {};
            FRBRooUtil.indexExternalParentResource(resourceStore, index, abstractParagraph);
            expect(index.hasOwnProperty(abstractParagraph)).to.equal(true);
            done();
        });

        it ("should recursively index parent of resource", (done) => {
            let abstractLetter = "urn:vangogh/letter=001";
            let abstractParagraph = "urn:vangogh/letter=001:para=1";
            let index = {};
            FRBRooUtil.indexExternalParentResource(resourceStore, index, abstractParagraph);
            expect(index.hasOwnProperty(abstractLetter)).to.equal(true);
            done();
        });

        it ("should index top resource ", (done) => {
            let abstractCollection = "urn:vangogh/collection";
            let abstractParagraph = "urn:vangogh/letter=001:para=1";
            let index = {};
            FRBRooUtil.indexExternalParentResource(resourceStore, index, abstractParagraph);
            expect(index.hasOwnProperty(abstractCollection)).to.equal(true);
            done();
        });

        it ("should index top resource without parentResource", (done) => {
            let abstractCollection = "urn:vangogh/collection";
            let abstractParagraph = "urn:vangogh/letter=001:para=1";
            let index = {};
            FRBRooUtil.indexExternalParentResource(resourceStore, index, abstractParagraph);
            expect(index[abstractCollection].hasOwnProperty("parentResource")).to.equal(false);
            done();
        });
    });

    describe("createBreadcrumbTrail", () => {

        let abstractLetter = "urn:vangogh/letter=001";
        let abstractParagraph = "urn:vangogh/letter=001:para=1";
        let resources = [abstractLetter, abstractParagraph];

        it("should throw an error if resource does not exist", (done) => {
            let resource = "urn:unknown";
            let error = null;
            AnnotationActions.indexExternalResources(resources, (error) => {
                try {
                    FRBRooUtil.createBreadcrumbTrail(AnnotationStore.externalResourceIndex, resource);
                } catch (err) {
                    error = err;
                }
                expect(error).to.not.equal(null);
                expect(error.message).to.equal("Invalid resource");
                done();
            });
        });

        it("should not throw an error if resource does exist", (done) => {
            let resource = "urn:unknown";
            let error = null;
            AnnotationActions.indexExternalResources(resources, (error) => {
                try {
                    FRBRooUtil.createBreadcrumbTrail(AnnotationStore.externalResourceIndex, abstractParagraph);
                } catch (err) {
                    error = err;
                }
                expect(error).to.equal(null);
                done();
            });
        });

        it("should return an array if resource exists", (done) => {
            AnnotationActions.indexExternalResources(resources, (error) => {
                let breadcrumbTrail = FRBRooUtil.createBreadcrumbTrail(AnnotationStore.externalResourceIndex, abstractParagraph);
                expect(breadcrumbTrail).to.not.equal(null);
                expect(Array.isArray(breadcrumbTrail)).to.equal(true);
                done();
            });
        });
    });
});



