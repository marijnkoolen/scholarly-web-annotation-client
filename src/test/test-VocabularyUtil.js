var expect = require('chai').expect;
require('es6-promise').polyfill();
require('isomorphic-fetch');
var fs = require('fs');
const jsdom = require("jsdom");
const $rdf = require("rdflib");
const { JSDOM } = jsdom;
import VocabularyUtil from '../util/VocabularyUtil.js';

let vocabularyURL = "http://localhost:3000/vocabularies/vangoghontology.ttl";

var loadPage = () => {
    let localURL = "http://localhost:3001";
    const jsdomConfig = {url: localURL}
    let htmlSource = "<html><body><div>hi</div></body></html>";
    let dom = new JSDOM(htmlSource, jsdomConfig);
    global.document = dom.window.document;
    global.window = dom.window;
}

let frbrooRelationsString = `
@prefix hi: <http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#> .
@prefix vg: <http://boot.huygens.knaw.nl/vgdemo/vangoghannotationontology.ttl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix ecrm: <http://erlangen-crm.org/current/> .

<urn:vangogh/letter=001> rdf:type vg:Letter.
<urn:vangogh/letter=001> hi:hasFragmentOf <urn:vangogh/letter=001:repr=original>.
hi:AnnotatableThing rdf:type owl:Class ;
    rdfs:label "AnnotatableThing" ;
    rdfs:subClassOf ecrm:E71_Man-Made_Thing ;
    rdfs:comment "E71 can be either E24_Physical_Man-Made_Thing (i.e. documents) or E28_Conceptual_Object (i.e. works)" .`;

var prefillStore = () => {
    VocabularyUtil.newStore();
    try {
        let mimeType = "text/turtle";
        let baseUri = "http://localhost:3000/frbroo_relations.ttl";
        $rdf.parse(frbrooRelationsString, VocabularyUtil.rdfStore, baseUri, mimeType);
    } catch (error) {
        console.log(error);
    }
}


describe("VocabularyUtil", function() {

    beforeEach((done) => {
        loadPage();
        prefillStore();
        done();
    });

    describe("getLabelClass", () => {

        it("should map label to class", (done) => {
            let rootLabel = 'AnnotatableThing';
            let rootObject = VocabularyUtil.getLabelClass(rootLabel);
            expect(rootObject).to.not.equal(null);
            done();
        });
    });

    /*
    it("should contain the AnnotatableThing root class", function(done) {
        VocabularyUtil.readVocabularyFromURL(vocabularyURL, function(error) {
            expect(error).to.equal(null);
            let rootLabel = '"AnnotatableThing"';
            let rootObject = VocabularyUtil.getLabelClass(rootLabel);
            expect(rootObject).to.not.equal(null);
            done();
        });
    });

    it("should contain the Letter class", function(done) {
        VocabularyUtil.readVocabularyFromURL(vocabularyURL, function(error) {
            expect(error).to.equal(null);
            let rootLabel = '"AnnotatableThing"';
            let rootObject = VocabularyUtil.getLabelClass(rootLabel);
            expect(rootObject).to.not.equal(null);
            let annotatableThings = VocabularyUtil.listAnnotatableThings();
            expect(annotatableThings).to.contain("Letter")
            done();
        });
    });
    */
});


