
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
    let vocabulary = "http://boot.huygens.knaw.nl/vgdemo/vangoghannotationontology.ttl#";
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
    let vocabulary = "http://boot.huygens.knaw.nl/vgdemo/vangoghannotationontology.ttl#";
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
@prefix hi: <http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#> .
@prefix vg: <http://boot.huygens.knaw.nl/vgdemo/vangoghannotationontology.ttl#> .
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
            done();
        });

        afterEach((done) => {
            mockServer.stop();
            done();
        });

        it("should return null when relations file does not exist", (done) => {
            let url = "http://localhost:3001/doesnotexist";
            mockServer.get("/doesnotexist").thenReply(404, "not found").then(() => {
                let frbrooRelations = FRBRooUtil.readExternalResources(url, (error, frbrooRelations) => {
                    expect(error).to.not.equal(null);
                    expect(frbrooRelations).to.equal(null);
                    done();
                });
            });
        });

        it("should return an RDFLib store when relations file does exist", (done) => {
            let url = "http://localhost:3001/frbroo_alternate.ttl";
            mockServer.get("/frbroo_alternate.ttl").thenReply(200, frbrooRelationsString).then(() => {
                let frbrooRelations = FRBRooUtil.readExternalResources(url, (error, frbrooRelations) => {
                    expect(error).to.equal(null);
                    expect(frbrooRelations).to.equal(frbrooRelationsString);
                    done();
                });
            });
        });

    });

    describe("storeExternalResources", () => {

        it("should have store", (done) => {
            let baseURI = "http://localhost:3001/frbroo_alternate.ttl";
            let mimeType = "text/n3";
            FRBRooUtil.storeExternalResources("", baseURI, mimeType);
            expect(FRBRooUtil.store).to.not.be.undefined;
            done();
        });

        it("should find Letter resource", (done) => {
            let resourceType = "http://boot.huygens.knaw.nl/vgdemo/vangoghannotationontology.ttl#Letter";
            let predicate = FRBRooUtil.RDF('type');
            let baseURI = "http://localhost:3001/frbroo_alternate.ttl";
            let mimeType = "text/n3";
            FRBRooUtil.storeExternalResources(frbrooRelationsString, baseURI, mimeType);
            let object = $rdf.sym(resourceType);
            let subject = FRBRooUtil.store.any(undefined, predicate, object);
            expect(subject.uri).to.equal("urn:vangogh/letter=001")
            done();
        });
    });

    describe("findExternalSubjectRelations", () => {

        it("should return null if unknown object is given", (done) => {
            let resource = "urn:unknown";
            let relations = FRBRooUtil.findExternalSubjectRelations(resource, undefined);
            expect(relations.length).to.equal(0);
            done();
        });

        it("should return representation objects and represented object type if represented of object is given", (done) => {
            let abstractResource = "urn:vangogh/letter=001";
            let originalResource = "urn:vangogh/letter=001:repr=original";
            let transcriptResource = "urn:vangogh/letter=001:repr=transcript";
            let abstractType = "http://boot.huygens.knaw.nl/vgdemo/vangoghannotationontology.ttl#Letter";
            let relations = FRBRooUtil.findExternalSubjectRelations(abstractResource, undefined);
            let objects = relations.map((relation) => { return relation.object.value });
            expect(relations.length).to.equal(3);
            expect(objects).to.include(originalResource);
            expect(objects).to.include(transcriptResource);
            expect(objects).to.include(abstractType);
            done();
        });

        it("should return no relations if represented object and unknown relation are given", (done) => {
            let originalResource = "urn:vangogh/letter=001:repr=original";
            let abstractResource = "urn:vangogh/letter=001";
            let relation = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#hasUnkownRelation";
            let relations = FRBRooUtil.findExternalSubjectRelations(abstractResource, relation);
            expect(relations.length).to.equal(0);
            done();
        });

        it("should return represented object if representation of object and relation are given", (done) => {
            let originalResource = "urn:vangogh/letter=001:repr=original";
            let transcriptResource = "urn:vangogh/letter=001:repr=transcript";
            let abstractResource = "urn:vangogh/letter=001";
            let relation = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#hasRepresentation";
            let relations = FRBRooUtil.findExternalSubjectRelations(abstractResource, relation);
            expect(relations.length).to.equal(2);
            let objects = relations.map((relation) => { return relation.object.value });
            expect(objects).to.include(originalResource);
            expect(objects).to.include(transcriptResource);
            done();
        });
    });

    describe("findExternalObjectRelations", () => {

        it("should return null if unknown object is given", (done) => {
            let resource = "urn:unknown";
            let relations = FRBRooUtil.findExternalObjectRelations(resource, undefined);
            expect(relations.length).to.equal(0);
            done();
        });

        it("should return abstract object if representation of object is given", (done) => {
            let originalResource = "urn:vangogh/letter=001:repr=original";
            let abstractResource = "urn:vangogh/letter=001";
            let relations = FRBRooUtil.findExternalObjectRelations(originalResource, undefined);
            expect(relations.length).to.equal(1);
            expect(relations[0].subject.value).to.equal(abstractResource)
            done();
        });

        it("should return no relations if representation of object and unknown relation are given", (done) => {
            let originalResource = "urn:vangogh/letter=001:repr=original";
            let abstractResource = "urn:vangogh/letter=001";
            let relation = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#hasUnkownRelation";
            let relations = FRBRooUtil.findExternalObjectRelations(originalResource, relation);
            expect(relations.length).to.equal(0);
            done();
        });

        it("should return represented object if representation of object and relation are given", (done) => {
            let originalResource = "urn:vangogh/letter=001:repr=original";
            let abstractResource = "urn:vangogh/letter=001";
            let relation = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#hasRepresentation";
            let relations = FRBRooUtil.findExternalObjectRelations(originalResource, relation);
            expect(relations.length).to.equal(1);
            expect(relations[0].subject.value).to.equal(abstractResource);
            expect(relations[0].predicate.value).to.equal(relation);
            done();
        });
    });

    describe("findExternalResources", () => {

        beforeEach((done) => {
            let baseURI = "http://localhost:3001/frbroo_alternate.ttl";
            let mimeType = "text/n3";
            FRBRooUtil.storeExternalResources(frbrooRelationsString, baseURI, mimeType);
            done();
        });

        it("should return empty list for unknown resources", (done) => {
            let original = "urn:unknown";
            let relatedResources = FRBRooUtil.findExternalResources(original);
            expect(relatedResources).to.not.equal(null);
            expect(relatedResources.length).to.equal(0);
            done();
        });

        it("should find abstract letter for original representation", (done) => {
            let originalLetter = "urn:vangogh/letter=001:repr=original";
            let abstractLetter = "urn:vangogh/letter=001";
            let relatedResources = FRBRooUtil.findExternalResources(originalLetter);
            expect(relatedResources.length).to.equal(1);
            expect(relatedResources[0].subject.value).to.equal(abstractLetter);
            done();
        });

        it("should return abstractLetter letter for list of resources", (done) => {
            let originalLetter = "urn:vangogh/letter=001:repr=original";
            let transcriptLetter = "urn:vangogh/letter=001:repr=transcript";
            let abstractLetter = "urn:vangogh/letter=001";
            let resources = [originalLetter, transcriptLetter];
            let relatedResources = FRBRooUtil.findExternalResources(resources);
            expect(relatedResources.length).to.equal(2);
            expect(relatedResources[0].subject.value).to.equal(abstractLetter);
            expect(relatedResources[1].subject.value).to.equal(abstractLetter);
            done();
        });

        it("should return abstractLetter letter for list of resources and known relation type", (done) => {
            let originalLetter = "urn:vangogh/letter=001:repr=original";
            let transcriptLetter = "urn:vangogh/letter=001:repr=transcript";
            let abstractLetter = "urn:vangogh/letter=001";
            let relationType = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#hasRepresentation";
            let resources = [originalLetter, transcriptLetter];
            let relatedResources = FRBRooUtil.findExternalResources(resources, relationType);
            expect(relatedResources.length).to.equal(2);
            expect(relatedResources[0].subject.value).to.equal(abstractLetter);
            expect(relatedResources[1].subject.value).to.equal(abstractLetter);
            done();
        });

        it("should return empty list for list of resources and unknown relation type", (done) => {
            let originalLetter = "urn:vangogh/letter=001:repr=original";
            let transcriptLetter = "urn:vangogh/letter=001:repr=transcript";
            let abstractLetter = "urn:vangogh/letter=001";
            let relationType = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#hasTranslation";
            let resources = [originalLetter, transcriptLetter];
            let relatedResources = FRBRooUtil.findExternalResources(resources, relationType);
            expect(relatedResources.length).to.equal(0);
            done();
        });

        it("should return ignore non-existing resrouce in resource list", (done) => {
            let unknownResource = "urn:unknown";
            let transcriptLetter = "urn:vangogh/letter=001:repr=transcript";
            let abstractLetter = "urn:vangogh/letter=001";
            let resources = [unknownResource, transcriptLetter];
            let relatedResources = FRBRooUtil.findExternalResources(resources);
            expect(relatedResources.length).to.equal(1);
            expect(relatedResources[0].subject.value).to.equal(abstractLetter);
            done();
        });
    });

    describe("addResourceTypeProperty", () => {

        it("should add no type if no type is given", (done) => {
            let properties = {};
            FRBRooUtil.addResourceTypeProperty(properties, null);
            expect(properties.hasOwnProperty("rdfaType")).to.equal(false);
            done();
        });

        it("should add type as string if no previous type is given", (done) => {
            let properties = {};
            let resourceType = "http://boot.huygens.knaw.nl/vgdemo/vangoghannotationontology.ttl#Letter";
            FRBRooUtil.addResourceTypeProperty(properties, resourceType);
            expect(properties.hasOwnProperty("rdfaType")).to.equal(true);
            expect(properties.rdfaType).to.equal(resourceType);
            done();
        });

        it("should throw error if properties.rdfaType is not array or string", (done) => {
            let properties = {rdfaType: {someProp: "someValue"}};
            let resourceType = "http://boot.huygens.knaw.nl/vgdemo/vangoghannotationontology.ttl#Letter";
            var error = null;
            try {
                FRBRooUtil.addResourceTypeProperty(properties, resourceType);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            done();
        });

        it("should change rdfaType to Array if single previous type is given", (done) => {
            var resourceType = "http://boot.huygens.knaw.nl/vgdemo/vangoghannotationontology.ttl#Letter";
            let properties = {rdfaType: resourceType};
            var resourceType = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#Work";
            FRBRooUtil.addResourceTypeProperty(properties, resourceType);
            expect(Array.isArray(properties.rdfaType)).to.equal(true);
            done();
        });

        it("should add resourceType to Array if single previous type is given", (done) => {
            var resourceType = "http://boot.huygens.knaw.nl/vgdemo/vangoghannotationontology.ttl#Letter";
            let properties = {rdfaType: [resourceType]};
            var resourceType = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#Work";
            FRBRooUtil.addResourceTypeProperty(properties, resourceType);
            expect(Array.isArray(properties.rdfaType)).to.equal(true);
            expect(properties.rdfaType.length).to.equal(2);
            done();
        });
    });

    describe("gatherResourceProperties", () => {

        it("should return null for unknown resources", (done) => {
            let resource = "urn:unknown";
            let properties = FRBRooUtil.gatherResourceProperties(resource);
            expect(properties).to.equal(null);
            done();
        });

        it("should find Letter property for abstract letter", (done) => {
            let resource = "urn:vangogh/letter=001";
            var resourceType = "http://boot.huygens.knaw.nl/vgdemo/vangoghannotationontology.ttl#Letter";
            let properties = FRBRooUtil.gatherResourceProperties(resource);
            expect(properties.hasOwnProperty("rdfaType")).to.equal(true);
            expect(properties.rdfaType).to.equal(resourceType);
            done();
        });
    });

    describe("isRDFTriple", () => {

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
            let relation = FRBRooUtil.store.statementsMatching(undefined, FRBRooUtil.RDF('type'))[0];
            expect(FRBRooUtil.isRDFTriple(relation)).to.equal(true);
            done();
        });
    });

    describe("addIndexEntry", () => {

        it("should throw an error if no index is given", (done) => {
            let index = {};
            let resource = "urn:vangogh/letter=001";
            let relation = FRBRooUtil.store.statementsMatching($rdf.sym(resource), FRBRooUtil.RDF('type'))[0];
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
            let relation = FRBRooUtil.store.statementsMatching($rdf.sym(resource), FRBRooUtil.RDF('type'))[0];
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
            let relation = FRBRooUtil.store.statementsMatching($rdf.sym(resource), FRBRooUtil.RDF('type'))[0];
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
            let relation = FRBRooUtil.store.statementsMatching($rdf.sym(resource), FRBRooUtil.RDF('type'))[0];
            FRBRooUtil.addIndexEntry(index, resource, relation);
            expect(index.hasOwnProperty(resource)).to.equal(true);
            done();
        });

        it("should thrown an error if RDF relation does not contain resource", (done) => {
            let index = {};
            let resource = "urn:vangogh/letter=001";
            let otherResource = "urn:unknown";
            let relation = FRBRooUtil.store.statementsMatching($rdf.sym(resource), FRBRooUtil.RDF('type'))[0];
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

    describe("indexExternalResources", () => {

        it("should return an empty index if no resources are given", (done) => {
            let resources = [];
            let relatedResourceIndex = FRBRooUtil.indexExternalResources(resources, null);
            expect(Object.keys(relatedResourceIndex).length).to.equal(0);
            done();
        });

        it("should return an empty index if unknown resources are given", (done) => {
            let resources = ["urn:unknown"];
            let relatedResourceIndex = FRBRooUtil.indexExternalResources(resources, null);
            expect(Object.keys(relatedResourceIndex).length).to.equal(0);
            done();
        });

        it("should return an empty index if known resource has no related resource", (done) => {
            let translationLetter = "urn:vangogh/letter=001:repr=translation";
            let resources = [translationLetter];
            let relatedResourceIndex = FRBRooUtil.indexExternalResources(resources, null);
            expect(Object.keys(relatedResourceIndex).length).to.equal(0);
            done();
        });

        it("should return a non-empty index if known resource has related resource", (done) => {
            let abstractLetter = "urn:vangogh/letter=001";
            let originalLetter = "urn:vangogh/letter=001:repr=original";
            let relationType = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#hasRepresentation";
            let resources = [originalLetter];
            let relatedResourceIndex = FRBRooUtil.indexExternalResources(resources, relationType);
            expect(Object.keys(relatedResourceIndex).length).to.equal(1);
            let entries = relatedResourceIndex[originalLetter];
            expect(entries.length).to.equal(1);
            expect(entries[0].relatedResource).to.equal(abstractLetter);
            expect(entries[0].relation).to.equal(relationType);
            done();
        });
    });

    describe("indexRepresentedResources", () => {

        it("should return an empty index if no resources are given", (done) => {
            let resources = [];
            let representedResourceIndex = FRBRooUtil.indexRepresentedResources(resources, null);
            expect(Object.keys(representedResourceIndex).length).to.equal(0);
            done();
        });

        it("should return an empty index if unknown resources are given", (done) => {
            let resources = ["urn:unknown"];
            let representedResourceIndex = FRBRooUtil.indexRepresentedResources(resources, null);
            expect(Object.keys(representedResourceIndex).length).to.equal(0);
            done();
        });

        it("should return an empty index if known resource has no represented resource", (done) => {
            let translationLetter = "urn:vangogh/letter=001:repr=translation";
            let resources = [translationLetter];
            let representedResourceIndex = FRBRooUtil.indexRepresentedResources(resources, null);
            expect(Object.keys(representedResourceIndex).length).to.equal(0);
            done();
        });

        it("should return a non-empty index if known resource has represented resource", (done) => {
            let abstractLetter = "urn:vangogh/letter=001";
            let originalLetter = "urn:vangogh/letter=001:repr=original";
            let hasRepresentation = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#hasRepresentation";
            let resources = [originalLetter];
            let representedResourceIndex = FRBRooUtil.indexRepresentedResources(resources);
            expect(Object.keys(representedResourceIndex).length).to.equal(1);
            let entries = representedResourceIndex[originalLetter];
            expect(entries.length).to.equal(1);
            expect(entries[0].relatedResource).to.equal(abstractLetter);
            expect(entries[0].relation).to.equal(hasRepresentation);
            done();
        });
    });

    describe("checkExternalResources", () => {

        beforeEach((done) => {
            mockServer.start((3001));
            FRBRooUtil.store = null;
            done();
        });

        afterEach((done) => {
            mockServer.stop();
            done();
        });

        it("should do nothing if no external resources are specified", (done) => {
            loadPlainPage();
            mockServer.get("/frbroo_alternate.ttl").thenReply(200, frbrooRelationsString).then(() => {
                FRBRooUtil.checkExternalResources((error, doIndexing) => {
                    expect(error).to.equal(null);
                    expect(doIndexing).to.deep.equal(false);
                    done();
                });
            });
        });

        it("should store relations if external resources are specified", (done) => {
            loadRDFaPage();
            mockServer.get("/frbroo_alternate.ttl").thenReply(200, frbrooRelationsString).then(() => {
                FRBRooUtil.checkExternalResources((error, doIndexing) => {
                    expect(error).to.equal(null);
                    expect(doIndexing).to.deep.equal(true);
                    expect(FRBRooUtil.store).to.not.equal(null);
                    done();
                });
            });
        });
    });
});


