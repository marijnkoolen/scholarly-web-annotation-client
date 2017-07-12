# RDFa Annotation Client

Javascript annotation client for RDFa enriched web resources based on the W3C Web Annotation standard. This client is developed by the [Netherlands Institute for Sound and Vision](http://labs.beeldengeluid.nl/) and [Huygens ING](https://www.huygens.knaw.nl/?lang=en) for the research infrastructure project [CLARIAH](https://www.clariah.nl/en/). It is being developed in tandem with the [Scholarly Web Annotation Server](https://github.com/marijnkoolen/scholarly-web-annotation-server).

## How to install

Clone the repository:
```
git clone https://github.com/CLARIAH/scholarly-web-annotation-client.git
```

Install the required npm packages:
```
npm install
```

Install the required python packages:
```
pip install
```

## How to test

You need the run the [Scholarly Web Annotation Server](https://github.com/marijnkoolen/scholarly-web-annotation-server) in the background for the client to function properly.

Start the server:
```
python resource_server.py
```

and point your browser to `localhost:3001`

## How to modify

Run the webpack watcher:
```
npm run dev
```

Whenever you modify source files in `src/`, the watcher will rebuild the Javascript bundle `public/js/rdfa-annotation-client.js` that’s used in the test letter `public/testletter.html`.

