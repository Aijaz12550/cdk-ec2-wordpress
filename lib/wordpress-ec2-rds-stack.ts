import * as cdk from "@aws-cdk/core";
import { CustomVPC } from "./constructs/vpc";
import { config } from "./config";
import { MySQLRdsInstance } from "./constructs/rds";
export class WordpressEc2RdsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const _customVPC = new CustomVPC(this, {
      prefix: config.projectName,
    });

    new MySQLRdsInstance(this, {
      prefix: config.projectName,
      vpc: _customVPC.vpc as any,
      user: "wordpress_admin",
      database: "awesome-wp-site-db",
      port: 3306,
      secretName: `${config.projectName}/rds/mysql/credentials`
      
    })
  }
}
