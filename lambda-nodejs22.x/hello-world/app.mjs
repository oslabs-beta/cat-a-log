/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

import { Logger } from '@aws-lambda-powertools/logger';
import * as log from 'lambda-log';
const logger = new Logger({ serviceName: 'serverlessAirline' });

export const lambdaHandler = async (event, context) => {
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'hello world',
      })
    };

    const testObj = {
      testguy: "hi",
      fool: 42,
      functionVersion: "$LATEST",
      _aws: {
        Timestamp: Date.now(),
        CloudWatchMetrics: [
          {
            Namespace: "lambda-function-metrics",
            Dimensions: [["functionVersion"]],
            Metrics: [
              {
                Name: "fool",
                Unit: "Milliseconds",
                StorageResolution: 60
              }
            ]
          }
        ]
      },
    }
    log.info('testEMF', JSON.stringify(testObj));
    return response;
  };
  