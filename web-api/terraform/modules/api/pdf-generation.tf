

module "maintenance_notify_lambda" {
  source         = "../lambda"
  handler        = "./web-api/src/lambdas/pdfGeneration/pdf-generation.ts"
  handler_method = "handler"
  lambda_name    = "pdf_generator_${var.environment}_${var.current_color}"
  role           = "arn:aws:iam::${var.account_id}:role/lambda_role_${var.environment}"
  environment    = var.lambda_environment
  timeout        = "29"
  memory_size    = "3008"
  layers = [
    aws_lambda_layer_version.puppeteer_layer.arn
  ]
}
