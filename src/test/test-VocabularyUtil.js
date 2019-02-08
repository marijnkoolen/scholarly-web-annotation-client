var expect = require('chai').expect;
require('es6-promise').polyfill();
require('isomorphic-fetch');
var fs = require('fs');
var jsdom = require('jsdom');
import VocabularyUtil from '../util/VocabularyUtil.js';

let vocabularyURL = "http://localhost:3000/vocabularies/vangoghontology.ttl";

describe("VocabularyUtil parse of Van Gogh AnnotatableThing Ontology", function() {

    it("should contain the AnnotatableThing root class", function(done) {
        VocabularyUtil.getVocabulary(vocabularyURL, function(error) {
            expect(error).to.equal(null);
            let rootLabel = '"AnnotatableThing"';
            let rootObject = VocabularyUtil.getLabelClass(rootLabel);
            expect(rootObject).to.not.equal(null);
            done();
        });
    });

    it("should contain the Letter class", function(done) {
        VocabularyUtil.getVocabulary(vocabularyURL, function(error) {
            expect(error).to.equal(null);
            let rootLabel = '"AnnotatableThing"';
            let rootObject = VocabularyUtil.getLabelClass(rootLabel);
            expect(rootObject).to.not.equal(null);
            let annotatableThings = VocabularyUtil.listAnnotatableThings();
            expect(annotatableThings).to.contain("Letter")
            done();
        });
    });
});


