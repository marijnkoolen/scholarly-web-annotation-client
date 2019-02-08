import os
from flask import Flask
from flask import send_from_directory
from flask import render_template
from flask_cors import CORS
from settings import config

app = Flask(__name__, static_url_path='', static_folder='public', template_folder='public')
app.add_url_rule('/', 'root', lambda: app.send_static_file('testletter.html'))

cors = CORS(app)

@app.route('/scripts/<path:filename>')
def scripts(filename):
    print(filename)
    return send_from_directory('node_modules', filename)

if __name__ == '__main__':
    app.run(port=int(os.environ.get("PORT", 3001)), debug=True)
