import * as fs from "fs";
import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as sm from "@aws-cdk/aws-secretsmanager";
import * as autoscaling from "@aws-cdk/aws-autoscaling";
import * as iam from "@aws-cdk/aws-iam";
import { config } from "../config";
import { replaceAllSubstrings } from "../utils";


interface StackProps {
    prefix: string
    vpc: ec2.IVpc
    dnsName: string
    dbSecretName: string
    wpSecretName: string
}

export class WordpressAutoScalingGroup {

    public readonly asg: autoscaling.AutoScalingGroup

    constructor(scope: cdk.Construct, props: StackProps){
        
        const custumVpc = props.vpc; 

        // IAM Role for Instance
        const role = new iam.Role(scope, `${props.prefix}-instance-role`,{
            assumedBy: new iam.CompositePrincipal(
                new iam.ServicePrincipal('ec2.amazonaws.com'),
                new iam.ServicePrincipal('ssm.amazonaws.com')
            ),

            managedPolicies: [ 
                iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"),
                iam.ManagedPolicy.fromAwsManagedPolicyName("SecretsManagerReadWrite")
            ]
        });

        // security group for instance
        const sg = new ec2.SecurityGroup(scope, 'wordpress-instance-sg',{
            vpc: custumVpc,
            allowAllOutbound: true,
            securityGroupName: "wordpress-instance-sg"
        })

        sg.addIngressRule(
            ec2.Peer.ipv4(custumVpc.vpcCidrBlock),
            ec2.Port.tcp(80),
            "HTTP Request allowed from inside of the vpc."
        );


        // secrets
        new sm.Secret(scope, "wordpressAdminSecrets",{
            secretName: props.wpSecretName,
            description: "wordpress Admin credentilas.",
            generateSecretString:{
                secretStringTemplate: JSON.stringify({
                    username: config.wordpress.admin.username,
                    email: config.wordpress.admin.email
                }),

                generateStringKey: "password"
            }
        });


        const userScript = fs.readFileSync(
            'lib/scripts/wordpress_install.sh',
            'utf8'
          )
      
          // Replace the following variable substrings in the userScript
          const modifiedUserScript = replaceAllSubstrings(
            [
              { _DB_SECRETS_PATH_: props.dbSecretName },
              { _WP_SECRETS_PATH_: props.wpSecretName },
              { _AWS_REGION_: config.env.region },
              { _WP_DB_NAME_: config.wordpress.site.databaseName },
              { _WP_SITE_TITLE_: config.wordpress.site.title },
              { _WP_SITE_INSTALL_PATH_: config.wordpress.site.installPath },
              { _WP_SITE_BASE_DOMAIN_: props.dnsName }, // our load balancer dns name
            ],
            userScript
          );


        //   EC2 instance

        this.asg = new autoscaling.AutoScalingGroup(scope, `${props.prefix}-asg`,{
            vpc: custumVpc,
            role,
            keyName:`wordpressInstance`,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            machineImage: ec2.MachineImage.latestAmazonLinux({
                generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
            }),
            userData: ec2.UserData.custom(modifiedUserScript),
            minCapacity:1,
            maxCapacity: 1,
            associatePublicIpAddress: true,
            vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
            
            
        })

    }
}