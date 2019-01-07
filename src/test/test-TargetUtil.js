
"use strict";

var expect = require("chai").expect;
require("es6-promise").polyfill();
require("isomorphic-fetch");
var fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
import TargetUtil from "../util/TargetUtil.js";
import DOMUtil from "../util/DOMUtil.js";
import RDFaUtil from "../util/RDFaUtil.js";
import SelectionUtil from "../util/SelectionUtil.js";
import AnnotationActions from "../flux/AnnotationActions.js";

let htmlSource = fs.readFileSync("public/testletter.html", "utf-8");

var makeDOM = (htmlSource, jsdomConfig) => {
    let dom = new JSDOM(htmlSource, jsdomConfig);
    global.window = dom.window;
    global.document = dom.window.document;
}

describe("TargetUtil", () => {

    beforeEach((done) => {
        const jsdomConfig = {url: "http://localhost:3001/testletter"}
        makeDOM(htmlSource, jsdomConfig);
        // make sure observerNodes are reset in case of mocha caching utils
        AnnotationActions.resourceIndex = null;
        let observerNodes = DOMUtil.getObserverNodes();
        RDFaUtil.setObserverNodes(observerNodes);
        AnnotationActions.indexResources((error) => {
            done();
        });
    });

    it("should return candidate element with image coordinates", (done) => {
        let element = document.getElementsByTagName("img")[0];
        console.log(element);
        let rect = {x: 1, y: 1, h:100, w: 100};
        SelectionUtil.setImageSelection(element, rect);
        let defaultTargets = [];
        let candidates = TargetUtil.getCandidateRDFaTargets(defaultTargets);
        let candidate = candidates.highlighted;
        expect(candidate.mimeType).to.equal("image");
        expect(candidate.params.rect.x).to.equal(rect.x);
        done();
    });

    describe("parsing text selection", () => {

        before((done) => {
            let htmlSource = fs.readFileSync("public/vgdemo/translated.html");
            makeDOM(htmlSource);
            done();
        });

        it("should get correct container node", (done) => {
            done();
        });
    });
});



