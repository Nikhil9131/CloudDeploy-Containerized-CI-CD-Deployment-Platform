# ========================================================
# CloudDeploy - Infrastructure Provisioning Outputs
# ========================================================

output "vpc_id" {
  description = "The ID of the provisioned Virtual Private Cloud"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of the public multi-AZ subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private multi-AZ subnets"
  value       = aws_subnet.private[*].id
}

output "ec2_instance_id" {
  description = "Instance ID of the CloudDeploy EC2 runner"
  value       = aws_instance.runner.id
}

output "ec2_public_ip" {
  description = "Public IP address assigned to the CloudDeploy EC2 node"
  value       = aws_instance.runner.public_ip
}

output "ec2_private_ip" {
  description = "Internal VPC IP address of the EC2 worker node"
  value       = aws_instance.runner.private_ip
}

output "s3_artifacts_bucket_name" {
  description = "S3 bucket for storing CI/CD deployment artifacts and logs"
  value       = aws_s3_bucket.artifacts.id
}

output "s3_artifacts_bucket_arn" {
  description = "Amazon Resource Name (ARN) of the S3 bucket"
  value       = aws_s3_bucket.artifacts.arn
}

output "iam_instance_role_arn" {
  description = "ARN of the IAM role attached to EC2 compute node"
  value       = aws_iam_role.ec2_role.arn
}

output "alb_security_group_id" {
  description = "Security group ID for Application Load Balancer"
  value       = aws_security_group.alb.id
}

output "k8s_nodes_security_group_id" {
  description = "Security group ID for Kubernetes worker nodes"
  value       = aws_security_group.k8s_nodes.id
}
