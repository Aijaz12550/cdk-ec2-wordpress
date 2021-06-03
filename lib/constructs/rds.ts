import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as rds from "@aws-cdk/aws-rds";
import * as sm from "@aws-cdk/aws-secretsmanager";

interface StackProps {
  prefix?: string;
  vpc?: ec2.Vpc;
  user: string;
  port: number;
  database: string;
  secretName: string;
}

export class MySQLRdsInstance {
  public readonly databaseSecretName: string;

  constructor(scope: cdk.Construct, props: StackProps) {
    const customVpc = props.vpc;

    const ingressSecurityGroup = new ec2.SecurityGroup(
      scope,
      `${props.prefix}-rds-ingress`,
      {
        vpc: customVpc as any,
        securityGroupName: `${props.prefix}-rds-ingress-sg`,
      }
    );

    ingressSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(customVpc?.vpcCidrBlock as any),
      ec2.Port.tcp(props.port || 3306)
    );

    const databaseCredentialsSecret = new sm.Secret(
      scope,
      `${props.prefix}-MySQLCredentialsSecret`,
      {
        secretName: props.secretName,
        description: "Credentials to access Wordpress MYSQL Database ..",
        generateSecretString: {
          secretStringTemplate: JSON.stringify({ username: props.user }),
          excludePunctuation: true,
          includeSpace: false,
          generateStringKey: "password",
        },
      }
    );

    const mysqlRDSInstance = new rds.DatabaseInstance(
      scope,
      `${props.prefix}-MySQLRDSInsatance`,
      {
        credentials: rds.Credentials.fromSecret(databaseCredentialsSecret),
        engine: rds.DatabaseInstanceEngine.mysql({
          version: rds.MysqlEngineVersion.VER_8_0_23,
        }),
        port: props.port,
        allocatedStorage: 10,
        storageType: rds.StorageType.GP2,
        backupRetention: cdk.Duration.days(3) as any,
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T2,
          ec2.InstanceSize.MICRO
        ),
        vpc: customVpc as any,
        vpcSubnets: { subnetType: ec2.SubnetType.ISOLATED },
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        deletionProtection: false,
        databaseName:"tciq_wordpress_instance",
        securityGroups: [ingressSecurityGroup],
        instanceIdentifier: "tciqwordpress"
      }
    );
  }
}
