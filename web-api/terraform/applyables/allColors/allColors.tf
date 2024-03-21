provider "aws" {
  region = var.aws_region
}

provider "aws" {
  region = "us-east-1"
  alias  = "us-east-1"
}

provider "aws" {
  region = "us-west-1"
  alias  = "us-west-1"
}

terraform {
  backend "s3" {
  }

  required_providers {
    aws = "5.40.0"
  }
}

data "aws_sns_topic" "system_health_alarms" {
  // account-level resource
  name = "system_health_alarms"
}

data "aws_sns_topic" "system_health_alarms_west" {
  // account-level resource
  name     = "system_health_alarms"
  provider = aws.us-west-1
}

module "ef-cms_apis" {
  source                     = "../../modules/everything-else-deprecated"
  alert_sns_topic_arn        = data.aws_sns_topic.system_health_alarms.arn
  alert_sns_topic_west_arn   = data.aws_sns_topic.system_health_alarms_west.arn
  blue_elasticsearch_domain  = var.blue_elasticsearch_domain
  blue_table_name            = var.blue_table_name
  bounce_alert_recipients    = var.bounce_alert_recipients
  bounced_email_recipient    = var.bounced_email_recipient
  cognito_suffix             = var.cognito_suffix
  cognito_table_name         = var.cognito_table_name
  default_account_pass       = var.default_account_pass
  deployment_timestamp       = var.deployment_timestamp
  destination_table          = var.destination_table
  disable_emails             = var.disable_emails
  dns_domain                 = var.dns_domain
  email_dmarc_policy         = var.email_dmarc_policy
  enable_health_checks       = var.enable_health_checks
  environment                = var.environment
  es_instance_count          = var.es_instance_count
  es_instance_type           = var.es_instance_type
  es_volume_size             = var.es_volume_size
  green_elasticsearch_domain = var.green_elasticsearch_domain
  green_table_name           = var.green_table_name
  irs_superuser_email        = var.irs_superuser_email
  lower_env_account_id       = var.lower_env_account_id
  prod_env_account_id        = var.prod_env_account_id
  scanner_resource_uri       = var.scanner_resource_uri
  should_es_alpha_exist      = var.should_es_alpha_exist
  should_es_beta_exist       = var.should_es_beta_exist
  slack_webhook_url          = var.slack_webhook_url
  zone_name                  = var.zone_name
}
