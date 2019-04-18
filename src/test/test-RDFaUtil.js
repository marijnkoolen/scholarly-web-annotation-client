
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
import TargetUtil from "../util/TargetUtil.js";
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



var loadTestletter = () => {
    let htmlSource = fs.readFileSync("public/testletter.html");
    const jsdomConfig = {url: "http://localhost:3001/testletter"}
    let dom = new JSDOM(htmlSource, jsdomConfig);
    global.document = dom.window.document;
    global.window = dom.window;
};

var loadTestletter2 = () => {
    let htmlSource = fs.readFileSync("public/testletter2.html");
    const jsdomConfig = {url: "http://localhost:3001/testletter2"}
    let dom = new JSDOM(htmlSource, jsdomConfig);
    global.document = dom.window.document;
    global.window = dom.window;
};

var loadFRBRLetter = () => {
    let htmlSource = fs.readFileSync("public/vgdemo/original.html");
    const jsdomConfig = {url: "http://localhost:3001/vgdemo/original"}
    let dom = new JSDOM(htmlSource, jsdomConfig);
    global.document = dom.window.document;
    global.window = dom.window;
};

var loadNonRDFaPage = () => {
    let htmlSource = "<body><div>Hello</div></body>";
    loadPage(htmlSource);
}

var loadDoubleAbout = () => {
    let vocabulary = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#";
    let htmlSource = `
    <body class=\"annotation-target-observer\" vocab=${vocabulary}>
        <div about=\"urn:vangogh:let001\" typeof=\"Letter\">Hello</div>
        <div about=\"urn:vangogh:let002\" typeof=\"Letter\">Goodbye</div>
    </body>`;
    loadPage(htmlSource);
    let observerNodes = document.getElementsByClassName("annotation-target-observer");
    RDFaUtil.setObserverNodes(observerNodes);
}

var loadPage = (htmlSource) => {
    const jsdomConfig = {url: "http://localhost:3001/"}
    let dom = new JSDOM(htmlSource, jsdomConfig);
    global.document = dom.window.document;
    global.window = dom.window;
}

var loadIgnorable = () => {
    let htmlSource = `
    <body class=\"annotation-target-observer\" prefix="hi: http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#">
        <div id="non-prefix" typeof=\"IgnorableElement\">bad ignore</div>
        <div id="prefix" typeof=\"hi:IgnorableElement\">prefixed ignore</div>
        <div id="full-url" typeof=\"http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#IgnorableElement\">full ignore</div>
        <div id="vocab" vocab="http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#">
            <div id="vocab-non-prefix" typeof=\"IgnorableElement\">vocab ignore</div>
            <div>Some text with <span id="ignore-span-1" typeof=\"hi:IgnorableElement\">one</span> and <span id="ignore-span-2" typeof=\"hi:IgnorableElement\">two</span> ignorable elements.</div>
        </div>
    </body>`;
    const jsdomConfig = {url: "http://localhost:3001/"}
    let dom = new JSDOM(htmlSource, jsdomConfig);
    global.document = dom.window.document;
    global.window = dom.window;
    let observerNodes = document.getElementsByClassName("annotation-target-observer");
    let a = document.getElementsByTagName("div");
    RDFaUtil.setObserverNodes(observerNodes);
}

