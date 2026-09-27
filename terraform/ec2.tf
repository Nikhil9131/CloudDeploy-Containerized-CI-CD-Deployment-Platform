# ========================================================
# CloudDeploy - Amazon EC2 Compute & Container Runner
# ========================================================

# 1. Latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# 2. EC2 Worker Node Instance
resource "aws_instance" "runner" {
  ami                  = data.aws_ami.amazon_linux_2023.id
  instance_type        = var.ec2_instance_type
  subnet_id            = aws_subnet.public[0].id
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  vpc_security_group_ids = [
    aws_security_group.k8s_nodes.id
  ]

  key_name = var.key_name != "" ? var.key_name : null

  root_block_device {
    volume_size           = 50
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true

    tags = {
      Name = "clouddeploy-${var.environment}-runner-root-ebs"
    }
  }

  user_data = <<-EOF
              #!/bin/bash
              set -ex

              # 1. Update OS packages
              dnf update -y

              # 2. Install Docker, Git, and Container Tools
              dnf install -y docker git
              systemctl enable --now docker
              usermod -aG docker ec2-user

              # 3. Install Docker Compose plugin
              mkdir -p /usr/local/lib/docker/cli-plugins
              curl -SL https://github.com/docker/compose/releases/download/v2.29.2/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
              chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

              # 4. Install Node.js 20 & npm
              curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
              dnf install -y nodejs

              # 5. Output initialization success to system log
              echo "CloudDeploy EC2 Instance successfully provisioned and ready for workload execution." > /var/log/clouddeploy-init.log
              EOF

  tags = {
    Name        = "clouddeploy-${var.environment}-worker-01"
    Role        = "Kubernetes-Worker-Node"
    Environment = var.environment
  }
}
