
"use strict";

var expect = require("chai").expect;
import StringUtil from "../util/StringUtil.js";

describe("StringUtil", () => {

    it("should reject invalid URLs", (done) => {
        let invalidURLs = ["localhost:8080", "ParagraphInLetter"];
        invalidURLs.forEach((invalidURL) => {
            let isURL = StringUtil.isURL(invalidURL);
            expect(isURL).to.be.false;
        })
        done();
    });

    it("should accept valid URLs", (done) => {
        let validURLs = ["http://localhost:8080/", "http://boot.huygens.knaw.nl/vangoghannotationontology.ttl"];
        validURLs.forEach((validURL) => {
            let isURL = StringUtil.isURL(validURL);
            expect(isURL).to.be.true;
        })
        done();
    });
});