describe("RDFaUtil parsing HTML with ignorable elements", () => {

    beforeEach((done) => {
        loadIgnorable();
        done();
    });

    it("setIgnoreNodes should ignore non-prefixed literal IgnorableElement", (done) => {
        var vocab = null;
        var prefixIndex = {hi: "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#"};
        let div = document.getElementById("non-prefix");
        RDFaUtil.setIgnoreNodes(div, vocab, prefixIndex);
        let isIgnored = RDFaUtil.isRDFaIgnoreNode(div);
        expect(isIgnored).to.equal(false);
        done();
    });

    it("setIgnoreNodes should set prefixed literal IgnorableElement as ignore node", (done) => {
        var vocab = null;
        var prefixIndex = {hi: "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#"};
        let div = document.getElementById("prefix");
        RDFaUtil.setIgnoreNodes(div, vocab, prefixIndex);
        let isIgnored = RDFaUtil.isRDFaIgnoreNode(div);
        expect(isIgnored).to.equal(true);
        done();
    });

    it("setIgnoreNodes should set full URL IgnorableElement as ignore node", (done) => {
        var vocab = null;
        var prefixIndex = {hi: "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#"};
        let div = document.getElementById("full-url");
        RDFaUtil.setIgnoreNodes(div, vocab, prefixIndex);
        let isIgnored = RDFaUtil.isRDFaIgnoreNode(div);
        expect(isIgnored).to.equal(true);
        done();
    });

    it("setIgnoreNodes should set non-prefixed literal IgnorableElement with vocabulary as ignore node", (done) => {
        var vocab = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#";
        var prefixIndex = {hi: "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#"};
        let div = document.getElementById("vocab-non-prefix");
        RDFaUtil.setIgnoreNodes(div, vocab, prefixIndex);
        let isIgnored = RDFaUtil.isRDFaIgnoreNode(div);
        expect(isIgnored).to.equal(true);
        done();
    });

    it("setIgnoreNodes should set child node with non-prefixed literal IgnorableElement of vocabulary node as ignore node", (done) => {
        var vocab = null;
        var prefixIndex = {hi: "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#"};
        let vocabDiv = document.getElementById("vocab");
        let ignoreDiv = document.getElementById("vocab-non-prefix");
        RDFaUtil.setIgnoreNodes(vocabDiv, vocab, prefixIndex);
        let isIgnored = RDFaUtil.isRDFaIgnoreNode(ignoreDiv);
        expect(isIgnored).to.equal(true);
        done();
    });

    it("setIgnoreNodes should set all child nodes with IgnorableElement of vocabulary node as ignore node", (done) => {
        var vocab = null;
        var prefixIndex = {hi: "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#"};
        let vocabDiv = document.getElementById("vocab");
        RDFaUtil.setIgnoreNodes(vocabDiv, vocab, prefixIndex);
        let ignoreSpan1 = document.getElementById("ignore-span-1");
        let ignoreSpan2 = document.getElementById("ignore-span-2");
        expect(RDFaUtil.isRDFaIgnoreNode(ignoreSpan1)).to.equal(true);
        expect(RDFaUtil.isRDFaIgnoreNode(ignoreSpan2)).to.equal(true);
        done();
    });

    it("resetIgnoreNodes should ignore non-prefixed literal IgnorableElement", (done) => {
        RDFaUtil.resetIgnoreNodes();
        let div = document.getElementById("non-prefix");
        let isIgnored = RDFaUtil.isRDFaIgnoreNode(div);
        expect(isIgnored).to.equal(false);
        done();
    });

    it("resetIgnoreNodes should identify prefixed literal hi:IgnorableElement as ignorable", (done) => {
        RDFaUtil.resetIgnoreNodes();
        let div = document.getElementById("prefix");
        let isIgnored = RDFaUtil.isRDFaIgnoreNode(div);
        expect(isIgnored).to.equal(true);
        done();
    });

    it("resetIgnoreNodes should identify full IgnorableElement URL as ignorable", (done) => {
        RDFaUtil.resetIgnoreNodes();
        let div = document.getElementById("full-url");
        let isIgnored = RDFaUtil.isRDFaIgnoreNode(div);
        expect(isIgnored).to.equal(true);
        done();
    });

    it("resetIgnoreNodes should identify non-prefixed vocab-specified IgnorableElement URL as ignorable", (done) => {
        RDFaUtil.resetIgnoreNodes();
        let div = document.getElementById("vocab-non-prefix");
        let isIgnored = RDFaUtil.isRDFaIgnoreNode(div);
        expect(isIgnored).to.equal(true);
        done();
    });

    it("expandRDFaTerm should return none if no term is given", (done) => {
        var vocab = null;
        var prefixIndex = {hi: "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#"};
        var rdfaTerm = null;
        let expandedTerm = RDFaUtil.expandRDFaTerm(rdfaTerm, vocab, prefixIndex);
        expect(expandedTerm).to.equal(null);
        done();
    });

    it("expandRDFaTerm should return none if unexpandable term is given", (done) => {
        var vocab = null;
        var prefixIndex = {hi: "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#"};
        var rdfaTerm = "IgnorableElement";
        let expandedTerm = RDFaUtil.expandRDFaTerm(rdfaTerm, vocab, prefixIndex);
        expect(expandedTerm).to.equal(null);
        done();
    });

    it("expandRDFaTerm should return none if prefixed term with unknown prefix is given", (done) => {
        var vocab = null;
        var prefixIndex = {hi: "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#"};
        var rdfaTerm = "vg:IgnorableElement";
        let expandedTerm = RDFaUtil.expandRDFaTerm(rdfaTerm, vocab, prefixIndex);
        expect(expandedTerm).to.equal(null);
        done();
    });

    it("expandRDFaTerm should return URL if non-prefixed term and vocabulary are given", (done) => {
        var vocab = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#";
        var prefixIndex = {};
        var rdfaTerm = "IgnorableElement";
        let expandedTerm = RDFaUtil.expandRDFaTerm(rdfaTerm, vocab, prefixIndex);
        expect(expandedTerm).to.equal("http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#IgnorableElement");
        done();
    });

    it("expandRDFaTerm should return URL if prefixed term with known prefix is given", (done) => {
        var vocab = null;
        var prefixIndex = {hi: "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#"};
        var rdfaTerm = "hi:IgnorableElement";
        let expandedTerm = RDFaUtil.expandRDFaTerm(rdfaTerm, vocab, prefixIndex);
        expect(expandedTerm).to.equal("http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#IgnorableElement");
        done();
    });

});

