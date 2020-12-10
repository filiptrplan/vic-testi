from tests.models import TestImage
import boto3
from django.conf import settings
from botocore.config import Config

region = settings.AWS_REGION_NAME

my_config = Config(
    region_name=region,
     signature_version='s3v4'
     )

s3 = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    endpoint_url=f'https://s3.{region}.amazonaws.com',
    config=my_config
)

def s3_generate_post_signature(key_name, file_name):
    post = s3.generate_presigned_post(
        Fields={
            'Content-Type': 'image/jpeg,image/png',
            'acl': 'public-read'
        },
        Conditions=[
             ["content-length-range", 200, 10000000],
             ["starts-with", "$Content-Type", "image/"],
             {"acl": "public-read"}
        ],
        Bucket=settings.AWS_BUCKET_NAME,
        Key=key_name + '/' + file_name
    )
    return post

def s3_delete_object(file_url):
    file_key = file_url.rsplit(settings.AWS_BUCKET_NAME+'/')[1]
    response = s3.delete_object(
        Bucket=settings.AWS_BUCKET_NAME,
        Key=file_key
    )

def s3_delete_objects(file_urls):
    for url in file_urls:
        if TestImage.objects.filter(file=url).count() == 0:
            s3_delete_object(url)