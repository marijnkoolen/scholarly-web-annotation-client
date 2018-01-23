# Scholarly Web Annotation CLIENT API

## Initialization and Configuration

### Load the module

Include the `scholary-web-annotation-client.js` module in your web page:

```
    <script type=”text/javascript” src=”scholarly-web-annotation-client.js”></script>
```

### Create a configuration

```
{
    "services" : {
        "AnnotationServer": {
            "api": "http://annotation.server.address"
        },
        "DBpedia": {
            "api": "http://lookup.dbpedia.org/api/search.asmx/PrefixSearch?QueryClass=&MaxHits=10&QueryString="
        }
    },
    "annotationTasks" : {
        "bookmark" : {
            "type": "bookmark",
            "purpose": "bookmarking"
        },
        "classify" : {
            "type": "classification",
            "purpose": "classifying",
            "format": "text/plain",
            "vocabularies" : [
                "DBpedia"
            ]
        },
        "correct" : {
            "type": "correction",
            "purpose": "correcting",
            "format": "text/plain"
        },
        "link" : {
            "type": "link",
            "purpose": "linking",
            "format": "text/plain",
            "apis" : [
                {"name" : "wikidata"},
                {"name" : "europeana"}
            ]
        },
        "tag": {
            "type": "tag",
            "purpose": "tagging",
            "format": "text/plain"
        },
        "transcribe" : {
            "type": "transcription",
            "purpose": "transcribing",
            "format": "text/plain"
        }
    },
    "defaults": {
        "target": ["ParagraphInLetter", "Note", "LocationNote", "SourceNote"]
    }
}
```

The example below is based on the [Van Gogh annotation ontology](http://boot.huygens.knaw.nl/annotate/vangoghontology.ttl).

The services should include at least an annotation server to connect to. In addition, it could list services for looking up terms in vocabularies (such as the DBpedia lookup service) for classification and looking up resources (in e.g. wikidata, Europeana) for linking.

Any number of annotation tasks can be added, which results in a tab in the annotation interface for each task defined in the configuration. Note that classifying and linking are special tasks with lookup support, where the other tasks simple provide a text box. The task is captured as the `purpose` of the annotation body, and the text in the text box as the `value` of the annotation body.

The defaults should be taken from the ontology with which resources are described and function as default units of the resources that are offered as targets for annotation. The user can target non-default resource parts by selecting them.

### Initialize the client

In your web page, initialize the client with a JSON configuration like the one above.

```
    <script type=”text/javascript”>
        config = { ... };
        var annotator = new ScholarlyWebAnnotator.ScholarlyWebAnnotator(config);
        annotator.addAnnotationClient();
    </script>
```