describe("RDFaUtil getting RDF Type URLs", () => {
    it("should return an error when non-URL label is passed without vocabulary", (done) => {
        let vocabulary = null;
        let labels = ["ParagraphInLetter"];
        let prefixIndex = {};
        let typeURLs = RDFaUtil.getTypeURLs(labels, vocabulary, prefixIndex);
        expect(typeURLs[0]).to.equal(null);
        done();
    });

})

describe("RDFaUtil parsing page with multiple abouts", () => {

    before((done) => {
        loadDoubleAbout();
        done();
    });

    // getRDFaTopNodes
    it("should find two top nodes", (done) => {
        let topNodes = RDFaUtil.getTopRDFaNodes(global.document);
        expect(topNodes.length).to.equal(2);
        done();
    });

    it("should index two nodes", (done) => {
        RDFaUtil.indexRDFa((error, index) => {
            expect(error).to.equal(null);
            let resources = Object.keys(index.resources);
            expect(index.resources).to.have.property("urn:vangogh:let001");
        });
        done();
    });

    it("should use vocab defined at higher level correctly", (done) => {
        RDFaUtil.indexRDFa((error, index) => {
            let vocabulary = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#";
            expect(error).to.equal(null);
            let resources = Object.keys(index.resources);
            expect(index.resources).to.have.property("urn:vangogh:let001");
            let resource = index.resources["urn:vangogh:let001"];
            expect(resource.rdfTypeURL[0]).to.equal(vocabulary + resource.rdfTypeLabel);
        });
        done();
    });
})

