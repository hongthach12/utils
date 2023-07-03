# DEPLOY

## Change ENV

change env follow stage if you use stage stg please change name is config.stg.json

```
cp config.dev.json.sample config.dev.json
```

## Get AWS Config Profile Name

```
cat ~/.aws/config
```

## ENV Require

```
{
    "S3_BUCKET_NAME":"",
    "S3_BUCKET_PATH":"*",
    "S3_FILE_DOMAIN_NAME": "domain.csv",
    "CHANEL_EMAIL": "",
    "REGION": "",
    "PROFILE_NAME_AWS": ""
}
```

### NOTE

1. Verify Email Ses Chanel Reprot
2. Create Bucket S3

## Install Node Module

```
cd serverlessBasicAuthCheck/layers/nodejs
npm install
cd ../../
```

## Deploy

```
sls deploy --stage your_state
```
