variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Target deployment environment (production, staging, development)"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block allocated for the CloudDeploy Virtual Private Cloud"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones for high availability multi-AZ subnets"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public ingress subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private application/database subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

variable "ec2_instance_type" {
  description = "EC2 instance sizing for Kubernetes worker / runner node"
  type        = string
  default     = "t3.xlarge"
}

variable "key_name" {
  description = "Optional SSH key pair name for EC2 administrative access"
  type        = string
  default     = ""
}

variable "s3_bucket_prefix" {
  description = "Prefix for the S3 deployment artifacts and logs storage bucket"
  type        = string
  default     = "clouddeploy-artifacts"
}
