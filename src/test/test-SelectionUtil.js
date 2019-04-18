var expect = require("chai").expect;
require("es6-promise").polyfill();
require("isomorphic-fetch");
var fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
import SelectionUtil from "../util/SelectionUtil.js";
import RDFaUtil from "../util/RDFaUtil.js";

let htmlSource = fs.readFileSync("public/testletter.html");

let localURL = "http://localhost:3001/";
var loadPage = (htmlSource) => {
    const jsdomConfig = {url: localURL}
    let dom = new JSDOM(htmlSource, jsdomConfig);
    global.document = dom.window.document;
    global.window = dom.window;
}

let baseAnnotationOntologyURL = "http://localhost:8080/ontologies/editionannotationontology.ttl";
let vocabularyURL = "http://localhost:8080/ontologies/vangoghannotationontology.ttl";
var loadRDFaPage = () => {
    let htmlSource = `
    <html>
        <body class=\"annotation-target-observer\" vocab=${vocabularyURL + "#"}>
            <div class="content" prefix="hi: http://localhost:8080/ontologies/editionannotationontology.ttl#                                             vg: http://localhost:8080/ontologies/vangoghannotationontology.ttl#" typeof="Letter" resource="urn:vangogh/letter=001">
                <span class="para" typeof="vg:ParagraphInLetter" property="hi:hasWorkPart" resource="urn:vangogh/letter=001:para=1">
                    Some text
                    <span>
                        <span typeof="hi:IgnorableElement"><span>[</span></span>
                        with some content
                        <span typeof="hi:IgnorableElement">]</span>
                    </span>
                    where the brackets should be ignored.
                </span>
            </div>
        </body>
    </html>`;
    loadPage(htmlSource);
}


