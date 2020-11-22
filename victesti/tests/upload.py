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

def generate_post_signature(key_name, file_name):
    post = s3.generate_presigned_post(
        Fields={
            'Content-Type': 'image/jpeg'
        },
        Conditions=[
             ["content-length-range", 200, 10000000],
             ["starts-with", "$Content-Type", ""]
        ],
        Bucket=settings.AWS_BUCKET_NAME,
        Key=key_name + '/' + file_name
    )
    return post