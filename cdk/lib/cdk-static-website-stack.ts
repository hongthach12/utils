/* eslint-disable no-new */
/* eslint-disable import/prefer-default-export */
import { aws_route53_targets, CfnOutput, Duration, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { BlockPublicAccess, BucketAccessControl, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import {
    HttpVersion,
    OriginAccessIdentity,
    PriceClass,
    ViewerProtocolPolicy
} from 'aws-cdk-lib/aws-cloudfront';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

declare const hostedZone: route53.HostedZone;

export class CdkStaticWebsiteStack extends Stack {
    constructor(scope: Construct, id: string, props?: any) {
        super(scope, id, props);

        // This should be the basename of your website, e.g. mydomain.com (not www.mydomain.com)
        console.log(props)
        // const { DOMAIN_NAME, WEB_BUCKET_NAME } = process.env;
        if (!props.bucket_name) throw new Error('Set an environment variable for bucket_name');

        if (!props.domain_name) throw new Error('Set an environment variable for domain_name');
        //
        const siteBucket = new s3.Bucket(this, props.bucket_name, {
            encryption: BucketEncryption.S3_MANAGED,
            bucketName: props.bucket_name,
            // removalPolicy: RemovalPolicy.DESTROY,
            // autoDeleteObjects: true,
            // No website related settings
            accessControl: BucketAccessControl.PRIVATE,
            publicReadAccess: false,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            // websiteIndexDocument: 'index.html',
            // websiteErrorDocument: 'error.html'
        });
        //
        const accessIdentity = new OriginAccessIdentity(this, 'CloudfrontAccess');
        const cloudfrontUserAccessPolicy = new PolicyStatement();
        cloudfrontUserAccessPolicy.addActions('s3:GetObject');
        cloudfrontUserAccessPolicy.addPrincipals(accessIdentity.grantPrincipal);
        cloudfrontUserAccessPolicy.addResources(siteBucket.arnForObjects('*'));
        siteBucket.addToResourcePolicy(cloudfrontUserAccessPolicy);


        const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'hostedZone', {
            hostedZoneId: props.hosted_zone_id,
            zoneName: props.zone_name
        });

       
        const cert = new acm.DnsValidatedCertificate(this, 'DNSCert', {
            domainName: props.domain_name,
            hostedZone: hostedZone,
            region: 'us-east-1',
        })

        const viewerCertificate = cloudfront.ViewerCertificate.fromAcmCertificate(cert, {
            aliases: [props.domain_name],
            sslMethod: cloudfront.SSLMethod.SNI,
            securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2018
        });

        //
        const ROOT_INDEX_FILE = '/index.html';
        const cfDist = new cloudfront.CloudFrontWebDistribution(this, 'CfDistribution', {
            comment: 'CDK Cloudfront Secure S3',

            viewerCertificate: viewerCertificate,
            defaultRootObject: ROOT_INDEX_FILE,
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            httpVersion: HttpVersion.HTTP2,
            priceClass: PriceClass.PRICE_CLASS_200, // the cheapest
            originConfigs: [
                {
                    s3OriginSource: {
                        originAccessIdentity: accessIdentity,
                        s3BucketSource: siteBucket,
                        originPath: ``,
                    },
                    behaviors: [
                        {
                            compress: false,
                            isDefaultBehavior: true,
                            minTtl: Duration.millis(0),
                            maxTtl: Duration.millis(0),
                            defaultTtl: Duration.millis(0),
                            forwardedValues: {
                                cookies: {
                                    forward: 'all',
                                },
                                // Forward all query string values
                                queryString: true,
                            }

                        },
                    ],
                },
            ],
            // Allows React to handle all errors internally
            errorConfigurations: [
                {
                    errorCachingMinTtl: 0, // in seconds
                    errorCode: 403,
                    responseCode: 200,
                    responsePagePath: ROOT_INDEX_FILE,
                },
                {
                    errorCachingMinTtl: 0, // in seconds
                    errorCode: 404,
                    responseCode: 200,
                    responsePagePath: ROOT_INDEX_FILE,
                },
            ],
        });

        const domainSiteWeb = new route53.ARecord(this, 'Alias', {
            zone: hostedZone,
            recordName: props.domain_name,
            target: route53.RecordTarget.fromAlias(new aws_route53_targets.CloudFrontTarget(cfDist)),
        });

        // You will need output to create a www CNAME record to
        new CfnOutput(this, 'SiteName', {
            value: domainSiteWeb.domainName,
            description: 'Site name',
        });
        new CfnOutput(this, 'S3BucketName', {
            value: siteBucket.bucketName,
            description: 'Use this with `aws s3 sync` to upload your static website files',
        });

        // new CdkCdnS3Stack(this, 's3-cdn', {
        //     bucket_name: props.cdn_bucket_name,
        //     domain_name: props.cdn_domain_name,
        //     hosted_zone_id: props.hosted_zone_id,
        //     zone_name: props.zone_name,
        // });
    }
}
