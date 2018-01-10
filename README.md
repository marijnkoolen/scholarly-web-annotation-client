# Scholarly Web Annotation Client

Javascript annotation client for RDFa enriched web resources based on the W3C Web Annotation standard. This client is developed by the [Netherlands Institute for Sound and Vision](http://labs.beeldengeluid.nl/) and [Huygens ING](https://www.huygens.knaw.nl/?lang=en) for the research infrastructure project [CLARIAH](https://www.clariah.nl/en/). It is being developed in tandem with the [Scholarly Web Annotation Server](https://github.com/marijnkoolen/scholarly-web-annotation-server).

+ [Embedding the Scholarly Web Annotation Client](#embed)
+ [Using the Scholarly Web Annotation Client](#use)
+ [Modifying the Scholarly Web Annotation Client](#develop)

<a name=”embed”></a>
## Embedding the Scholary Web Annotation Client

### Loading Client Dependencies

This JS library requires [jQuery](https://jquery.com/) and [Bootstrap](https://getbootstrap.com/) to be loaded individually in the web page.

Add the following lines to your HTML:

```
<script src=”https://code.jquery.com/jquery-2.2.4.js”></script>
<script src=”https://code.jquery.com/ui/1.12.1/jquery-ui.js”></script>
<script src=”http://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js”></script>
<link rel=”stylesheet” href=”http://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css”>

```

### Configuring the Client

The configuration consists of four parts:

1. `targetobserverclass`: this is the class name that the client will use to select HTML DOM elements to consider as annotatable objects. It is possible to specify multiple `observer target` elements. The SWA client starts a watcher that will re-initialise the client when anything in the `observer target` elements change. This allows you to use the SWA client with dynamic content, such as search results.

2. `services`: here you can specify addresses for APIs, including the annotation server that the SWA client will use for sending and retrieving annotations, and APIs for vocabularies that the client can use for classifying and linking annotation targets.

3. `annotationTasks`: here you can specify which types of annotations you want to the SWA client to offer. These are based on the [W3C Annotation Model Motivations](https://www.w3.org/TR/annotation-model/#motivation-and-purpose), but you can also create new motivations (see the [W3C Annotation Vocabulary](https://www.w3.org/TR/annotation-vocab/#extending-motivations) on how to extend the list of motivations). Each task has a `type` and a `purpose` property. The `type` property is used as a label presented to the user to identify the type of each annotation. The `purpose` property relates to the W3C Motivation and is added to the underlying W3C annotation as the purpose of a specific annotation body.

4. `defaults`: here you can specify defaults for certain aspects of the annotation process, including the default target types. This is an efficient way to provide users with a default list of annotation targets based on the vocabulary with which the annotatable objects in the DOM are described. For instance, in the example of the Van Gogh correspondence, if the edition maintainer expects most users will want to annotate the paragraphs of letters, they can set `Paragraphinletter` as the default target type. When a user then hit the `Make annotation` button, the client lists the individual paragraphs as default targets.

Put the configuration in a JSON object:

```json
{
    "targetObserverClass": "annotation-target-observer",
    "services" : {
        "AnnotationServer": {
            "api": "http://localhost:3000/api"
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
            "format": "text/plain",
            "specifies": "classify"
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

### Adding the Client to the Page

Once you have a SWA client configuration, you can instantiate a client object and insert in the page:

```js
annotator = new ScholarlyWebAnnotator.ScholarlyWebAnnotator(config); // instantiate client with configuration
var viewerElement = document.getElementById(‘annotation-viewer’); // select DOM element to attach client to
annotator.addAnnotationClient(viewerElement); // insert client in the DOM
```

### A complete example

Here is a complete example to demonstrate how you can setup a web page with an RDFa-enriched resource and a fully-configured annotation client. This example assumes four files sitting in the same web directory that is served over HTTP: the SWA client library (`scholarly-web-annotation-client.js`), a configuration file (`annotator_config.js`), a loading script to configure and embed the client (`load_annotator.js`) and an HTML file with the RDFa-enriched resource (`index.html`).

`annotator_config.js`:

```json
{
    "targetObserverClass": "annotation-target-observer",
    "services" : {
        "AnnotationServer": {
            "api": "http://<annotation.server.address>/api"
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
            "format": "text/plain",
            "specifies": "classify"
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

`load_annotator.js`:

```js
document.onreadystatechange = function () { // wait till page is loaded
    if (document.readyState === "complete") {
        console.log("document ready!");
        loadConfig((error, config) => { // load configuration file
            if (error)
                return null;
            // instantiate, configure and insert client
            annotator = new ScholarlyWebAnnotator.ScholarlyWebAnnotator(config);
            var viewerElement = document.getElementById('annotation-viewer');
            annotator.addAnnotationClient(viewerElement);
        });
    }
}

var loadConfig = function(callback) {
    fetch("annotator_config.json", {
        method: "GET"
    }).then(function(response) {
        return response.json();
    }).then(function(config) {
        return callback(null, config);
    }).catch(function(error) {
        return callback(error, null);
    });
}

```

Finally, create an HTML file that loads the dependencies, the SWA client library and the loading script.

`index.html`:

```xhtml
<html>
    <head>
        <script src=”https://code.jquery.com/jquery-2.2.4.js”></script>
        <script src=”https://code.jquery.com/ui/1.12.1/jquery-ui.js”></script>
        <script src=”http://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js”></script>
        <link rel=”stylesheet” href=”http://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css”>
    </head>
    <body>
        <div class=”annotation-target-observer”>
            <div typeof=”Letter” resource=”urn:vangogh:letter001” vocab=”http://boot.huygens.knaw.nl/annotate/vangoghontology.ttl”>
                <p typeof=”Paragraphinletter” resource=”urn:vangogh:letter001:p.1” property=”hasPart”>Text of the first paragraph.</p>
                <p typeof=”Paragraphinletter” resource=”urn:vangogh:letter001:p.2” property=”hasPart”>Text of the second paragraph.</p>
            </div>
        </div>
        <div class=”annotation-viewer”></div>
        <script src=”./scholarly-web-annotator.js”></script>
        <script src=”./load_annotator.js”></script>
    </body>
</html>
```


<a name=”use”></a>
## Using the Scholary Web Annotation Client

Once you have the client up and running, as well as a SWA server, you can start annotating.

Below are screenshots demonstrating how to use the client.

![Image not found](docs/screenshots/swa-plain-view.png)
*Figure 1: the client embedded in a basic web page that is enriched with RDFa information describing the various parts of the letter.*


![Image not found](docs/screenshots/swa-text-selection-view.png)
*Figure 2: If you want to annotate some fragment of text of the letter, select it, then click on the `Make annotation` button to bring up the target selection screen.*


![Image not found](docs/screenshots/swa-make-annotation-target-view.png)
*Figure 3: the client lists the highlighted fragment and larger annotatable objects that contain that fragment as potential annotation targets. Clicking on one or more of these targets will select them as targets for a new W3C annotation. Clicking on the `Annotate` button in the bottom left brings you to the annotation body view.*


![Image not found](docs/screenshots/swa-make-annotation-body-view.png)
*Figure 4: In the annotation body view, you can add the content of your annotation. The different types of annotation available at the top are based on the configuration of the client. For classification and linking types that connect to a vocabulary (e.g. DBpedia, Wikidata, Europeana), typing content will bring up suggested terms from the respective vocabularies. You can configure which vocabularies are available (see above). Clicking on `Save` will send the annotation to the annotation server that is specified in the client configuration.*


![Image not found](docs/screenshots/swa-highlight-text-annotation-view.png)
*Figure 5: By clicking on one of the annotations on the right, that annotated part of the letter (the annotation targets) is highlighted. The annotation also shows a breadcrumb trail listing the branch of annotatable objects that this annotation targets. E.g. in the first annotation that targets the text ‘Oisterwijk’ in the fifth paragraph, the objects that contain this text are the ParagraphInLetter, the whole Letter and the entire Correspondence that the letter is part of. The client automatically generates this breadcrumb from analyzing the underlying RDFa information.*


![Image not found](docs/screenshots/swa-highlight-image-annotation-view.png)
*Figure 6: Text annotation works by default. You can also select entire images and videos if they are enriched with RDFa information. It is also possible to annotate Image fragments. For this, you need to provide an image selection library. The SWA client has functionality to listen to image selection events with which you can pass the selected coordinates to the client to annotate that image fragment(s).*





<a name=”develop”></a>
## Modifying the Scholarly Web Annotation Client

### How to install

Clone the repository:
```
git clone https://github.com/CLARIAH/scholarly-web-annotation-client.git
```

Install the required npm packages:
```
npm install
```

The repository contains code for a basic Python/Flask server with which you can experiment with toy examples. To run the server, install the required python packages:
```
pip install -r requirements.txt
```

For the Image annotation example, make sure to install the [OpenSeadragonSelection](https://github.com/picturae/openseadragonselection) plugin in the `public/js/` folder.

## How to test

You need the run the [Scholarly Web Annotation Server](https://github.com/marijnkoolen/scholarly-web-annotation-server) in the background for the client to function properly.

Start the server:
```
python resource_server.py
```

### Testing text annotation

Point your browser to `localhost:3001` to try a test letter.

### Testing Image annotation

Point your browser to `localhost:3001/beng-image-example`.

### Testing Video annotation

Point your browser to `localhost:3001/beng-av-example`.

## How to modify

Run the webpack watcher:
```
npm run dev
```

Whenever you modify source files in `src/`, the watcher will rebuild the Javascript bundle `public/js/scholarly-web-annotator.js` that’s used in the test letter `public/testletter.html`.

