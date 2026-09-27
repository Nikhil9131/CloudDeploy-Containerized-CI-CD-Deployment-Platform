terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50.0"
    }
  }

  # Uncomment to enable AWS S3 remote state locking with DynamoDB
  # backend "s3" {
  #   bucket         = "clouddeploy-terraform-state-backend"
  #   key            = "platform/production/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "clouddeploy-terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "CloudDeploy"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Platform    = "Containerized-CICD"
    }
  }
}
