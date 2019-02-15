var expect = require('chai').expect;
require('es6-promise').polyfill();
require('isomorphic-fetch');
var fs = require('fs');
const jsdom = require("jsdom");
const $rdf = require("rdflib");
const { JSDOM } = jsdom;
import VocabularyUtil from '../util/VocabularyUtil.js';
import FRBRooUtil from '../util/FRBRooUtil.js';

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
@prefix hi: <http://localhost:3001/editionannotationontology.ttl#> .
@prefix vg: <http://localhost:3001/vangoghannotationontology.ttl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix ecrm: <http://erlangen-crm.org/current/> .

<urn:vangogh/letter=001> rdf:type vg:Letter.
<urn:vangogh/letter=001> hi:hasRepresentation <urn:vangogh/letter=001:repr=original>.
<urn:vangogh/letter=001:para=1> rdf:type vg:ParagraphInLetter.
<urn:vangogh/letter=001:para=1> hi:hasRepresentation <urn:vangogh/letter=001:para=1:repr=original>.
<urn:vangogh/letter=001> hi:hasWorkPart <urn:vangogh/letter=001:para=1>.
`;

let editionOntologyString = `
@prefix hi: <http://localhost:3001/editionannotationontology.ttl#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix ecrm: <http://erlangen-crm.org/current/> .
@prefix efrbroo: <http://erlangen-crm.org/efrbroo/> .
@base <http://localhost:3001/editionannotationontology.ttl> .
<http://localhost:3001/editionannotationontology.ttl> rdf:type owl:Ontology .

<http://localhost:3001/editionannotationontology.ttl>  owl:imports  <https://raw.githubusercontent.com/erlangen-crm/efrbroo/releases/efrbroo_20160715.owl>.

hi:AnnotatableThing rdf:type owl:Class ;
    rdfs:label "AnnotatableThing" ;
    rdfs:subClassOf ecrm:E71_Man-Made_Thing ;
    rdfs:comment "E71 can be either E24_Physical_Man-Made_Thing (i.e. documents) or E28_Conceptual_Object (i.e. works)" .
hi:EditableThing rdf:type owl:Class ;
    rdfs:label "EditableThing" ;
    rdfs:subClassOf hi:AnnotatableThing ;
    rdfs:comment "Realm of things that can be or have been edited" .
hi:EditionThing rdf:type owl:Class ;
    rdfs:label "EditionThing" ;
    rdfs:subClassOf hi:AnnotatableThing ;
    rdfs:comment "Realm of things that result from editing" .

hi:includes rdf:type owl:ObjectProperty ;
    rdfs:domain hi:AnnotatableThing;
    rdfs:range hi:AnnotatableThing;
    rdfs:label "includes" ;
    rdfs:comment "Superproperty for all relations that are considered hierarchical".

hi:Work rdf:type owl:Class ;
    rdfs:label "Work" ;
    rdfs:subClassOf efrbroo:F1_Work ;
    rdfs:subClassOf hi:EditableThing ;
    rdfs:comment "Works that are editid" .
hi:PartOfWork rdf:type owl:Class ;
    rdfs:label "PartOfWork" ;
    rdfs:subClassOf hi:EditableThing ;
    rdfs:subClassOf ecrm:E89_Propositional_Object ;
    rdfs:comment "Consists of parts of works that are edited" .
hi:WorkOrPartOfWork rdf:type owl:Class ;
    rdfs:label "WorkOrPartOfWork" ;
    owl:unionOf (hi:Work hi:PartOfWork);
    rdfs:comment "Consists of works that are edited and parts of them" .

hi:hasWorkPart rdf:type owl:ObjectProperty ;
    rdfs:domain hi:Work;
    rdfs:range hi:PartOfWork;
    rdfs:label "hasWorkPart" ;
    rdfs:comment "Describes relation between Works and parts of Works";
    rdfs:subPropertyOf hi:includes.
