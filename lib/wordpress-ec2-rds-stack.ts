import * as cdk from "@aws-cdk/core";
import { CustomVPC } from "./constructs/vpc";
import { config } from "./config";
import { MySQLRdsInstance } from "./constructs/rds";
import { WordpressApplicationLoadBalancer } from "./constructs/alb";
import { WordpressAutoScalingGroup } from "./constructs/ec2";
export class WordpressEc2RdsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const _customVPC = new CustomVPC(this, {
      prefix: config.projectName,
    });

    // MySQL RDS Instance
    new MySQLRdsInstance(this, {
      prefix: config.projectName,
      vpc: _customVPC.vpc as any,
      user: "wordpress_admin",
      database: "awesome-wp-site-db",
      port: 3306,
      secretName: `${config.projectName}/rds/mysql/credentials`
      
    });


    // Application Load Balancer

    let alb = new WordpressApplicationLoadBalancer(this, {
      prefix: config.projectName as any,
      vpc: _customVPC.vpc
    });


    const { asg } = new WordpressAutoScalingGroup(this,{
      prefix: config.projectName as any,
      vpc: _customVPC.vpc,
      dnsName: alb.loadbalancerDnsName,
      dbSecretName: `${config.projectName}/rds/mysql/credentials`,
      wpSecretName: `${config.projectName}/wordpress/admin/credentials`
    });

  
    
    alb.listener.addTargets(`${config.projectName}-wp-asg-targets`,{
      port: 80,
      targets: [asg]
    })

    
  }
}
