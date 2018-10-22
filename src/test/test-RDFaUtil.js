var expect = require('chai').expect;
require('es6-promise').polyfill();
require('isomorphic-fetch');
var fs = require('fs');
var jsdom = require('jsdom');
import RDFaUtil from '../util/RDFaUtil.js';

let htmlSource = fs.readFileSync("public/testletter.html");

var loadTestletter = () => {
    let doc = jsdom.jsdom(htmlSource)
    let window = doc.defaultView;
    global.document = window.document;
}

var loadTestletter2 = () => {
    let htmlSource = fs.readFileSync("public/testletter2.html");
    let doc = jsdom.jsdom(htmlSource)
    let window = doc.defaultView;
    global.document = window.document;
}

describe("RDFaUtil parse of test letter. ", () => {

    beforeEach((done) => {
        loadTestletter();
        let observerNodes = document.getElementsByClassName('annotation-target-observer');
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

    describe("indexRDFaResources", () => {

        var index = null;

        before((done) => {
            RDFaUtil.indexRDFaResources((error, newIndex) => {
                index = newIndex;
                done();
            });
        });

        it("should return an index containing URNs of sender and receiver", (done) => {
            expect(index["urn:vangogh:testletter.sender"]).to.exist;
            expect(index["urn:vangogh:testletter.receiver"]).to.exist;
            done();
        });
    });

});

describe("RDFaUtil parse of test letter 2. ", () => {

    var index = null;

    before((done) => {
        loadTestletter2();
        let observerNodes = document.getElementsByClassName('annotation-target-observer');
        RDFaUtil.setObserverNodes(observerNodes);
        RDFaUtil.indexRDFaResources((error, newIndex) => {
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

    describe("indexRDFaResources", () => {

        it("should return an index containing URNs of sender and receiver", (done) => {
            expect(index["urn:vangogh:testletter1.sender"]).to.exist;
            expect(index["urn:vangogh:testletter1.receiver"]).to.exist;
            expect(index["urn:vangogh:testletter2.sender"]).to.exist;
            expect(index["urn:vangogh:testletter2.receiver"]).to.exist;
            done();
        });

        it("should state vocabulary for each resource", (done) => {
            expect(index["urn:vangogh:testletter1.sender"].rdfaVocabulary).to.not.be.undefined;
            done();
        });
    });

});

