import os
import webbrowser
from threading import Timer
from flask import Flask
from config import Config
from extensions import db, migrate, csrf
from routes import main

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)

    app.register_blueprint(main)

    return app

def open_browser():
      webbrowser.open_new('http://127.0.0.1:5000/')

app = create_app()

if __name__ == '__main__':
    if os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
        Timer(1, open_browser).start()
    
    debug_mode = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(debug=debug_mode)