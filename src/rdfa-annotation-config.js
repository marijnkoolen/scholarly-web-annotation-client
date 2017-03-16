const config = {
    "id" : "text-annotation",
    "name" : "Basic Text Annotation",
    "type" : "annotation",
    "description" : "Select and annotate text",
    "services" : {
        "AnnotationServer": {
            "api": "http://localhost:3000/api"
        },
        "GTAA": {
            "api": "http://openskos.beeldengeluid.nl/api/autocomplete/",
            "params": {
                "lang": "nl"
            }
        },
        "DBpedia": {
            "api": "http://lookup.dbpedia.org/api/search.asmx/PrefixSearch?QueryClass=&MaxHits=10&QueryString="
        }
    },
    "annotationSupport" : {
        "currentQuery" : {
            "modes" : ["bookmark"]
        },
        "singleItem" : {
            "modes" : ["bookmark"]
        },
        "mediaObject" : {
            "modes" : ["classify", "comment", "link"]
        },
        "mediaSegment" : {
            "modes" : ["classify", "comment", "link"]
        },
        "annotation" : {
            "modes" : ["comment"]
        }
    },
    "annotationModes" : {
        "classify" : {
            "vocabularies" : [
                "DBpedia",
                "GTAA"
            ],
            "type": "classification",
            "purpose": "classifying",
            "format": "text/plain"
        },
        "link" : {
            "apis" : [
                {"name" : "wikidata"},
                {"name" : "europeana"}
            ],
            "type": "link",
            "purpose": "linking",
            "format": "text/plain"
        },
        "bookmark" : {
            "type": "bookmark",
            "purpose": "bookmarking"
        },
        "comment" : {
            "type": "comment",
            "purpose": "commenting",
            "format": "text/plain"
        },
        "correct" : {
            "type": "correction",
            "purpose": "correcting",
            "format": "text/plain"
        },
        "transcribe" : {
            "type": "transcription",
            "purpose": "transcribing",
            "format": "text/plain"
        }
    },
    "candidateTypes": ["resource", "annotation"],
    "tasks": [
        {
            "task": "tagging",
            "placeholder": "Add one or more tags",
            "label": "Tagging"
        },
        {
            "taskname": "describing",
            "placeholder": "Add a description",
            "tasklabel": "Describing"
        }
    ]
}

export default config;
