#!/bin/bash
cd /usr/src/app/victesti
python3 manage.py makemigrations
python3 manage.py migrate --noinput
python3 manage.py dockersuperuser