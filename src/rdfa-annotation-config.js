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
			]
		},
		"link" : {
			"apis" : [
				{"name" : "wikidata"},
				{"name" : "europeana"}
			]
		},
		"bookmark" : {},
		"comment" : {}
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
