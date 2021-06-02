import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";

type StackProps = {
    prefix?: string
    cidr?: string
}

export class CustomVPC {

    public readonly vpc: ec2.IVpc;
    constructor(scope: cdk.Construct, {prefix="custom-vpc", cidr="172.22.0.0/16"}:StackProps ){
       
        this.vpc = new ec2.Vpc(scope, `${prefix}-vpc`,{
            maxAzs: 2, //RDS requires atleast 2 avaialability zones
            cidr: cidr, // the ip address block of the vpc e.g. `172.22.0.0/16`
            enableDnsHostnames: true,
            enableDnsSupport: true,
            natGateways: 0,
            subnetConfiguration: [
                { 
                    cidrMask: 22,
                    name: `${prefix}-public-`,
                    subnetType: ec2.SubnetType.PUBLIC // for wp instance
                },
                {
                    cidrMask: 22,
                    name: `${prefix}-isolated-`,
                    subnetType: ec2.SubnetType.ISOLATED // for RDS DB
                }
            ]
            
        })

    }
}

