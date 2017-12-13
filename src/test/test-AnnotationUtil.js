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
            let params = {interval: {start: 1, end: 1}};
            let selector = AnnotationUtil.makeMediaFragmentSelector(params);
            expect(selector.type).to.equal("FragmentSelector");
            let urlParam = '#t=' + params.interval.start + ',' + params.interval.end;
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

        it("should throw an error when receiving unknown parameters", (done) => {
            let params = {unknown: 1};
            let error = null;
            try {
                let selector = AnnotationUtil.makeTextPositionSelector(params);
            }
            catch(err) {
                error = err;
            }
            expect(error.message).to.include("should contain property start");
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

        it("should throw an error when receiving unknown parameters", (done) => {
            let params = {unknown: 1};
            let error = null;
            try {
                let selector = AnnotationUtil.makeTextQuoteSelector(params);
            }
            catch(err) {
                error = err;
            }
            expect(error.message).to.include("should contain property exact");
            return done();
        });

        it("should return a TextQuote selector when receiving text quote parameters", (done) => {
            let params = {exact: "some text", prefix: "a prefix to ", suffix: ", followed by a suffix"};
            let selector = AnnotationUtil.makeTextQuoteSelector(params);
            expect(selector.type).to.equal("TextQuoteSelector");
            expect(selector.exact).to.equal(params.exact);
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
                position: {
                    start: 1,
                    end: 1
                }
            };
            let selector = AnnotationUtil.makeTextSelector(params);
            expect(selector.type).to.equal("TextPositionSelector");
            return done();
        });

        it("should return a TextQuote selector when receiving text quote parameters", (done) => {
            let params = {
                quote: {
                    exact: "some text",
                    prefix: "a prefix to ",
                    suffix: ", followed by a suffix"
                }
            };
            let selector = AnnotationUtil.makeTextSelector(params);
            expect(selector.type).to.equal("TextQuoteSelector");
            return done();
        });

        it("should return an array with TextPosition and TextQuote selectors when receiving text position and qoute parameters", (done) => {
            let params = {
                position: {
                    start: 1,
                    end: 1,
                },
                quote: {
                    exact: "some text",
                    prefix: "a prefix to ",
                    suffix: ", followed by a suffix"
                }
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
                position: {
                    start: 1,
                    end: 2
                }
            };
            let targetType = "Text";
            let selector = AnnotationUtil.makeSelector(params, targetType);
            expect(selector.type).to.equal("TextPositionSelector");
            return done();
        });

        it("should return a FragmentSelector when receiving time interval parameters", (done) => {
            let params = {
                interval: {
                    start: 1,
                    end: 2
                }
            };
            let targetType = "Video";
            let selector = AnnotationUtil.makeSelector(params, targetType);
            expect(selector.type).to.equal("FragmentSelector");
            return done();
        });

    });

    describe("hasSubresources", () => {

        it("should return false when receiving no data", (done) => {
            let status = AnnotationUtil.hasSubresources();
            expect(status).to.equal(false);
            return done();
        });

        it("should return false when receiving a non-array", (done) => {
            let status = AnnotationUtil.hasSubresources("some string");
            expect(status).to.equal(false);
            return done();
        });

        it("should return false when receiving an empty array", (done) => {
            let status = AnnotationUtil.hasSubresources([]);
            expect(status).to.equal(false);
            return done();
        });

        it("should return false when receiving an array of non-objects", (done) => {
            let status = AnnotationUtil.hasSubresources(["string"]);
            expect(status).to.equal(false);
            return done();
        });

        it("should return false when receiving an array of non-breadcrumb objects", (done) => {
            let status = AnnotationUtil.hasSubresources([{id: 12, type: "Annotation"}]);
            expect(status).to.equal(false);
            return done();
        });

        it("should return true when receiving an array of valid breadcrumb objects", (done) => {
            let status = AnnotationUtil.hasSubresources([{id: 12, type: "Annotation", property: "hasPart"}]);
            expect(status).to.equal(true);
            return done();
        });

        it("should return true when receiving an array of valid breadcrumb objects with additional properties", (done) => {
            let breadcrumb = {id: 12, type: "Annotation", property: "hasPart", node: "node"};
            let status = AnnotationUtil.hasSubresources([breadcrumb]);
            expect(status).to.equal(true);
            return done();
        });
    });

    describe("makeNestedPIDSelector", () => {

        it("should throw an error when receiving no data", (done) => {
            var error = null;
            try {
                AnnotationUtil.makeNestedPIDSelector();
            }
            catch(err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            expect(error.message).to.equal("makeNestedPIDSelector requires a breadcrumb trail");
            return done();
        });

        it("should return a selector when receiving a valid breadcrumb trail", (done) => {
            let breadcrumbs = [
                {id: 1, type: "Correspondence", property: "isPartOf", node: "node"},
                {id: 2, type: "Letter", property: "hasPart", node: "node"},
                {id: 3, type: "Translation", property: "hasTranslation", node: "node"},
            ];
            let selector = AnnotationUtil.makeNestedPIDSelector(breadcrumbs);
            expect(selector.type).to.equal("NestedPIDSelector");
            expect(selector.value).to.exist;
            expect(selector.value[0].type).to.equal("Correspondence");
            return done();
        })
    });

    describe("makeSubresourceSelector", () => {

        it("should throw an error when receiving no data", (done) => {
            var error = null;
            try {
                AnnotationUtil.makeSubresourceSelector();
            }
            catch(err) {
                error = err;
            }
            expect(error).to.not.equal(null);
            expect(error.message).to.equal("makeSubresourceSelector requires a breadcrumb trail");
            return done();
        });

        it("should return a selector when receiving a valid breadcrumb trail", (done) => {
            let breadcrumbs = [
                {id: 1, type: "Correspondence", property: "isPartOf", node: "node"},
                {id: 2, type: "Letter", property: "hasPart", node: "node"},
                {id: 3, type: "Translation", property: "hasTranslation", node: "node"}
            ];
            let selector = AnnotationUtil.makeSubresourceSelector(breadcrumbs);
            expect(selector.type).to.equal("SubresourceSelector");
            expect(selector.value).to.exist;
            expect(selector.value.type).to.equal("Correspondence");
            return done();
        })
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
            expect(error.message).to.equal("Annotation requires a non-empty array of annotation targets.");
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
            expect(error.message).to.equal("Annotation requires a non-empty array of annotation targets.");
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
            expect(error.message).to.equal("Annotation requires a non-empty array of annotation targets.");
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

        it("should return an annotation when receiving a valid text target with parameters", (done) => {
            var creator = "testuser";
            let annotationTargets = [
                {
                    mimeType: "text",
                    source: "urn:vangogh:testletter",
                    params: {position: { start: 1, end: 2 }}
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

        it("should return an annotation when receiving a breadcrum trail target", (done) => {
            var creator = "testuser";
            let breadcrumbs = [
                {id: "urn:vangogh:correspondence", type: "Correspondence", property: "isPartOf", node: "node"},
                {id: "urn:vangogh:testletter", type: "Letter", property: "hasPart", node: "node"},
                {id: "urn:vangogh:testletter:page.1", type: "TextBearer", property: "isCarriedOn", node: "node"}
            ];
            let annotationTargets = [
                {
                    mimeType: "image",
                    source: "urn:vangogh:testletter",
                    params: {
                        breadcrumbs: breadcrumbs,
                        rect: { x: 18, y: 23, w: 100, h: 150 }
                    }
                }
            ];
            let annotation = AnnotationUtil.generateW3CAnnotation(annotationTargets, creator);
            expect(annotation.type).to.equal("Annotation");
            expect(annotation.target[0].type).to.equal("Image");
            expect(annotation.target[0].selector.type).to.equal("NestedPIDSelector");
            expect(annotation.target[0].selector.refinedBy.type).to.equal("FragmentSelector");
            done();
        });
    });

});

