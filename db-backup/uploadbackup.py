import time
import os
import boto3
from botocore.config import Config

region = os.getenv('AWS_REGION_NAME')

my_config = Config(
    region_name=region,
     signature_version='s3v4'
     )

s3 = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    endpoint_url=f'https://s3.{region}.amazonaws.com',
    config=my_config
)

currentTime = str(int(time.time()))

s3.upload_file('victesti.tar.gz', os.getenv('AWS_BUCKET_NAME'), currentTime+'.tar.gz')

print('[Backup] Upload complete!')