#!/usr/bin/env bash
export WEBPACK_MODE=production
webpack

source venv/bin/activate
export DJANGO_MODE=production

cd src
python3 -m webbrowser -t "http://127.0.0.1:8000"
python3 manage.py runserver

cd -
unset DJANGO_MODE
deactivate
exit 0
