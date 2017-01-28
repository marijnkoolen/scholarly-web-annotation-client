# Protocol

The RDFa annotation client has to communicate with annotation servers for storing and retrieving annotations. The [W3C Annotation Protocol](https://www.w3.org/TR/annotation-protocol/) describes some basic CRUD and discovery protocols. There are several more aspects that need to be worked out.

## Search

## Annotation types

1. resource part-whole relation annotations: these are basic annotations to indicate how two or more resources are related to each other based on the generic annotation ontology or an extension of it. The RDFa annotation server uses these to reason about which annotations to retrieve for a request for annotations related to a particular resource. That is, annotations on a sub-resource (partOf the requested resource) should also be retrieved, even though these annotations do not directly target the requested resource.
2. enrichment annotations: the annotations shown by the RDFa annotation client as annotations on displayed resources.
3. annotations of annotations: annotations themselves can be the target of a further annotation. 

TODO: properly work out the annotation types to make clear how the RDFa annotation client interprets different annotation types.

## Graph-based Retrieval of Annotations

The RDFa Annotation client requests annotations on a resource `r` and expects to `GET` all annotations that target `r` or a sub-resource of `r`.