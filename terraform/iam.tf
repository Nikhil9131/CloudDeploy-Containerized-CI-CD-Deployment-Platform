# ========================================================
# CloudDeploy - AWS IAM Least-Privilege Architecture
# ========================================================

# 1. EC2 Instance Assume Role Policy
data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

# 2. IAM Role for CloudDeploy EC2 Nodes
resource "aws_iam_role" "ec2_role" {
  name               = "CloudDeploy-${var.environment}-EC2-Node-Role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json

  tags = {
    Name = "CloudDeploy-${var.environment}-EC2-Node-Role"
  }
}

# 3. IAM Policy for S3 Artifact Storage Access
data "aws_iam_policy_document" "s3_access" {
  statement {
    sid = "S3ArtifactsBucketAccess"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:ListBucket",
      "s3:DeleteObject"
    ]
    resources = [
      aws_s3_bucket.artifacts.arn,
      "${aws_s3_bucket.artifacts.arn}/*"
    ]
  }
}

resource "aws_iam_policy" "s3_access_policy" {
  name        = "CloudDeploy-${var.environment}-S3-Access-Policy"
  description = "Allows EC2 worker node to read/write CI/CD artifacts to S3"
  policy      = data.aws_iam_policy_document.s3_access.json
}

# 4. Attach Policies to EC2 Role
resource "aws_iam_role_policy_attachment" "s3_attach" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.s3_access_policy.arn
}

resource "aws_iam_role_policy_attachment" "ecr_read_only" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "cloudwatch_agent" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# 5. EC2 Instance Profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "CloudDeploy-${var.environment}-EC2-Instance-Profile"
  role = aws_iam_role.ec2_role.name
}