hi:isWorkPartOf rdf:type owl:ObjectProperty ;
    rdfs:domain hi:PartOfWork;
    rdfs:range hi:Work;
    rdfs:label "isWorkPartOf" ;
    rdfs:comment "Describes relation between parts of Works and Works";
    owl:inverseOf hi:hasWorkPart.


hi:EditionText rdf:type owl:Class ;
    rdfs:label "EditionText" ;
    rdfs:subClassOf efrbroo:F2_Expression ;
    rdfs:subClassOf hi:EditionThing ;
    rdfs:comment "Edition reading text" .

hi:hasRepresentation rdf:type owl:ObjectProperty ;
    rdfs:domain hi:EditableThing;
    rdfs:range hi:EditionThing;
    rdfs:label "hasRepresentation"  ;
    rdfs:comment "Connects an editable thing (doc, work, ptf) to its representation in the edition" .
hi:isRepresentationOf rdf:type owl:ObjectProperty ;
    rdfs:domain hi:EditionThing;
    rdfs:range hi:EditableThing;
    rdfs:label "isRepresentationOf"  ;
    rdfs:comment "Connects a representation to what it represents";
    owl:inverseOf hi:hasRepresentation.

`;

let vangoghOntologyString = `
@prefix hi: <http://localhost:3001/editionannotationontology.ttl#> .
@prefix vg: <http://localhost:3001/vangoghannotationontology.ttl#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@base <http://localhost:3001/vangoghannotationontology.ttl> .
<http://localhost:3001/vangoghannotationontology.ttl> rdf:type owl:Ontology .

<http://localhost:3001/vangoghontology.ttl>  owl:imports  <http://localhost:3001/editionannotationontology.ttl>.

vg:Letter rdf:type owl:Class ;
    rdfs:label "Letter" ;
    rdfs:subClassOf hi:Work.
vg:ParagraphInLetter rdf:type owl:Class ;
    rdfs:label "ParagraphInLetter" ;
    rdfs:subClassOf hi:PartOfWork.
