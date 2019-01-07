const config = {
    "targetObserver": {
        "targetObserverClass": "annotation-target-observer",
        "observeMutations": true,
        "observerConfig": {
            "childList": true,
            "attributes": false,
            "subtree": true
        }
    },
    "services" : {
        "AnnotationServer": {
            "api": "http://localhost:3000/api"
        },
        "GTAA": {
            "api": "http://openskos.beeldengeluid.nl/api/autocomplete/?q=",
            "params": {
                "lang": "nl"
            },
            "lookupParameter": "q"
        },
        "DBpedia": {
            "api": "http://lookup.dbpedia.org/api/search.asmx/PrefixSearch?QueryClass=&MaxHits=10&QueryString="
        },
        "UNESCO": {
            "api": "http://vocabularies.unesco.org/browser/rest/v1/search?vocab=thesaurus&lang=en&labellang=en&query=",
            "addWildcard": true
        },
        "Wikipedia": {
            "api": "https://en.wikipedia.org/w/api.php?action=opensearch&limit=20&namespace=0&format=json&search="
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
    "annotationTasks" : {
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
    }
};

export default config;