describe("RDFaUtil extracting relations", () => {

    var resourceEntry = {
        rdfaResource: "urn:vangogh:letter:001.para.7.original",
        rdfaVocabulary: [ "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#" ],
        domNode: null,
        rdfType: [ "hi:EditionText" ],
        rdfTypeURIs: [ "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#EditionText" ],
        rdfaProperty: "hasTextPart",
        text: "Vincent",
        parentResource: "urn:vangogh:letter:001.para.6.original"
    }

    var incompleteEntry = {
        rdfaResource: undefined,
        rdfaProperty: "hasTextPart",
        parentResource: "urn:vangogh:letter:001.para.6.original"
    }

    it("should throw an error when properties are undefined", (done) => {
        done();
    });
});

describe("RDFaUtil parse of non-RDFa-enriched page", () => {

    before((done) => {
        loadNonRDFaPage();
        done();
    });

    it("should not find any RDFa resources", (done) => {
        let topNodes = RDFaUtil.getTopRDFaNodes(document);
        expect(topNodes.length).to.equal(0);
        done();
    });

});

describe("RDFaUtil parse of FRBR letter", () => {

    before((done) => {
        loadFRBRLetter();
        done();
    });

    it("should find Letter as top node", (done) => {
        let topNodes = RDFaUtil.getTopRDFaNodes(document);
        expect(topNodes.length).to.equal(1);
        let rdfaAttributes = RDFaUtil.getRDFaAttributes(topNodes[0]);
        expect(rdfaAttributes.about).to.not.be.undefined;
        expect(rdfaAttributes.typeof).to.equal("Letter");
        done();
    });

    it("should find prefix in top node", (done) => {
        let topNodes = RDFaUtil.getTopRDFaNodes(document);
        expect(RDFaUtil.hasRDFaPrefix(topNodes[0])).to.be.true;
        let rdfaAttributes = RDFaUtil.getRDFaAttributes(topNodes[0]);
        expect(rdfaAttributes.prefix).to.not.be.undefined;
        done();
    });

    it("should be able to parse prefix in top node", (done) => {
        let topNodes = RDFaUtil.getTopRDFaNodes(document);
        expect(RDFaUtil.hasRDFaPrefix(topNodes[0])).to.be.true;
        let prefix = RDFaUtil.getRDFaPrefix(topNodes[0]);
        expect(prefix.length).to.equal(1);
        expect(prefix[0].vocabularyPrefix).to.equal("hi");
        done();
    });

    it("should find prefixes in RDFa-enriched nodes", (done) => {
        let topNodes = RDFaUtil.getTopRDFaNodes(document);
        let rdfaAttributes = RDFaUtil.getRDFaAttributes(topNodes[0]);
        expect(rdfaAttributes.prefix).to.not.be.undefined;
        done();
    });

    describe("when indexing resource", () => {

        before((done) => {
            let observerNodes = document.getElementsByClassName("annotation-target-observer");
            RDFaUtil.setObserverNodes(observerNodes);
            done();
        });

        it("should find EditionText in index", (done) => {
            let typeOf = "hi:EditionText";
            let resourceId = "urn:vangogh:letter:001.original";
            RDFaUtil.indexRDFa((error, index) => {
                expect(error).to.equal(null);
                expect(index).to.not.equal(null);
                expect(index.resources).to.not.equal(null);
                let entry = index.resources[resourceId];
                expect(entry).to.not.be.undefined;
                expect(entry.rdfaResource).to.equal(resourceId);
                done();
            });
        });
    });

    describe("after indexing resource", () => {

        before((done) => {
            let observerNodes = document.getElementsByClassName("annotation-target-observer");
            RDFaUtil.setObserverNodes(observerNodes);
            done();
        });

        it("should be able to extract relations", (done) => {
            let typeOf = "hi:EditionText";
            let resourceId = "urn:vangogh:letter:001.original";
            RDFaUtil.indexRDFa((error, index) => {
                expect(error).to.equal(null);
                expect(index.relations).to.not.equal(null);
                expect(index.relations[resourceId]).to.not.be.undefined;
                let relations = index.relations[resourceId];
                expect(relations).to.not.be.undefined;
                expect(relations.length).to.not.equal(0);
                done();
            });
        });
    });
});

