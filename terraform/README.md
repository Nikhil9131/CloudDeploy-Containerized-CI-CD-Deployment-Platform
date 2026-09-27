# CloudDeploy Terraform Infrastructure as Code (IaC)

This directory contains production-grade Terraform configurations to provision the AWS cloud infrastructure required to host and run the **CloudDeploy Platform**.

---

## 1. Architecture Overview

The Terraform manifests provision:
* **VPC & Networking** (`main.tf`):
  * Dual-AZ Virtual Private Cloud (`10.0.0.0/16`)
  * 2 Public Subnets with Internet Gateway for Load Balancer ingress
  * 2 Private Subnets with NAT Gateway for secure egress
* **Security Architecture** (`security-groups.tf` & `iam.tf`):
  * Application Load Balancer Security Group (HTTP:80, HTTPS:443)
  * NodePort and Kubelet Security Group for Kubernetes pods
  * PostgreSQL Security Group restricted exclusively to worker nodes
  * IAM Role & Instance Profile with least-privilege permissions for S3 & Amazon ECR
* **Compute Infrastructure** (`ec2.tf`):
  * Amazon Linux 2023 EC2 instance (`t3.xlarge`) with encrypted gp3 root EBS volume
  * `user_data` automated bootstrap installing Docker Engine, Docker Compose, Git, and Node.js
* **Object Storage** (`s3.tf`):
  * AES256 server-side encrypted S3 bucket with versioning and public access blocking for pipeline build artifacts and logs.

---

## 2. Prerequisites

1. Install [Terraform >= 1.5.0](https://www.terraform.io/downloads.html).
2. Configure AWS CLI credentials:
   ```bash
   aws configure
   ```
   *(Ensure the IAM user or role has permissions to create VPC, EC2, IAM, and S3 resources).*

---

## 3. Provisioning Workflow

### Step 1: Initialize Terraform
Downloads the required AWS provider plugin (`~> 5.50`):
```bash
terraform init
```

### Step 2: Review Execution Plan
Inspect the dry-run execution plan showing all resources that will be provisioned:
```bash
terraform plan -out=tfplan.binary
```

### Step 3: Apply Infrastructure
Provision the cloud resources on AWS:
```bash
terraform apply tfplan.binary
```

### Step 4: Verify Outputs
Retrieve the allocated public IP, VPC ID, and S3 bucket:
```bash
terraform output
```

### Step 5: Teardown Infrastructure
To destroy all provisioned AWS cloud resources when testing is concluded:
```bash
terraform destroy -auto-approve
```

---

## 4. Customizing Variables

You can override defaults by creating a `terraform.tfvars` file:

```hcl
aws_region        = "us-east-1"
environment       = "production"
ec2_instance_type = "m6i.2xlarge"
s3_bucket_prefix  = "my-company-clouddeploy"
```
