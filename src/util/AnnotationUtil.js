//aims to implement https://www.w3.org/TR/annotation-model

const AnnotationUtil = {


    /*************************************************************************************
     ************************************* W3C BUSINESS LOGIC HERE ********************
    *************************************************************************************/

    //called from components that want to create a new annotation with a proper target
    generateW3CAnnotation : function(creator, annotationTargets) {
        return {
            "@context": "http://www.w3.org/ns/anno.jsonld",
            type: "Annotation",
            motivation: null,
            creator : creator, //TODO like the selector, generate the w3c stuff here?
            created: Date.now(),
            target : annotationTargets.map(function(annotationTarget) {
                let params = annotationTarget.params;
                if(!annotationTarget.source) {
                    return null;
                }
                let selector = null; //when selecting a piece of the target
                let targetType = null;

                //only try to extract/append the spatio-temporal parameters from the params if there is a mimeType
                if(annotationTarget.mimeType) {
                    if(annotationTarget.mimeType.indexOf('video') != -1) {
                        targetType = 'Video';
                    } else if(annotationTarget.mimeType.indexOf('audio') != -1) {
                        targetType = 'Audio';
                    } else if(annotationTarget.mimeType.indexOf('image') != -1) {
                        targetType = 'Image';
                    } else if(annotationTarget.mimeType.indexOf('text') != -1) {
                        targetType = 'Text';
                    }
                    if (params) {
                        selector = AnnotationUtil.makeSelector(params, targetType);
                    }
                }
                return {
                    source: annotationTarget.source,
                    selector: selector,
                    type: targetType
                }
            })
        }
    },

    generateRelationAnnotation : function(relation, resourceIndex) {
        let creator = "rdfa-annotation-client";
        var annotation = AnnotationUtil.generateW3CAnnotation(creator, []);
        annotation.target = {
            conformsTo: resourceIndex[relation.target].rdfaVocabulary,
            source: relation.target,
            type: resourceIndex[relation.target].rdfaType,
            value: resourceIndex[relation.target].rdfaProperty
        };
        annotation.body = {
            conformsTo: resourceIndex[relation.body].rdfaVocabulary,
            source: relation.body,
            type: resourceIndex[relation.body].rdfaType,
            value: resourceIndex[relation.body].rdfaProperty
        };
        annotation.motivation = "linking";
        return annotation;
    },

    isStructureAnnotation : function(annotation, resourceIndex) {
        // Structure annotations have "linking" as motivation
        if (annotation.motivation !== "linking")
            return false;
        // Structure annotations link two resources that are both in the index
        if (!resourceIndex[annotation.target.source] || !resourceIndex[annotation.body.source])
            return false;
        return true;
    },

    sortAnnotationTypes : function(annotations, resourceIndex) {
        var display = [];
        var structure = [];
        annotations.forEach(function(annotation) {
            AnnotationUtil.isStructureAnnotation(annotation, resourceIndex) ? structure.push(annotation) : display.push(annotation);
        });
        return {display: display, structure: structure};
    },

    /*************************************************************************************
     ************************************* W3C MEDIA FRAGMENTS HELPERS ***************
    *************************************************************************************/

    makeSelector : function(params, targetType) {
        if (targetType === "Text") {
            return AnnotationUtil.makeTextSelector(params);
        }
        else {
            return AnnotationUtil.makeMediaFragmentSelector(params);
        }
    },

    makeMediaFragmentSelector : function(params) {
        var selector = null;
        if(params.start && params.end && params.start != -1 && params.end != -1) {
            return {
                "type": "FragmentSelector",
                "conformsTo": "http://www.w3.org/TR/media-frags/",
                "value": '#t=' + params.start + ',' + params.end
            }
        } else if(params.rect) {
            return {
                "type": "FragmentSelector",
                "conformsTo": "http://www.w3.org/TR/media-frags/",
                "value": '#xywh=' + params.rect.x + ',' + params.rect.y + ',' + params.rect.w + ',' + params.rect.h
            }
        } else {
            return null;
        }
    },

    makeTextSelector : function(params) {
        var selector = null;
        let textPositionSelector = AnnotationUtil.makeTextPositionSelector(params);
        let textQuoteSelector = AnnotationUtil.makeTextQuoteSelector(params);
        let specification = "http://tools.ietf.org/rfc/rfc3870";
        let fragmentSelector = AnnotationUtil.makeFragmentSelector(params, specification);
        if (fragmentSelector) {
            selector = fragmentSelector;
            var refinedBy = [];
            if (textQuoteSelector) { refinedBy.push(textQuoteSelector) }
            if (textPositionSelector) { refinedBy.push(textPositionSelector) }
            if (refinedBy.length > 0) { selector.refinedBy = refinedBy }
        }
        else if (textPositionSelector && textQuoteSelector) {
            selector = [textPositionSelector, textQuoteSelector];
        }
        else if (textPositionSelector) { selector = textPositionSelector }
        else if (textQuoteSelector) { selector = textQuoteSelector }
        return selector;
    },

    makeFragmentSelector : function(params, specification) {
        if (params.resourcePart) {
            return {
                type: "FragmentSelector",
                conformsTo: specification,
                value: params.resourcePart
            }
        }
        return null;
    },

    makeTextQuoteSelector : function(params) {
        if(params.prefix && params.suffix && params.text) {
            return {
                "type": "TextQuoteSelector",
                "prefix": params.prefix,
                "suffix": params.suffix,
                "exact": params.text
            }
        }
        return null;
    },

    makeTextPositionSelector : function(params) {
        if(params.start && params.end) {
            return {
                "type": "TextPositionSelector",
                "start": params.start,
                "end": params.end,
            }
        }
        return null;
    },


    extractTemporalFragmentFromURI : function(uri) {
        let i = uri.indexOf('#t=');
        if(i != -1) {
            return uri.substring(i + 3).split(',');
        }
        return null;
    },

    extractSpatialFragmentFromURI : function(uri) {
        let i = uri.indexOf('#xywh=');
        if(i != -1) {
            let arr = uri.substring(i + 6).split(',');
            return {
                'x' : arr[0],
                'y' : arr[1],
                'w' : arr[2],
                'h' : arr[3]
            }
        }
        return null;
    },

    extractBodies : function(annotation) {
        return Array.isArray(annotation.body) ? annotation.body : [annotation.body];
    },

    extractTargets : function(annotation) {
        return Array.isArray(annotation.target) ? annotation.target : [annotation.target];
    },

    extractTargetSource : function(annotationTarget) {
        if (annotationTarget.source) {
            if (annotationTarget.selector && annotationTarget.selector.value) {
                return annotationTarget.selector.value;
            }
            return annotationTarget.source;
        }
    },

    extractTargetSources : function(annotation) {
        return AnnotationUtil.extractTargets(annotation).map(function(target) {
            return AnnotationUtil.extractTargetSource(target);
        });
    },

    getTargetPositionSelector : function(target) {
        if (!target.selector)
            return null;
        let selector
        if (Array.isArray(target.selector)) {
            target.selector.forEach(function(selector) {
                if (selector.type === "TextPositionSelector");
            })
        }
    },

    /*************************************************************************************
     ************************************* UUID FUNCTIONS ****************************
    *************************************************************************************/

    guid : function() {
        return AnnotationUtil.s4() + AnnotationUtil.s4() + '-' + AnnotationUtil.s4() + '-' +
        AnnotationUtil.s4() + '-' + AnnotationUtil.s4() + '-' + AnnotationUtil.s4() +
        AnnotationUtil.s4() + AnnotationUtil.s4();
    },

    s4 : function() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

}

export default AnnotationUtil;
