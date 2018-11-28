#!/usr/bin/env groovy

pipeline {

  agent any

  environment {
    SPAWN_WRAP_SHIM_ROOT = "/home/tomcat"
    npm_config_cache = "/home/tomcat"
    HOME = "/home/tomcat" // needed to run 'npm i' on docker without being root
    CYPRESS_CACHE_FOLDER = "/home/tomcat/cypress_cache" // needed to be able to run cypress without being root
  }

  stages {
    stage('setup') {
      steps {
        script {
          def scmVars = checkout scm
          env.GIT_PREVIOUS_SUCCESSFUL_COMMIT = scmVars.GIT_PREVIOUS_SUCCESSFUL_COMMIT
          env.GIT_COMMIT = scmVars.GIT_COMMIT
        }
      }
    }
    stage('components') {
      parallel {
        stage('shared') {
          when {
            expression {
              return checkCommit('business')
            }
          }
          steps {
            build job: 'ef-cms-shared', parameters: [
              [$class: 'StringParameterValue', name: 'sha1', value: "${GIT_COMMIT}"],
              [$class: 'StringParameterValue', name: 'target_sha1', value: "${env.CHANGE_TARGET}"],
              [$class: 'StringParameterValue', name: 'branch_name', value: "${env.BRANCH_NAME}"]
            ]
          }
        }
        stage('web-client') {
          when {
            expression {
              return checkCommit('web-client')
            }
          }
          steps {
            build job: 'ef-cms-ui', parameters: [
              [$class: 'StringParameterValue', name: 'sha1', value: "${GIT_COMMIT}"],
              [$class: 'StringParameterValue', name: 'target_sha1', value: "${env.CHANGE_TARGET}"],
              [$class: 'StringParameterValue', name: 'branch_name', value: "${env.BRANCH_NAME}"]
            ]
          }
        }
        stage('efcms-service') {
          when {
            expression {
              return checkCommit('efcms-service')
            }
          }
          steps {
            build job: 'ef-cms-api', parameters: [
              [$class: 'StringParameterValue', name: 'sha1', value: "${GIT_COMMIT}"],
              [$class: 'StringParameterValue', name: 'target_sha1', value: "${env.CHANGE_TARGET}"],
              [$class: 'StringParameterValue', name: 'branch_name', value: "${env.BRANCH_NAME}"]
            ]
          }
        }
      }
    }
    stage('Merge') {
      steps {
        script {
          if (env.BRANCH_NAME != 'develop' && env.BRANCH_NAME != 'staging' && env.BRANCH_NAME != 'master' && env.CHANGE_TARGET) {
            // todo: there is probably a better way to have Jenkins do this for us automatically
            sh 'git config user.name "EF-CMS Jenkins"'
            sh 'git config user.email "noop@example.com"'
            sh "git merge origin/${env.CHANGE_TARGET}"
          }
        }
      }
    }
    stage('pa11y') {
      steps {
        script {
          sh "./docker-pa11y.sh"
        }
      }
    }
    stage('Cerebral Tests') {
      steps {
        script {
          sh "./docker-cerebral.sh"
        }
      }
    }
    stage('cypress') {
      steps {
        sh "./docker-cypress.sh"
      }
    }
  }
  post {
    always {
      deleteDir()
    }
  }
}

def checkCommit(folder) {
  if (env.CHANGE_TARGET) {
    def matches = sh(returnStatus:true, script: "git diff --name-only origin/${env.CHANGE_TARGET} | grep '^${folder}'")
    return !matches
  } else if (env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'staging' || env.BRANCH_NAME == 'master') {
    return true
  }
}