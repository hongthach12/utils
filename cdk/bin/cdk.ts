#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';
import { CdkStaticWebsiteStack } from '../lib/cdk-static-website-stack';

const app = new cdk.App();
// new CdkStack(app, 'CdkStack', {
//   /* If you don't specify 'env', this stack will be environment-agnostic.
//    * Account/Region-dependent features and context lookups will not work,
//    * but a single synthesized template can be deployed anywhere. */

//   /* Uncomment the next line to specialize this stack for the AWS Account
//    * and Region that are implied by the current CLI configuration. */
//   // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

//   /* Uncomment the next line if you know exactly what Account and Region you
//    * want to deploy the stack to. */
//   // env: { account: '123456789012', region: 'us-east-1' },

//   /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
// });

new CdkStaticWebsiteStack(app, 'RootWebStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  zone_name: 'xbro-utils.com',
  hosted_zone_id: 'Z01636063SM41PTG582R1',
  // web static
  bucket_name: 'xbro-index-web',
  domain_name: 'xbro-utils.com',
  crossRegionReferences: true,
});

new CdkStaticWebsiteStack(app, 'JsonFormat', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  zone_name: 'xbro-utils.com',
  hosted_zone_id: 'Z01636063SM41PTG582R1',
  // web static
  bucket_name: 'xbro-json-format',
  domain_name: 'json-format.xbro-utils.com',
  crossRegionReferences: true,
});

