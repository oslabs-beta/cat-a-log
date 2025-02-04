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
import Ajv from 'ajv';
// import {cache} from "cat-a-logs/index";
import {cache, catalog} from "cat-a-logs/index.js";

export const lambdaHandler = async (event, context) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hello world',
    }),
  };
  let kilos = Math.ceil(Math.random()*70);
  let pounds = Math.ceil(Math.random()*35);
  let grams = Math.ceil(Math.random()*20);
  catalog(pounds, 'poundsTest', 'lambda-junction-metrics2', 'None', {
    functionVersion: '$LATEST',
    testDimension: 'berp',
  });
  catalog(grams, 'randomTest', 'lambda-junction-metrics2', 'Count', {
    testDimension: 'berp',
    functionVersion: '$LATEST',
  });
  // catalog(kilos, 'level', 'lambda-junction-metrics2');
  catalog(
    kilos,
    'Weight',
    'lambda-junction-metrics2',
    'None',
    { functionVersion: '$LATEST', testDimension: 'berp' },
    60,
    true
  );
  
  //catalog(pounds, "testLogger2" , "lambda-function-metrics", Milliseconds, {'functionVersion': $LATEST, 'testDimension': derp});

  //catalog(trackedVariable: var, metricName: string , metricNamespace: string, metricUnitLabel: string, CustomerDefinedDimension(s): Object {DimensionName: DimensionValue: String, ...}, ...);

  // logger.info('testEMF using logger.info', {
  //   testguy: "hi",
  //   kilos: 54,
  //   testLogger2: 34,
  //   functionVersion: "$LATEST",
  //   testDimension: "derp",
  //   _aws: {
  //     Timestamp: Date.now(),
  //     CloudWatchMetrics: [
  //       {
  //         Namespace: "lambda-function-metrics",
  //         Dimensions: [["functionVersion", "testDimension"]],
  //         Metrics: [
  //           {
  //             Name: "kilos",
  //             Unit: "Kilograms",
  //             StorageResolution: 60
  //           },
  //           {
  //             Name: "testLogger2",
  //             Unit: "Milliseconds",
  //             StorageResolution: 60
  //           }
  //         ]
  //       }
  //     ]
  //   },
  // });

  return response;
};
