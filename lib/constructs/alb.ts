import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as elb from "@aws-cdk/aws-elasticloadbalancingv2";


interface StackProps {
    prefix: string
    vpc: ec2.IVpc
}

export class WordpressApplicationLoadBalancer {

    public readonly loadbalancerDnsName: string
    public readonly listener: elb.IApplicationListener


    constructor(scope: cdk.Construct, props: StackProps){

        const alb = new elb.ApplicationLoadBalancer(scope, `${props.prefix}-alb`,{
            loadBalancerName: `${props.prefix}-alb`,
            vpc: props.vpc,
            internetFacing: true
        })


        this.loadbalancerDnsName = alb.loadBalancerDnsName;

        this.listener = alb.addListener(`${props.prefix}-alb-listener`,{
            port: 80,
            open: true
        });

        new cdk.CfnOutput(scope, `${props.prefix}-alb-dns-name`,{
            value: alb.loadBalancerDnsName
        })
    }
}