//aims to implement https://www.w3.org/TR/annotation-model

import SelectionUtil from './SelectionUtil.js';

const AnnotationUtil = {


    /*************************************************************************************
     ************************************* W3C BUSINESS LOGIC HERE ********************
    *************************************************************************************/

    //called from components that want to create a new annotation with a proper target
    generateW3CAnnotation : function(annotationTargets, creator) {
        if (!AnnotationUtil.hasTargets(annotationTargets))
            throw new Error('Annotation requires a non-empty array of annotation targets.');
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
        let targetType = AnnotationUtil.determineTargetType(target);
        if (target.params !== undefined) {
            selector = AnnotationUtil.makeSelector(target.params, targetType);
        }
        return {
            source: target.source,
            selector: selector,
            scope: window.location.href,
            type: targetType
        }
    },

    determineTargetType : (target) => {
        if (target.type === "annotation")
            return "Annotation"
        if (target.mimeType === undefined)
            throw Error('annotation target requires a mimetype');
        if(target.mimeType.startsWith('video')) {
            return 'Video';
        } else if(target.mimeType.startsWith('audio')) {
            return 'Audio';
        } else if(target.mimeType.startsWith('image')) {
            return 'Image';
        } else if(target.mimeType.startsWith('text')) {
            return 'Text';
        } else {
            return null;
        }
    },

    /*************************************************************************************
     ************************************* W3C Subresource HELPERS ***************
    *************************************************************************************/

    makeNestedPIDSelector : function(breadcrumbTrail) {
        if (!AnnotationUtil.hasSubresources(breadcrumbTrail)) {
            throw new Error('makeNestedPIDSelector requires a breadcrumb trail');
        }
        let nestedPIDList = breadcrumbTrail.map((breadcrumb) => {
            return {
                id: breadcrumb.id,
                property: breadcrumb.property,
                type: breadcrumb.type
            }
        });
        return {
            "@context": "http://boot.huygens.knaw.nl/annotate/swao.jsonld",
            type: "NestedPIDSelector",
            value: nestedPIDList
        };
    },

    makeSubresourceSelector : function(breadcrumbTrail) {
        if (!AnnotationUtil.hasSubresources(breadcrumbTrail)) {
            throw new Error('makeSubresourceSelector requires a breadcrumb trail');
        }
        return {
            "@context": "http://boot.huygens.knaw.nl/annotate/swao.jsonld",
            type: "SubresourceSelector",
            value: AnnotationUtil.makeSubresourceBranch(breadcrumbTrail)
        }
    },

    makeSubresourceBranch : (breadcrumbTrail) => {
        let top = breadcrumbTrail.shift();
        var branch = {
            id: top.id,
            type: top.type,
        }
        if (top.property)
            branch.property = top.property;
        if (breadcrumbTrail.length)
            branch.subresource = AnnotationUtil.makeSubresourceBranch(breadcrumbTrail);
        return branch;
    },

    hasSubresources : (breadcrumbTrail) => {
        if (breadcrumbTrail === undefined)
            return false;
        if (!Array.isArray(breadcrumbTrail))
            return false;
        if (breadcrumbTrail.length === 0)
            return false;
        return breadcrumbTrail.every((breadcrumb) => {
            if (typeof(breadcrumb) !== "object")
                return false;
            let requiredProperties = ["id", "type", "property"];
            return requiredProperties.every((property) => {

                return Object.keys(breadcrumb).includes(property);
            });
        });
    },

    /*************************************************************************************
     ************************************* W3C MEDIA FRAGMENTS HELPERS ***************
    *************************************************************************************/

    makeSelector : function(params, targetType) {
        if (params.breadcrumbs !== undefined) {
            var selector = AnnotationUtil.makeNestedPIDSelector(params.breadcrumbs);
            if (targetType)
                selector.refinedBy = AnnotationUtil.makeMimeSelector(params, targetType);
            return selector;
        } else {
            return AnnotationUtil.makeMimeSelector(params, targetType);
        }
    },

    makeMimeSelector : function(params, targetType) {
        if (targetType === "Text") {
            return AnnotationUtil.makeTextSelector(params);
        } else if (["Audio", "Image", "Video"].includes(targetType)) {
            return AnnotationUtil.makeMediaFragmentSelector(params);
        } else {
            return null;
        }
    },

    makeMediaFragmentSelector : function(params) {
        if (params === undefined)
            return null;
        if (params.interval !== undefined) {
            SelectionUtil.checkInterval(params.interval);
            return {
                type: "FragmentSelector",
                conformsTo: "http://www.w3.org/TR/media-frags/",
                value: '#t=' + params.interval.start + ',' + params.interval.end,
                interval: params.interval
            }

        } else if (params.rect !== undefined) {
            SelectionUtil.checkRectangle(params.rect);
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
        if (params === undefined || (!params.position && !params.quote))
            return null;
        let textPositionSelector = AnnotationUtil.makeTextPositionSelector(params.position);
        let textQuoteSelector = AnnotationUtil.makeTextQuoteSelector(params.quote);
        if (textPositionSelector && textQuoteSelector) {
            return [textPositionSelector, textQuoteSelector];
        } else if (textPositionSelector) {
            return textPositionSelector
        } else if (textQuoteSelector) {
            return textQuoteSelector
        }
        return null;
    },

    makeTextQuoteSelector : function(quote) {
        if (quote === undefined)
            return null;
        if (!quote.exact)
            throw new Error('text quote parameters should contain property exact');
        if (!quote.suffix)
            throw new Error('text quote parameters should contain property suffix');
        if (!quote.prefix)
            throw new Error('text quote parameters should contain property prefix');
        if(quote.prefix !== undefined && quote.suffix !== undefined && quote.exact !== undefined) {
            return {
                "type": "TextQuoteSelector",
                "prefix": quote.prefix,
                "suffix": quote.suffix,
                "exact": quote.exact
            }
        }
        return null;
    },

    makeTextPositionSelector : function(position) {
        if (!position)
            return null;
        if (!position.start)
            throw new Error('text position parameters should contain property start');
        if (!position.end)
            throw new Error('text position parameters should contain property end');
        if(position.start !== undefined && position.end !== undefined) {
            return {
                "type": "TextPositionSelector",
                "start": position.start,
                "end": position.end,
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
