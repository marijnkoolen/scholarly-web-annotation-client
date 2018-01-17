# The AnnotatableThing Ontology

The Scholarly Web Annotation client uses RDFa reason about the page it is annotating. A page can use any Semantic Web ontology to describe itself, but for some specific scholarly goals, there is an annotation ontology that the client can use for special functionalities. 

The AnnotatableThing Ontology extends the FRBRoo ontology, so that scholars can differentiate between conceptual levels of the resources presented on a page and choose which level they want to annotate. E.g. it is possible to describe a resource both at the level of a work, or a specific manifestation or expression of it. For instance, when annotating a letter that is part of correspondence, scholars may want to annotate a phrase in the text to say something about the letter in general, or about some aspect of the specific transcription or translation.

The FRBRoo ontology is very extensive, and in many cases only a few of the concepts will be relevant, so we demonstrate how our AnnotatableThing Ontology connects to some of the basic concepts of FRBRoo related to *Works*. 

## Extending the ontology

It is possible to extent the AnnotatableThing Ontology with further concepts from FRBRoo or CIDOC/CRM to describe resources or aspects of resource that are of interest for a specific scholarly use case. 

## AnnotatableThing and FRBRoo connections

The screenshots below demonstrate how resources can be described as `CreativeWorks` that are annotatable. 

![Image not found](./screenshots/Work-Realisation-Example.jph)
*Figure 1. Example of a digital edition of a Letter by Vincent van Gogh, connected to the FRBRoo concepts of Complex Work, Individual Work, Self-Contained Expression and Expression Fragment.* 

This example is based on the Work Realisation example in the [Definition of FRBRoo v2.4](https://www.ifla.org/files/assets/cataloguing/FRBRoo/frbroo_v_2.4.pdf), Figure 3, page 20. The letter is part of a correspondence of multiple letters, which makes the correspondence a complex work. But the letter itself consists of multiple creative works. The abstract content of the original work is an individual work, but each transcription and each translation is itself also a creative work, that an annotation might refer to. E.g. if a scholar wants to use an annotation to indicate that a particular transcription contains a mistake, the scholars wants to be able to refer to the text containing the mistake at the level of the transcription. If the scholar instead wants to annotate the same piece of text with a comment about Vincent van Gogh’s writing, the annotation should refer to the abstract content of the original letter.

The reason to use different conceptual levels is that the client may want to treat them differently. For instance, a digital edition may wish to show annotations on the abstract content of the original letter with every expression of it, e.g. to its transcription in Dutch as well as to its translation to English. The same digital edition may wish to show an annotation about a mistake in the English translation only with that particular translation.

## Special features of the AnnotatableThing Ontology

There are two special concepts that affect how the SWA client behaves, for identifying elements that should be unselectable or only selectable as a whole. 

### Atomic Content Elements

You may want to consider certain aspects of a resource to be atomic, such as metadata properties, that should only be annotatable as a whole. If you don’t want users to be able to select and annotate fragments of these atomic units, you can wrap them in a HTML element and add the `SelectWholeElement` property. When a user selects a fragment of such an element, the SWA client will automatically expand the selection to the entire element.

### Ignorable Elements

A web page that presents a resource often contains additional content that is not related or relevant to the resource and that should not be annotatable. The AnnotatableThing Ontology contains the concept `IgnoreableElement` that the SWA client will make unselectable. 

