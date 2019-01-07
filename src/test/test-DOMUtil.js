var expect = require("chai").expect;
require("es6-promise").polyfill();
require("isomorphic-fetch");
var fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
import DOMUtil from "../util/DOMUtil.js";

let htmlSource = fs.readFileSync("public/testletter.html");

var makeDOM = (htmlSource) => {
    let dom = new JSDOM(htmlSource, {pretendToBeVisual: true, url: "http://localhost:3001"});
    let window = dom.window;
    global.document = window.document;
}

var makeDOMTestletter = () => {
    let htmlSource = fs.readFileSync("public/testletter.html");
    makeDOM(htmlSource);
}

describe("DOMUtil", () => {

    before((done) => {
        makeDOMTestletter();
        let dom = new JSDOM(htmlSource);
        let window = dom.window;
        global.document = window.document;
        let observerNodeClass = "annotation-target-observer";
        DOMUtil.setObserverNodeClass(observerNodeClass);
        done();
    });

    describe("getting ancestors of document", () => {
        it("should return an empty list", (done) => {
            let ancestors = DOMUtil.getAncestors(document);
            expect(ancestors.length).to.equal(0);
            done();
        });
    });

    describe("getting descendants of document", () => {
        it("should return a non-empty list", (done) => {
            let descendants = DOMUtil.getDescendants(document);
            expect(descendants.length).to.not.equal(0);
            done();
        });
    });

    describe("getting annotation-observer nodes", () => {
        it("should return a DIV element", (done) => {
            let observers = DOMUtil.getObserverNodes();
            expect(observers.length).to.not.equal(0);
            expect(observers[0].nodeName).to.equal("DIV");
            done();
        });
    });

    describe("getting text nodes", () => {
        it("should return only nodes of type TEXT_NODE", (done) => {
            let textNodes = DOMUtil.getTextNodes(document);
            textNodes.forEach((node) => {
                expect(node.nodeType).to.equal(window.Node.TEXT_NODE);
            });
            done();
        });
    });

    describe("getting non-text nodes", () => {
        it("should return only nodes of type ELEMENT_NODE", (done) => {
            let descendants = DOMUtil.getDescendants(document);
            let elementNodes = DOMUtil.getElementNodes(descendants);
            elementNodes.forEach((node) => {
                expect(node.nodeType).to.equal(window.Node.ELEMENT_NODE);
            });
            done();
        });
    });

    describe("determining displayText", () => {

        before((done) => {
            let htmlSource = fs.readFileSync("public/vgdemo/translated.html");
            makeDOM(htmlSource);
            done();
        });

        it("should determine the right display type", (done) => {
            let span = document.getElementsByTagName("span")[10];
            var displayType = DOMUtil.getDisplayType(span);
            expect(displayType).to.not.equal("block");
            let div = document.getElementsByTagName("div")[0];
            displayType = DOMUtil.getDisplayType(div);
            expect(displayType).to.equal("block");
            done();
        });

        it("should determine the right display text offset", (done) => {
            let span = document.getElementsByTagName("span")[10];
            let textNode = DOMUtil.getTextNodes(span)[3];
            let displayOffset = DOMUtil.getTextNodeDisplayOffset(textNode);
            let displayText = DOMUtil.getTextNodeDisplayText(textNode);
            expect(displayOffset).to.equal(27);
            done();
        });

        it("should determine the right display text offset of text selection", (done) => {
            let span = document.getElementsByTagName("span")[10];
            let displayOffset = DOMUtil.getTextNodeDisplayOffset(span);
            let displayText = DOMUtil.getTextNodeDisplayText(span);
            let textSelectionOffset = displayText.indexOf("together");
            expect(textSelectionOffset).to.equal(29);
            done();
        });

    });

});

