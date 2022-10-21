#!/bin/bash
cd flask-app
python3 -m virtualenv venv
source venv/bin/activate
pip3 install -r requirements.txt
python3 server.py &

cd ../react-app
yarn install
yarn start