describe("RDFaUtil parse of test letter. ", () => {

    beforeEach((done) => {
        loadTestletter();
        let observerNodes = document.getElementsByClassName("annotation-target-observer");
        RDFaUtil.setObserverNodes(observerNodes);
        done();
    });

    describe("getTopRDFaResources", () => {

        it("should return letter as top level resource", (done) => {
            let topResources = RDFaUtil.getTopRDFaResources();
            expect(topResources).to.contain("urn:vangogh:testletter");
            done();
        });
    });

    describe("getRDFaAttributes", () => {

        it("should return a vocabulary reference for top level resources", (done) => {
            RDFaUtil.observerNodes.forEach((observerNode) => {
                let topResourceNodes = RDFaUtil.getTopRDFaNodes(observerNode);
                topResourceNodes.forEach((topResourceNode) => {
                    let attrs = RDFaUtil.getRDFaAttributes(topResourceNode);
                    expect(attrs.vocab).to.exist;
                });
            });
            done();
        });
    });

    describe("indexRDFa", () => {

        var index = null;

        before((done) => {
            RDFaUtil.indexRDFa((error, newIndex) => {
                index = newIndex;
                done();
            });
        });

        it("should return an index containing URNs of sender and receiver", (done) => {
            expect(index.resources["urn:vangogh:testletter.sender"]).to.exist;
            expect(index.resources["urn:vangogh:testletter.receiver"]).to.exist;
            done();
        });
    });

});

describe("RDFaUtil parse of test letter 2. ", () => {

    var index = null;

    before((done) => {
        loadTestletter2();
        let observerNodes = document.getElementsByClassName("annotation-target-observer");
        RDFaUtil.setObserverNodes(observerNodes);
        RDFaUtil.indexRDFa((error, newIndex) => {
            index = newIndex;
            done();
        });
    });

    describe("getTopRDFaResources", () => {

        it("should return two letters as top level resources", function(done) {
            let topResources = RDFaUtil.getTopRDFaResources();
            expect(topResources).to.contain("urn:vangogh:testletter1");
            expect(topResources).to.contain("urn:vangogh:testletter2");
            done();
        });
    });

    describe("getRDFaAttributes", () => {

        it("should return an about property for both top level resources", (done) => {
            RDFaUtil.observerNodes.forEach((observerNode) => {
                let topResourceNodes = RDFaUtil.getTopRDFaNodes(observerNode);
                topResourceNodes.forEach((topResourceNode) => {
                    let attrs = RDFaUtil.getRDFaAttributes(topResourceNode);
                    expect(attrs.about).to.exist;
                });
            });
            done();
        });
    });

    describe("indexRDFa", () => {

        it("should return an index containing URNs of sender and receiver", (done) => {
            expect(index.resources["urn:vangogh:testletter1.sender"]).to.exist;
            expect(index.resources["urn:vangogh:testletter1.receiver"]).to.exist;
            expect(index.resources["urn:vangogh:testletter2.sender"]).to.exist;
            expect(index.resources["urn:vangogh:testletter2.receiver"]).to.exist;
            done();
        });

        it("should state vocabulary for each resource", (done) => {
            expect(index.resources["urn:vangogh:testletter1.sender"].rdfaVocabulary).to.not.be.undefined;
            done();
        });
    });

});

var loadResources = (callback) => {
    mockServer.get("/frbroo_alternate.ttl").thenReply(200, frbrooRelationsString).then(() => {
        AnnotationActions.indexResources((error) => {
            if (error) {
                return callback(error);
            }
            AnnotationStore.resourceMaps = RDFaUtil.buildResourcesMaps(); // .. rebuild maps
            let resources = Object.keys(AnnotationStore.resourceIndex);
            AnnotationActions.indexExternalResources(resources, (error) => {
                if (error) {
                    console.log("error indexing external resources");
                    return callback(error);
                } else {
                    console.log("external resources indexed");
                    return callback(null);
                }
            });
        });
    });
}

