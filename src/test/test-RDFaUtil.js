var expect = require('chai').expect;
require('es6-promise').polyfill();
require('isomorphic-fetch');
var fs = require('fs');
var jsdom = require('jsdom');
import RDFaUtil from '../util/RDFaUtil.js';

let htmlSource = fs.readFileSync("public/testletter.html");

let doc = jsdom.jsdom(htmlSource)
let window = doc.defaultView;
global.document = window.document;

describe("RDFaUtil parse of test letter. ", function() {

    beforeEach((done) => {
        let observerNodes = document.getElementsByClassName('annotation-target-observer');
        RDFaUtil.setObserverNodes(observerNodes);
        done();
    });

    describe("getTopRDFaResources", function() {

        it("should return letter as top level resource", function(done) {
            let topResources = RDFaUtil.getTopRDFaResources();
            expect(topResources).to.contain("urn:vangogh:testletter");
            done();
        });
    });

    describe("getRDFaAttributes", function() {

        it("should return a vocabulary reference for top level resources", function(done) {
            RDFaUtil.observerNodes.forEach((observerNode) => {
                let topResourceNodes = RDFaUtil.getTopRDFaNodes(observerNode);
                topResourceNodes.forEach(function(topResourceNode) {
                    let attrs = RDFaUtil.getRDFaAttributes(topResourceNode);
                    expect(attrs.vocab).to.exist;
                });
            });
            done();
        });
    });

    describe("indexRDFaResources", function() {

        this.timeout(0);
        var index = null;

        before(function(done) {
            index = RDFaUtil.indexRDFaResources();
            done();
        });

        it("should return an index containing URNs of sender and receiver", function(done) {
            expect(index["urn:vangogh:testletter.sender"]).to.exist;
            expect(index["urn:vangogh:testletter.receiver"]).to.exist;
            done();
        });
    });

});

