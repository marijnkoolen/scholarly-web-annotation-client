var expect = require('chai').expect;
require('es6-promise').polyfill();
require('isomorphic-fetch');
var fs = require('fs');
var jsdom = require('jsdom');
import DOMUtil from '../util/DOMUtil.js';

let htmlSource = fs.readFileSync("public/testletter.html");

let doc = jsdom.jsdom(htmlSource)
let window = doc.defaultView;
global.document = window.document;

describe("DOMUtil getting ancestors of document", function() {
    it("should return an empty list", function(done) {
        let ancestors = DOMUtil.getAncestors(document);
        expect(ancestors.length).to.equal(0);
        done();
    });
});

describe("DOMUtil getting descendants of document", function() {
    it("should return a non-empty list", function(done) {
        let descendants = DOMUtil.getDescendants(document);
        expect(descendants.length).to.not.equal(0);
        done();
    });
});

describe("DOMUtil getting annotation-observer nodes", function() {
    it("should return a DIV element", function(done) {
        let observers = DOMUtil.getObserverNodes(document);
        expect(observers.length).to.not.equal(0);
        expect(observers[0].nodeName).to.equal("DIV");
        done();
    });
});

describe("DOMUtil getting text nodes", function() {
    it("should return only nodes of type TEXT_NODE", function(done) {
        let descendants = DOMUtil.getDescendants(document);
        let textNodes = DOMUtil.getTextNodes(descendants);
        textNodes.forEach(function(node) {
            expect(node.nodeType).to.equal(window.Node.TEXT_NODE)
        })
        done();
    });
});

describe("DOMUtil getting non-text nodes", function() {
    it("should return only nodes of type ELEMENT_NODE", function(done) {
        let descendants = DOMUtil.getDescendants(document);
        let elementNodes = DOMUtil.getElementNodes(descendants);
        elementNodes.forEach(function(node) {
            expect(node.nodeType).to.equal(window.Node.ELEMENT_NODE)
        })
        done();
    });
});


