#!/bin/bash -e

ENVIRONMENT=$1

# Getting the environment-specific deployment settings and injecting them into the shell environment
REGION=us-east-1
content=$(aws secretsmanager get-secret-value --region ${REGION} --secret-id "${ENVIRONMENT}_deploy" --query "SecretString" --output text)
echo ${content} | jq -r 'to_entries|map("\(.key)=\"\(.value)\"")|.[]' > .env
set -o allexport
source .env
set +o allexport

[ -z "${DYNAMSOFT_PRODUCT_KEYS}" ] && echo "You must have DYNAMSOFT_PRODUCT_KEYS set in your environment" && exit 1
[ -z "${DYNAMSOFT_S3_ZIP_PATH}" ] && echo "You must have DYNAMSOFT_S3_ZIP_PATH set in your environment" && exit 1
[ -z "${DYNAMSOFT_URL}" ] && echo "You must have DYNAMSOFT_URL set in your environment" && exit 1
[ -z "${ENABLE_HEALTH_CHECKS}" ] && echo "You must have ENABLE_HEALTH_CHECKS set in your environment" && exit 1
[ -z "${ENVIRONMENT}" ] && echo "You must have ENVIRONMENT set in your environment" && exit 1
[ -z "${EFCMS_DOMAIN}" ] && echo "You must have EFCMS_DOMAIN set in your environment" && exit 1
[ -z "${IS_DYNAMSOFT_ENABLED}" ] && echo "You must have IS_DYNAMSOFT_ENABLED set in your environment" && exit 1
[ -z "${ZONE_NAME}" ] && echo "You must have ZONE_NAME set in your environment" && exit 1

echo "Running terraform with the following environment configs:"
echo "  - DYNAMSOFT_PRODUCT_KEYS=${DYNAMSOFT_PRODUCT_KEYS}"
echo "  - DYNAMSOFT_S3_ZIP_PATH=${DYNAMSOFT_S3_ZIP_PATH}"
echo "  - DYNAMSOFT_URL=${DYNAMSOFT_URL}"
echo "  - ENABLE_HEALTH_CHECKS=${ENABLE_HEALTH_CHECKS}"
echo "  - ENVIRONMENT=${ENVIRONMENT}"
echo "  - EFCMS_DOMAIN=${EFCMS_DOMAIN}"
echo "  - IS_DYNAMSOFT_ENABLED=${IS_DYNAMSOFT_ENABLED}"
echo "  - ZONE_NAME=${ZONE_NAME}"

../../../scripts/verify-terraform-version.sh

BUCKET="${ZONE_NAME}.terraform.deploys"
KEY="ui-${ENVIRONMENT}.tfstate"
LOCK_TABLE=efcms-terraform-lock

rm -rf .terraform

echo "Initiating provisioning for environment [${ENVIRONMENT}] in AWS region [${REGION}]"
sh ../bin/create-bucket.sh "${BUCKET}" "${KEY}" "${REGION}"

echo "checking for the dynamodb lock table..."
aws dynamodb list-tables --output json --region "${REGION}" --query "contains(TableNames, '${LOCK_TABLE}')" | grep 'true'
result=$?
if [ ${result} -ne 0 ]; then
  echo "dynamodb lock does not exist, creating"
  sh ../bin/create-dynamodb.sh "${LOCK_TABLE}" "${REGION}"
else
  echo "dynamodb lock table already exists"
fi

set -eo pipefail

DYNAMSOFT_URL="https://dynamsoft-lib.${EFCMS_DOMAIN}"

if [[ -z "${IS_DYNAMSOFT_ENABLED}" ]]
then
  IS_DYNAMSOFT_ENABLED="1"
fi

export TF_PLUGIN_CACHE_DIR=./terraform-cache
export TF_VAR_dns_domain=$EFCMS_DOMAIN
export TF_VAR_dynamsoft_product_keys=$DYNAMSOFT_PRODUCT_KEYS
export TF_VAR_dynamsoft_s3_zip_path=$DYNAMSOFT_S3_ZIP_PATH
export TF_VAR_dynamsoft_url=$DYNAMSOFT_URL
export TF_VAR_environment=$ENVIRONMENT
export TF_VAR_is_dynamsoft_enabled=$IS_DYNAMSOFT_ENABLED
export TF_VAR_statuspage_dns_record=$STATUSPAGE_DNS_RECORD
export TF_VAR_zone_name=$ZONE_NAME
export TF_VAR_enable_health_checks=$ENABLE_HEALTH_CHECKS

terraform init -backend=true -backend-config=bucket="${BUCKET}" -backend-config=key="${KEY}" -backend-config=dynamodb_table="${LOCK_TABLE}" -backend-config=region="${REGION}"
terraform plan
terraform apply -auto-approve
