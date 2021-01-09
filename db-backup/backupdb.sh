#!/bin/bash
cd /usr/src/app
currentDate=`date`
echo "[Backup] $currentDate"
echo "[Backup] Dumping DB..."

rm victesti.tar.gz

if PGPASSWORD=${POSTGRES_PASSWORD} pg_dump ${POSTGRES_DB} -F t -f victesti.tar.gz -h db -U ${POSTGRES_USER} -x
then
    echo "[Backup] DB dumped!"
else 
    echo "[Backup] ERROR: DB not dumped!"
fi

python3 uploadbackup.py
