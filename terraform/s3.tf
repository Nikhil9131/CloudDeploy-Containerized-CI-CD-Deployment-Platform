# ========================================================
# CloudDeploy - Amazon S3 Deployment Artifacts & Logs Storage
# ========================================================

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# 1. Artifacts Storage Bucket
resource "aws_s3_bucket" "artifacts" {
  bucket        = "${var.s3_bucket_prefix}-${var.environment}-${random_id.bucket_suffix.hex}"
  force_destroy = false

  tags = {
    Name        = "clouddeploy-${var.environment}-artifacts"
    Purpose     = "CI/CD Pipeline Artifacts & Log Storage"
    Environment = var.environment
  }
}

# 2. Bucket Versioning
resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.artifacts.id

  versioning_configuration {
    status = "Enabled"
  }
}

# 3. Server-Side Encryption (AES256)
resource "aws_s3_bucket_server_side_encryption_configuration" "encryption" {
  bucket = aws_s3_bucket.artifacts.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# 4. Strict Public Access Block (Security Best Practice)
resource "aws_s3_bucket_public_access_block" "public_block" {
  bucket = aws_s3_bucket.artifacts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 5. Lifecycle Configuration for Log Archival
resource "aws_s3_bucket_lifecycle_configuration" "lifecycle" {
  bucket = aws_s3_bucket.artifacts.id

  rule {
    id     = "archive-old-build-logs"
    status = "Enabled"

    filter {
      prefix = "logs/"
    }

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}