describe("SelectionUtil", () => {

    describe("setImageSelection", () => {

        before((done) => {
            const jsdomConfig = {url: localURL}
            let dom = new JSDOM(htmlSource, jsdomConfig);
            global.window = dom.window;
            global.document = dom.window.document;
            done();
        });

        it("should return an error when no element argument is passed", (done) => {
            var error = null;
            try {
                SelectionUtil.setImageSelection();
            }
            catch (err) {
                error = err;
            }
            expect(error.message).to.equal("argument 'element' is required.");
            done();
        });

        it("should return an error when element is not a DOM element", (done) => {
            let element = 1;
            var error = null;
            try {
                SelectionUtil.setImageSelection(element);
            }
            catch (err) {
                error = err;
            }
            expect(error.message).to.equal("element must be a DOM element.");
            done();
        });

        it("should return an error when no rect argument is passed", (done) => {
            let element = document.getElementsByTagName("img")[0];
            var error = null;
            try {
                SelectionUtil.setImageSelection(element);
            }
            catch (err) {
                error = err;
            }
            expect(error.message).to.equal("argument 'rect' is required.");
            done();
        });

        it("should return an error when invalid image rectangle is passed", (done) => {
            let element = document.getElementsByTagName("img")[0];
            let rect = {wrong: 1, y: 1, h:100, w: 100};
            var error = null;
            try {
                SelectionUtil.setImageSelection(element, rect);
            }
            catch (err) {
                error = err;
            }
            expect(error.message).to.equal("rect is missing required property x.");
            done();
        });

        it("should return an error when non-integer rectangle property is passed", (done) => {
            let element = document.getElementsByTagName("img")[0];
            let rect = {x: "1", y: 1, h:100, w: 100};
            var error = null;
            try {
                SelectionUtil.setImageSelection(element, rect);
            }
            catch (err) {
                error = err;
            }
            expect(error.message).to.equal("rect property x is not an integer.");
            done();
        });

        it("should set currentSelection when valid image selection is passed", (done) => {
            let element = document.getElementsByTagName("img")[0];
            let rect = {x: 1, y: 1, h:100, w: 100};
            SelectionUtil.setImageSelection(element, rect);
            let selection = SelectionUtil.getCurrentSelection();
            expect(selection.rect.x).to.equal(rect.x);
            expect(selection.mimeType).to.equal("image");
            expect(selection.startNode).to.equal(element);
            done();
        });

    });

    describe("setSelectionStartEndNodes", () => {

        beforeEach((done) => {
            loadRDFaPage();
            RDFaUtil.setBaseAnnotationOntology(baseAnnotationOntologyURL);
            RDFaUtil.resetIgnoreNodes();
            SelectionUtil.currentSelection = null;
            done();
        });

        it("should set start text node", (done) => {
            let ele = document.getElementsByTagName("span")[0];
            let selection = {
                anchorNode: ele.childNodes[0],
                anchorOffset: 26, // start after "Some ",
                focusNode: ele.childNodes[2],
                focusOffset: 26, // stop after "where"
            }
            SelectionUtil.setSelectionStartEndNodes(selection);
            expect(SelectionUtil.currentSelection.hasOwnProperty("startNode")).to.equal(true);
            expect(SelectionUtil.currentSelection.startNode).to.equal(selection.anchorNode);
            done();
        });

        it("should set end text node", (done) => {
            let ele = document.getElementsByTagName("span")[0];
            let selection = {
                anchorNode: ele.childNodes[0],
                anchorOffset: 26, // start after "Some ",
                focusNode: ele.childNodes[2],
                focusOffset: 26, // stop after "where"
            }
            SelectionUtil.setSelectionStartEndNodes(selection);
            expect(SelectionUtil.currentSelection.hasOwnProperty("endNode")).to.equal(true);
            expect(SelectionUtil.currentSelection.endNode).to.equal(selection.focusNode);
            done();
        });

        it("should set focus node as start node if selection is reversed", (done) => {
            let ele = document.getElementsByTagName("span")[0];
            let selection = {
                anchorNode: ele.childNodes[2],
                anchorOffset: 26, // start after "Some ",
                focusNode: ele.childNodes[0],
                focusOffset: 26, // stop after "where"
            }
            SelectionUtil.setSelectionStartEndNodes(selection);
            expect(SelectionUtil.currentSelection.hasOwnProperty("startNode")).to.equal(true);
            expect(SelectionUtil.currentSelection.startNode).to.equal(selection.focusNode);
            done();
        });

        it("should set child text node as end if end node is non-text element", (done) => {
            let ele = document.getElementsByTagName("span")[0];
            let selection = {
                anchorNode: ele.childNodes[0],
                anchorOffset: 26, // start after "Some ",
                focusNode: ele,
                focusOffset: 2, // stop after child span element
            }
            SelectionUtil.setSelectionStartEndNodes(selection);
            expect(SelectionUtil.currentSelection.hasOwnProperty("endNode")).to.equal(true);
            expect(SelectionUtil.currentSelection.endNode).to.equal(ele.childNodes[2]);
            expect(SelectionUtil.currentSelection.endOffset).to.equal(0);
            done();
        });

    });

    describe("setContainerNode", () => {

        beforeEach((done) => {
            loadRDFaPage();
            RDFaUtil.setBaseAnnotationOntology(baseAnnotationOntologyURL);
            RDFaUtil.resetIgnoreNodes();
            SelectionUtil.currentSelection = null;
            done();
        });

        it("should set container of start and end text nodes", (done) => {
            let ele = document.getElementsByTagName("span")[0];
            SelectionUtil.currentSelection = {
                startNode: ele.childNodes[0],
                startOffset: 5, // start after "Some ",
                endNode: ele.childNodes[2],
                endOffset: 5, // stop after "where"
                mimeType: "text",
            }
            SelectionUtil.setContainerNode();
            expect(SelectionUtil.currentSelection.hasOwnProperty("containerNode")).to.equal(true);
            expect(SelectionUtil.currentSelection.containerNode).to.equal(ele);
            done();
        });

    });

    describe("setSelectionText", () => {

        beforeEach((done) => {
            loadRDFaPage();
            RDFaUtil.setBaseAnnotationOntology(baseAnnotationOntologyURL);
            RDFaUtil.resetIgnoreNodes();
            SelectionUtil.currentSelection = null;
            done();
        });

        it("should throw an error when no currentSelection is set", (done) => {
            let error = null;
            SelectionUtil.currentSelection = null;
            try {
                SelectionUtil.setSelectionText();
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            expect(error.message).to.equal("No currentSelection set");
            done();
        });

        it("should throw an error when currentSelection has no mimeType", (done) => {
            let error = null;
            SelectionUtil.currentSelection = {wrong: "object"};
            try {
                SelectionUtil.setSelectionText();
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            expect(error.message).to.equal("No currentSelection mimeType set");
            done();
        });

        it("should throw an error when currentSelection mimeType is not text", (done) => {
            let error = null;
            SelectionUtil.currentSelection = {wrong: "object", mimeType: "video"};
            try {
                SelectionUtil.setSelectionText();
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            expect(error.message).to.equal("currentSelection mimeType is not text");
            done();
        });

        it("should throw an error when currentSelection is not valid", (done) => {
            let error = null;
            SelectionUtil.currentSelection = {wrong: "object", mimeType: "text"};
            try {
                SelectionUtil.setSelectionText();
            } catch (err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            expect(error.message).to.equal("Invalid currentSelection");
            done();
        });

        it("should return text between offsets if start and end node are the same", (done) => {
            let ele = document.getElementsByTagName("span")[0];
            SelectionUtil.currentSelection = {
                startNode: ele.childNodes[0],
                startOffset: 26, // start after "Some ",
                endNode: ele.childNodes[2],
                endOffset: 26, // stop after "where"
                mimeType: "text",
                selectionText: "text [ with some content ] where",
            }
            //console.log(ele.textContent);
            SelectionUtil.setContainerNode();
            //let text = null;
            SelectionUtil.setSelectionText();
            //console.log("currentSelection:", SelectionUtil.currentSelection);
            expect(SelectionUtil.currentSelection.hasOwnProperty("selectionText")).to.equal(true);
            done();
        });

    });
});




