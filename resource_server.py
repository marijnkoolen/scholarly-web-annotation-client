import os
from flask import Flask
from flask import send_from_directory
from flask import render_template
from flask.ext.cors import CORS
from BengResourceMapper import BengResourceMapper
from settings import config

app = Flask(__name__, static_url_path='', static_folder='public', template_folder='public')
app.add_url_rule('/', 'root', lambda: app.send_static_file('testletter.html'))

cors = CORS(app)

@app.route('/scripts/<path:filename>')
def scripts(filename):
    print(filename)
    return send_from_directory('node_modules', filename)

@app.route('/beng-av-example')
def bengavexample():
	brm = BengResourceMapper(config)
	data = brm.loadResource(config['BENG_RESOURCE_URL'])
	return render_template('beng-av-example.html',
		data=data,
		series=data.get('series', None),
		season=data.get('season', None),
		program=data.get('program', None)
	)

@app.route('/beng-image-example')
def bengimageexample():
	brm = BengResourceMapper(config)
	data = brm.loadResource(config['BENG_RESOURCE_URL'])
	return render_template('beng-image-example.html',
		data=data,
		series=data.get('series', None),
		season=data.get('season', None),
		program=data.get('program', None)
	)

if __name__ == '__main__':
    app.run(port=int(os.environ.get("PORT", 3001)), debug=True)
