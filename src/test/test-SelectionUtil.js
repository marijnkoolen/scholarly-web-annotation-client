var expect = require('chai').expect;
require('es6-promise').polyfill();
require('isomorphic-fetch');
var fs = require('fs');
var jsdom = require('jsdom');
import SelectionUtil from '../util/SelectionUtil.js';

let htmlSource = fs.readFileSync("public/testletter.html");

describe("SelectionUtil", () => {

    beforeEach((done) => {
        let doc = jsdom.jsdom(htmlSource)
        let window = doc.defaultView;
        global.document = window.document;
        done();
    });

    describe("setImageSelection", () => {

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
});




