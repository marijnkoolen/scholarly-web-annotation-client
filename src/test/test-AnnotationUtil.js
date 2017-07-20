var expect = require('chai').expect;
require('es6-promise').polyfill();
require('isomorphic-fetch');
var fs = require('fs');
var jsdom = require('jsdom');
import AnnotationUtil from '../util/AnnotationUtil.js';

describe("AnnotationUtil", () => {

    beforeEach((done) => {
        return done();
    });

    describe("makeMediaFragmentSelector", () => {
        it("should return no selector when receiving no parameters", (done) => {
            //let params = null;
            let selector = AnnotationUtil.makeMediaFragmentSelector();
            expect(selector).to.equal(null);
            return done();
        });

        it("should return no selector when receiving unknown parameters", (done) => {
            let params = {unknown: 1};
            let selector = AnnotationUtil.makeMediaFragmentSelector(params);
            expect(selector).to.equal(null);
            return done();
        });

        it("should return a MediaFragments selector with rectangle params when receiving image annotation parameters", (done) => {
            let params = {rect: {x:1, y:1, w:100, h:200}};
            let selector = AnnotationUtil.makeMediaFragmentSelector(params);
            expect(selector.type).to.equal("FragmentSelector");
            let urlParam = '#xywh=' + params.rect.x + ',' + params.rect.y + ',' + params.rect.w + ',' + params.rect.h;
            expect(selector.value).to.equal(urlParam);
            return done();
        });

        it("should return a MediaFragments selector with interval params when receiving video annotation parameters", (done) => {
            let params = {start: 1, end: 1};
            let selector = AnnotationUtil.makeMediaFragmentSelector(params);
            expect(selector.type).to.equal("FragmentSelector");
            let urlParam = '#t=' + params.start + ',' + params.end;
            expect(selector.value).to.equal(urlParam);
            return done();
        });
    });

    describe("makeTextPositionSelector", () => {
        it("should return no selector when receiving no parameters", (done) => {
            let selector = AnnotationUtil.makeTextPositionSelector();
            expect(selector).to.equal(null);
            return done();
        });

        it("should return no selector when receiving unknown parameters", (done) => {
            let params = {unknown: 1};
            let selector = AnnotationUtil.makeTextPositionSelector(params);
            expect(selector).to.equal(null);
            return done();
        });

        it("should return a TextPosition selector when receiving text position parameters", (done) => {
            let params = {start: 1, end: 1};
            let selector = AnnotationUtil.makeTextPositionSelector(params);
            expect(selector.type).to.equal("TextPositionSelector");
            expect(selector.start).to.equal(params.start);
            expect(selector.end).to.equal(params.end);
            return done();
        });

    });

    describe("makeTextQuoteSelector", () => {
        it("should return no selector when receiving no parameters", (done) => {
            let selector = AnnotationUtil.makeTextQuoteSelector();
            expect(selector).to.equal(null);
            return done();
        });

        it("should return no selector when receiving unknown parameters", (done) => {
            let params = {unknown: 1};
            let selector = AnnotationUtil.makeTextQuoteSelector(params);
            expect(selector).to.equal(null);
            return done();
        });

        it("should return a TextQuote selector when receiving text quote parameters", (done) => {
            let params = {text: "some text", prefix: "a prefix to ", suffix: ", followed by a suffix"};
            let selector = AnnotationUtil.makeTextQuoteSelector(params);
            expect(selector.type).to.equal("TextQuoteSelector");
            expect(selector.exact).to.equal(params.text);
            return done();
        });

    });

    describe("makeTextSelector", () => {
        it("should return no selector when receiving no parameters", (done) => {
            let selector = AnnotationUtil.makeTextSelector();
            expect(selector).to.equal(null);
            return done();
        });

        it("should return no selector when receiving unknown parameters", (done) => {
            let params = {unknown: 1};
            let selector = AnnotationUtil.makeTextSelector(params);
            expect(selector).to.equal(null);
            return done();
        });

        it("should return a TextPosition selector when receiving text position parameters", (done) => {
            let params = {
                start: 1,
                end: 1
            };
            let selector = AnnotationUtil.makeTextSelector(params);
            expect(selector.type).to.equal("TextPositionSelector");
            return done();
        });

        it("should return a TextQuote selector when receiving text quote parameters", (done) => {
            let params = {
                text: "some text",
                prefix: "a prefix to ",
                suffix: ", followed by a suffix"
            };
            let selector = AnnotationUtil.makeTextSelector(params);
            expect(selector.type).to.equal("TextQuoteSelector");
            return done();
        });

        it("should return an array with TextPosition and TextQuote selectors when receiving text position and qoute parameters", (done) => {
            let params = {
                start: 1,
                end: 1,
                text: "some text",
                prefix: "a prefix to ",
                suffix: ", followed by a suffix"
            };
            let selector = AnnotationUtil.makeTextSelector(params);
            expect(Array.isArray(selector));
            expect(selector[0].type).to.equal("TextPositionSelector");
            expect(selector[1].type).to.equal("TextQuoteSelector");
            return done();
        });

    });

    describe("makeSelector", () => {
        it("should return no selector when receiving no target type", (done) => {
            let params = {unknown: 1};
            let selector = AnnotationUtil.makeSelector(params);
            expect(selector).to.equal(null);
            return done();
        });

        it("should return no selector when receiving no parameters", (done) => {
            let targetType = "Text";
            let selector = AnnotationUtil.makeSelector(targetType);
            expect(selector).to.equal(null);
            return done();
        });

        it("should return no selector when receiving unknown parameters", (done) => {
            let params = {unknown: 1};
            let targetType = "Text";
            let selector = AnnotationUtil.makeSelector(params, targetType);
            expect(selector).to.equal(null);
            return done();
        });

        it("should return a TextPosition selector when receiving text position parameters", (done) => {
            let params = {
                start: 1,
                end: 2
            };
            let targetType = "Text";
            let selector = AnnotationUtil.makeSelector(params, targetType);
            expect(selector.type).to.equal("TextPositionSelector");
            return done();
        });

        it("should return a FragmentSelector when receiving time interval parameters", (done) => {
            let params = {
                start: 1,
                end: 2
            };
            let targetType = "Video";
            let selector = AnnotationUtil.makeSelector(params, targetType);
            expect(selector.type).to.equal("FragmentSelector");
            return done();
        });

    });

    describe("generateW3CAnnotation", () => {

        it("should throw an error when receiving no data", (done) => {
            var error = null;
            try {
                AnnotationUtil.generateW3CAnnotation();
            }
            catch (err) {
                error = err;
            }
            expect(error.message).to.equal("Annotation requires an array of annotation targets.");
            done();
        });

        it("should throw an error when annotationTargets is not an array", (done) => {
            var error = null;
            let annotationTargets = "not an array";
            try {
                annotation = AnnotationUtil.generateW3CAnnotation(annotationTargets);
            }
            catch (err) {
                error = err;
            }
            expect(error.message).to.equal("Annotation requires an array of annotation targets.");
            done();
        });

        it("should throw an error when annotationTargets array is empty", (done) => {
            var error = null;
            let annotationTargets = [];
            try {
                let annotation = AnnotationUtil.generateW3CAnnotation(annotationTargets);
            }
            catch (err) {
                error = err;
            }
            expect(error.message).to.equal("Annotation requires an array of annotation targets.");
            done();
        });

        it("should throw an error when receiving no creator", (done) => {
            var error = null;
            let annotationTargets = [1];
            try {
                annotation = AnnotationUtil.generateW3CAnnotation(annotationTargets);
            }
            catch (err) {
                error = err;
            }
            expect(error.message).to.equal("Annotation requires a creator object.");
            done();
        });

        it("should return an annotation when receiving a valid text target", (done) => {
            var creator = "testuser";
            let annotationTargets = [
                {
                    mimeType: "text",
                    source: "urn:vangogh:testletter"
                }
            ];
            let annotation = AnnotationUtil.generateW3CAnnotation(annotationTargets, creator);
            expect(annotation.type).to.equal("Annotation");
            expect(annotation.target[0].type).to.equal("Text");
            expect(annotation.target[0].selector).to.equal(null);
            done();
        });

        it("should return an annotation when receiving a valid text target", (done) => {
            var creator = "testuser";
            let annotationTargets = [
                {
                    mimeType: "text",
                    source: "urn:vangogh:testletter",
                    params: { start: 1, end: 2 }
                }
            ];
            let annotation = AnnotationUtil.generateW3CAnnotation(annotationTargets, creator);
            expect(annotation.type).to.equal("Annotation");
            expect(annotation.target[0].type).to.equal("Text");
            expect(annotation.target[0].selector.type).to.equal("TextPositionSelector");
            done();
        });

        it("should return an annotation when receiving a valid image target", (done) => {
            var creator = "testuser";
            let annotationTargets = [
                {
                    mimeType: "image",
                    source: "urn:vangogh:testletter:page.1",
                    params: { rect: { x: 18, y: 23, w: 100, h: 150 } }
                }
            ];
            let annotation = AnnotationUtil.generateW3CAnnotation(annotationTargets, creator);
            expect(annotation.type).to.equal("Annotation");
            expect(annotation.target[0].type).to.equal("Image");
            expect(annotation.target[0].selector.type).to.equal("FragmentSelector");
            done();
        });

        it("should throw an error when receiving a target without mimetype", (done) => {
            var creator = "testuser";
            var error = null;
            let annotationTargets = [
                {
                    source: "urn:vangogh:testletter:page.1",
                    params: { rect: { x: 18, y: 23, w: 100, h: 150 } }
                }
            ];
            try {
                AnnotationUtil.generateW3CAnnotation(annotationTargets, creator);
            }
            catch (err) {
                error = err
            }
            expect(error.message).to.equal('annotation target requires a mimetype');
            done();
        });

        it("should throw an error when receiving a target without source", (done) => {
            var creator = "testuser";
            var error = null;
            let annotationTargets = [
                {
                    mimeType: "image",
                    params: { rect: { x: 18, y: 23, w: 100, h: 150 } }
                }
            ];
            try {
                AnnotationUtil.generateW3CAnnotation(annotationTargets, creator);
            }
            catch (err) {
                error = err
            }
            expect(error.message).to.equal('annotation target requires a source');
            done();
        });
    });

});

