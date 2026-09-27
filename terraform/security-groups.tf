# ========================================================
# CloudDeploy - Security Groups Architecture
# Principle of Least Privilege: ingress restricted strictly by CIDR / SG source
# ========================================================

# 1. Application Load Balancer (ALB) Security Group
resource "aws_security_group" "alb" {
  name        = "clouddeploy-${var.environment}-alb-sg"
  description = "Allows public inbound HTTP and HTTPS traffic to ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Public HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Public HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "clouddeploy-${var.environment}-alb-sg"
  }
}

# 2. Kubernetes Nodes / EC2 Compute Security Group
resource "aws_security_group" "k8s_nodes" {
  name        = "clouddeploy-${var.environment}-k8s-nodes-sg"
  description = "Security group for Kubernetes worker nodes and container pods"
  vpc_id      = aws_vpc.main.id

  # Inbound traffic from ALB to NodePort services (30000-32767)
  ingress {
    description     = "NodePort traffic routed from Application Load Balancer"
    from_port       = 30000
    to_port         = 32767
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Inbound direct HTTP from ALB
  ingress {
    description     = "HTTP traffic routed from ALB"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Inbound API traffic from ALB
  ingress {
    description     = "Backend API traffic routed from ALB"
    from_port       = 5000
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Intra-cluster pod-to-pod and node-to-node communication
  ingress {
    description = "Intra-VPC Pod and Kubelet Overlay Communication"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "clouddeploy-${var.environment}-k8s-nodes-sg"
  }
}

# 3. PostgreSQL Database Security Group
resource "aws_security_group" "postgres" {
  name        = "clouddeploy-${var.environment}-postgres-sg"
  description = "Restricts PostgreSQL port 5432 strictly to Kubernetes worker nodes"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from Kubernetes worker nodes"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.k8s_nodes.id]
  }

  egress {
    description = "Outbound egress"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "clouddeploy-${var.environment}-postgres-sg"
  }
}
