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
const logger = new Logger({ serviceName: 'serverlessAirline' });
import catalog from 'index.ts';

export const lambdaHandler = async (event, context) => {
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'hello world',
      })
    };
    //let kilos = 54;
    //let pounds = 34;
    // catalog(kilos, "kilos" , "lambda-function-metrics", "Kilograms", {'functionVersion': $LATEST, 'testDimension': derp});
    //catalog(pounds, "testLogger2" , "lambda-function-metrics", Milliseconds, {'functionVersion': $LATEST, 'testDimension': derp});

    //catalog(trackedVariable: var, metricName: string , metricNamespace: string, metricUnitLabel: string, CustomerDefinedDimension(s): Object {DimensionName: DimensionValue: String, ...}, ...);
    
    logger.info('testEMF using logger.info', {
      testguy: "hi",
      kilos: 54,
      testLogger2: 34,
      functionVersion: "$LATEST",
      testDimension: "derp",
      _aws: {
        Timestamp: Date.now(),
        CloudWatchMetrics: [
          {
            Namespace: "lambda-function-metrics",
            Dimensions: [["functionVersion", "testDimension"]],
            Metrics: [
              {
                Name: "kilos",
                Unit: "Kilograms",
                StorageResolution: 60
              },
              {
                Name: "testLogger2",
                Unit: "Milliseconds",
                StorageResolution: 60
              }
            ]
          }
        ]
      },
    });

    
  return response;
  };
  