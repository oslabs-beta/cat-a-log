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
// import catalog from "client/index.ts";
const cachedStructuredLogs = new Set();

async function catalog(trackedVariable, metricName , metricNamespace, metricUnitLabel, CustomerDefinedDimension = {}, resolution = 60, deploy = false) {
  //Check for any errors & validate inputs based on documentations
  //Check for any errors & validate inputs based on documentations
  //if Object already exists in Set
    //push the metrics object to Metrics array
    //add key value to Log
  //else
    //create new Structured Log and add it too cachedStructuredLogs

  //after last catalog function is invoked, send all cached logs with logger at once
  //clear cache

  logger.info("HI HO",
    Object.assign({
      _aws: {
        Timestamp: Date.now(),
        CloudWatchMetrics: [
          {
            Namespace: metricNamespace,
            Dimensions: [Object.keys(CustomerDefinedDimension)],
            Metrics: [
              {
                Name: metricName,
                Unit: metricUnitLabel,
                StorageResolution: resolution,
              }
            ]
          }
        ]
      },
      [`${metricName}`]: trackedVariableValue,
      }, 
        CustomerDefinedDimension
      )
    )
}

export const lambdaHandler = async (event, context) => {
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'hello world',
      })
    };
    let kilos = 70;
    let pounds = 34;
    catalog(pounds, "poundsTest" , "lambda-junction-metrics2", "lbs", {'functionVersion': "$LATEST", 'testDimension': "berp"});
    catalog(kilos, "Weight" , "lambda-junction-metrics2", "Kilograms", {'functionVersion': "$LATEST", 'testDimension': "berp"});
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
  