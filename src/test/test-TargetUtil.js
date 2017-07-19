var expect = require('chai').expect;
require('es6-promise').polyfill();
require('isomorphic-fetch');
var fs = require('fs');
var jsdom = require('jsdom');
import TargetUtil from '../util/TargetUtil.js';
import SelectionUtil from '../util/SelectionUtil.js';

let htmlSource = fs.readFileSync("public/testletter.html");

describe("TargetUtil", () => {

    beforeEach((done) => {
        let doc = jsdom.jsdom(htmlSource)
        let window = doc.defaultView;
        global.document = window.document;
        done();
    });

    it("should return candidate element with image coordinates", (done) => {
        let element = document.getElementsByTagName("img")[0];
        let rect = {x: 1, y: 1, h:100, w: 100};
        SelectionUtil.setImageSelection(element, rect);
        let candidates = TargetUtil.getCandidateRDFaTargets([]);
        let candidate = candidates.highlighted;
        expect(candidate.mimeType).to.equal("image");
        expect(candidate.params.rect.x).to.equal(rect.x);
        done();
    });

});



