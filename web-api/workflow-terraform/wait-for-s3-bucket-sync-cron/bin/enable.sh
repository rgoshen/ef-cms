#!/bin/bash -e

./check-env-variables.sh "ENV"

aws events enable-rule --name "check_s3_bucket_sync_status_cron_${ENV}" --region us-east-1