`;

var prefillStore = () => {
    let rdfStore = VocabularyUtil.newStore();
    try {
        let mimeType = "text/turtle";
        let baseUri = "http://localhost:3000/frbroo_relations.ttl";
        $rdf.parse(frbrooRelationsString, rdfStore, baseUri, mimeType);
    } catch (error) {
        console.log(error);
    }
    return rdfStore;
}

var fillStore = (rdfString, baseURI) => {
    let rdfStore = VocabularyUtil.newStore();
    try {
        let mimeType = "text/turtle";
        $rdf.parse(rdfString, rdfStore, baseURI, mimeType);
    } catch (error) {
        console.log(error);
    }
    return rdfStore;
}


describe("VocabularyUtil", function() {

    beforeEach((done) => {
        loadPage();
        done();
    });

    describe("getLabelClass", () => {

        it("should map label to class", (done) => {
            let baseURI = "http://localhost:3000/frbroo_relations.ttl";
            let rdfStore = fillStore(vangoghOntologyString, baseURI);
            let classLabel = 'Letter';
            let classURI = VocabularyUtil.getLabelClass(rdfStore, classLabel);
            expect(classURI).to.not.equal(null);
            done();
        });
    });

    describe("getClassLabel", () => {

        it("should map class to label", (done) => {
            let baseURI = "http://localhost:3000/frbroo_relations.ttl";
            let rdfStore = fillStore(editionOntologyString, baseURI);
            let classLabel = 'EditionThing';
            let classURI = "http://localhost:3001/editionannotationontology.ttl#EditionThing";
            expect(VocabularyUtil.getClassLabel(rdfStore, classURI)).to.equal(classLabel);
            done();
        });
    });

    describe("getSubClasses", () => {

        it("should return subclasses of class", (done) => {
            let baseURI = "http://localhost:3000/frbroo_relations.ttl";
            let rdfStore = fillStore(editionOntologyString, baseURI);
            let classLabel = 'AnnotatableThing';
            let subClassURI = 'http://localhost:3001/editionannotationontology.ttl#EditableThing';
            let classURI = VocabularyUtil.getLabelClass(rdfStore, classLabel);
            let subClasses = VocabularyUtil.getSubClasses(rdfStore, classURI);
            expect(subClasses).to.not.equal(null);
            expect(subClasses.length).to.equal(2);
            expect(subClasses.includes(subClassURI)).to.equal(true);
            done();
        });
    });

    describe("getDescendantClasses", () => {

        it("should return subclasses of class", (done) => {
            let baseURI = "http://localhost:3000/frbroo_relations.ttl";
            let rdfStore = fillStore(editionOntologyString, baseURI);
            let classLabel = 'AnnotatableThing';
            let classURI = VocabularyUtil.getLabelClass(rdfStore, classLabel);
            let descendantClassURI = 'http://localhost:3001/editionannotationontology.ttl#Work';
            let subClasses = VocabularyUtil.getDescendantClasses(rdfStore, classURI);
            expect(subClasses.includes(descendantClassURI)).to.equal(true);
            done();
        });
    });

    describe("getSubProperties", () => {

        it("should return subproperties of property", (done) => {
            let baseURI = "http://localhost:3000/frbroo_relations.ttl";
            let rdfStore = fillStore(editionOntologyString, baseURI);
            let propertyLabel = 'includes';
            let subPropertyURI = 'http://localhost:3001/editionannotationontology.ttl#hasWorkPart';
            let propertyURI = VocabularyUtil.getLabelClass(rdfStore, propertyLabel);
            let subProperties = VocabularyUtil.getSubProperties(rdfStore, propertyURI);
            expect(subProperties).to.not.equal(null);
            expect(subProperties.length).to.equal(1);
            expect(subProperties.includes(subPropertyURI)).to.equal(true);
            done();
        });
    });

    describe("getDescendantProperties", () => {

        it("should return subproperties of class", (done) => {
            let baseURI = "http://localhost:3000/frbroo_relations.ttl";
            let rdfStore = fillStore(editionOntologyString, baseURI);
            let propertyLabel = 'includes';
            let propertyURI = VocabularyUtil.getLabelClass(rdfStore, propertyLabel);
            let descendantPropertyURI = 'http://localhost:3001/editionannotationontology.ttl#hasWorkPart';
            let subProperties = VocabularyUtil.getDescendantProperties(rdfStore, propertyURI);
            expect(subProperties.includes(descendantPropertyURI)).to.equal(true);
            done();
        });
    });

    describe("getInverseOfRelation", () => {

        it("should return an null if property does not exists", (done) => {
            let baseURI = "http://localhost:3000/frbroo_relations.ttl";
            let rdfStore = fillStore(editionOntologyString, baseURI);
            let propertyURI = 'http://localhost:3001/editionannotationontology.ttl#doesNotExist';
            let inverseOfRelation = VocabularyUtil.getInverseOfRelation(rdfStore, propertyURI);
            expect(inverseOfRelation).to.equal(null);
            done();
        });

        it("should return inverseOf relation of single property", (done) => {
            let baseURI = "http://localhost:3000/frbroo_relations.ttl";
            let rdfStore = fillStore(editionOntologyString, baseURI);
            let propertyLabel = 'hasWorkPart';
            let propertyURI = VocabularyUtil.getLabelClass(rdfStore, propertyLabel);
            let inverseProperty = "http://localhost:3001/editionannotationontology.ttl#isWorkPartOf";
            let inverseOfRelation = VocabularyUtil.getInverseOfRelation(rdfStore, propertyURI);
            expect(inverseOfRelation).to.equal(inverseProperty);
            done();
        });
    });

    describe("readVocabulariesFromURL", () => {

        it("should read vangogh ontology", (done) => {
            let url = "http://localhost:3001/vangoghannotationontology.ttl";

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


