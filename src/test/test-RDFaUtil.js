
"use strict";

var expect = require("chai").expect;
require("es6-promise").polyfill();
require("isomorphic-fetch");
var fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
import RDFaUtil from "../util/RDFaUtil.js";

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
            expect(resource.rdfaTypeURL[0]).to.equal(vocabulary + resource.rdfaTypeLabel);
        });
        done();
    });
})

describe("RDFaUtil extracting relations", () => {

    var resourceEntry = {
        rdfaResource: "urn:vangogh:letter:001.para.7.original",
        rdfaVocabulary: [ "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#" ],
        domNode: null,
        rdfaType: [ "hi:EditionText" ],
        rdfaTypeURIs: [ "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#EditionText" ],
        rdfaProperty: "hasTextPart",
        text: "Vincent",
        rdfaParent: "urn:vangogh:letter:001.para.6.original"
    }

    var incompleteEntry = {
        rdfaResource: undefined,
        rdfaProperty: "hasTextPart",
        rdfaParent: "urn:vangogh:letter:001.para.6.original"
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

