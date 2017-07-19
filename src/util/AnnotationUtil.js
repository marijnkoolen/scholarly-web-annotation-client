//aims to implement https://www.w3.org/TR/annotation-model

const AnnotationUtil = {


    /*************************************************************************************
     ************************************* W3C BUSINESS LOGIC HERE ********************
    *************************************************************************************/

    //called from components that want to create a new annotation with a proper target
    generateW3CAnnotation : function(annotationTargets, creator) {
        console.log(annotationTargets);
        if (!AnnotationUtil.hasTargets(annotationTargets))
            throw new Error('Annotation requires an array of annotation targets.');
        if (creator === undefined)
            throw new Error('Annotation requires a creator object.')
        let targetList = annotationTargets.map(function(annotationTarget) {
            return AnnotationUtil.makeAnnotationTarget(annotationTarget);
        });
        return {
            "@context": "http://www.w3.org/ns/anno.jsonld",
            type: "Annotation",
            motivation: null,
            creator : creator, //TODO map to W3C
            target : targetList,
        }
    },

    hasTargets : (targets) => {
        if (targets === undefined)
            return false;
        if (!Array.isArray(targets))
            return false;
        if (targets.length === 0)
            return false;
        return true;
    },

    makeAnnotationTarget : (target) => {
        if (target.source === undefined)
            throw Error('annotation target requires a source');
        let selector = null;
        let targetType = AnnotationUtil.determineTargetType(target.mimeType);
        if (target.params !== undefined) {
            selector = AnnotationUtil.makeSelector(target.params, targetType);
        }
        return {
            source: target.source,
            selector: selector,
            type: targetType
        }
    },

    determineTargetType : (mimeType) => {
        if (mimeType === undefined)
            throw Error('annotation target requires a mimetype');
        if(mimeType.startsWith('video')) {
            return 'Video';
        } else if(mimeType.startsWith('audio')) {
            return 'Audio';
        } else if(mimeType.startsWith('image')) {
            return 'Image';
        } else if(mimeType.startsWith('text')) {
            return 'Text';
        } else {
            return null;
        }
    },

    /*************************************************************************************
     ************************************* W3C MEDIA FRAGMENTS HELPERS ***************
    *************************************************************************************/

    makeSelector : function(params, targetType) {
        if (targetType === "Text") {
            return AnnotationUtil.makeTextSelector(params);
        } else if (["Image", "Audio", "Video"].includes(targetType)){
            return AnnotationUtil.makeMediaFragmentSelector(params);
        } else {
            return null;
        }
    },

    makeMediaFragmentSelector : function(params) {
        if (params === undefined)
            return null;
        if(params.start && params.end && params.start != -1 && params.end != -1) {
            return {
                type: "FragmentSelector",
                conformsTo: "http://www.w3.org/TR/media-frags/",
                value: '#t=' + params.start + ',' + params.end
            }
        } else if(params.rect) {
            return {
                type: "FragmentSelector",
                conformsTo: "http://www.w3.org/TR/media-frags/",
                value: '#xywh=' + params.rect.x + ',' + params.rect.y + ',' + params.rect.w + ',' + params.rect.h,
                rect: params.rect
            }
        } else {
            return null;
        }
    },

    makeTextSelector : function(params) {
        let textPositionSelector = AnnotationUtil.makeTextPositionSelector(params);
        let textQuoteSelector = AnnotationUtil.makeTextQuoteSelector(params);
        if (textPositionSelector && textQuoteSelector) {
            return [textPositionSelector, textQuoteSelector];
        } else if (textPositionSelector) {
            return textPositionSelector
        } else if (textQuoteSelector) {
            return textQuoteSelector
        }
        return null;
    },

    makeTextQuoteSelector : function(params) {
        if (params === undefined)
            return null;
        if(params.prefix !== undefined && params.suffix !== undefined && params.text !== undefined) {
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
        if (params === undefined)
            return null;
        if(params.start !== undefined && params.end !== undefined) {
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

    extractTargetIdentifier : function(annotationTarget) {
        if (typeof(annotationTarget) === "string")
            return annotationTarget;
        if (annotationTarget.id)
            return annotationTarget.id;
        if (annotationTarget.source) // the target is a selection in a source
            return annotationTarget.source;
        return null;
    },

    extractTargetIdentifiers : function(annotation) {
        return AnnotationUtil.extractTargets(annotation).map(function(target) {
            return AnnotationUtil.extractTargetIdentifier(target);
        });
    },

    getTextPositionSelector :function(target) {
        if (!target.selector)
            return null;
        if (!target.type || target.type !== "Text")
            return null;
        var textPosition = null;
        let selectors = Array.isArray(target.selector) ? target.selector : [target.selector];
        selectors.forEach((selector) => {
            if (selector.type === "TextPositionSelector")
                textPosition = selector;
        });
        return textPosition;
    },

    getTextQuoteSelector :function(target) {
        if (!target.selector)
            return null;
        if (!target.type || target.type !== "Text")
            return null;
        var textQuote = null;
        let selectors = Array.isArray(target.selector) ? target.selector : [target.selector];
        selectors.forEach((selector) => {
            if (selector.type === "TextQuoteSelector")
                textQuote = selector;
        });
        return textQuote;
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
