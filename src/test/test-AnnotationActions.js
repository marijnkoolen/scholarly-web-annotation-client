
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

describe("AnnotationActions", () => {

    describe("indexResources", (done) => {

        beforeEach((done) => {
            loadRDFaPage();
            done();
        });

        it("should index letter representation", (done) => {
            let originalResource = "urn:vangogh/letter=001:repr=original";
            let abstractResource = "urn:vangogh/letter=001";
            AnnotationActions.indexResources((error) => {
                expect(Object.keys(AnnotationStore.resourceIndex).length).to.equal(2);
                expect(AnnotationStore.resourceIndex.hasOwnProperty(originalResource)).to.equal(true);
                done();
            });
        })
    });

    describe("indexExternalResources", (done) => {

        beforeEach((done) => {
            loadRDFaPage();
            mockServer.start((3001));
            FRBRooUtil.store = null;
            done();
        });

        afterEach((done) => {
            mockServer.stop();
            done();
        });

        it("should index abstract letter", (done) => {
            let originalResource = "urn:vangogh/letter=001:repr=original";
            let transcriptResource = "urn:vangogh/letter=001:repr=transcript";
            let resources = [originalResource, transcriptResource];
            mockServer.get("/frbroo_alternate.ttl").thenReply(200, frbrooRelationsString).then(() => {
                AnnotationActions.indexExternalResources(resources, (error) => {
                    expect(AnnotationStore.externalResourceIndex).to.exist;
                    expect(Object.keys(AnnotationStore.externalResourceIndex).length).to.equal(2);
                    expect(AnnotationStore.externalResourceIndex.hasOwnProperty(originalResource)).to.equal(true);
                    done();
                });
            });
        })
    });
});


