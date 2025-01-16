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

const cache = {};
async function catalog(trackedVariable, metricName , metricNamespace, metricUnitLabel, CustomerDefinedDimension = {}, resolution = 60, deploy = false) {
  //Check for any errors & validate inputs based on documentations
  //sort customerDimensions key values in alphabetical order
  const sortedDimensions = {};
  for(let i = 0; i < Object.keys(CustomerDefinedDimension).sort().length; i++){
    sortedDimensions[Object.keys(CustomerDefinedDimension).sort()[i]] = CustomerDefinedDimension[Object.keys(CustomerDefinedDimension).sort()[i]];
  }
  //if Object with Namespace and Dimensions already exists in Set
  
  let check = cache[`${metricNamespace}${JSON.stringify(sortedDimensions)}`];
  if(check != undefined){
    //push the metrics object to Metrics array
    cache[`${metricNamespace}${JSON.stringify(sortedDimensions)}`]["_aws"]["CloudWatchMetrics"][0]["Metrics"].push({
        Name: metricName,
        Unit: metricUnitLabel,
        StorageResolution: resolution,
    });
    //add key value to Log
    check[`${metricName}`] = trackedVariable;
  }else{
    //create new Structured Log and add it to cachedStructuredLogs
    cache[`${metricNamespace}${JSON.stringify(sortedDimensions)}`] = 
      Object.assign({
      _aws: {
        Timestamp: Date.now(),
        CloudWatchMetrics: [
          {
            Namespace: metricNamespace,
            Dimensions: [Object.keys(sortedDimensions)],
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
      [`${metricName}`]: trackedVariable,
      }, 
        CustomerDefinedDimension
      )
  }

  if(deploy){
    //after last catalog function is invoked, send all cached logs with logger at once
    for(let i = 0; i < Object.keys(cache).length; i++){
      logger.info(`Your EMF compliant Structured Metrics Log ${i+1}`, cache[Object.keys(cache)[i]]);
    }
    //clear cache
    console.log("deploy Before:", cache);
    for(var member in cache) delete cache[member];
    console.log("deploy After:", cache);
  }
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
    catalog(60, "cacheTest", "lambda-junction-metrics2", "Count", {'testDimension': "berp", 'functionVersion': "$LATEST"});
    catalog(kilos, "Weight" , "lambda-junction-metrics2", "Kilograms", {'functionVersion': "$LATEST", 'testDimension': "berp"}, 60, true);
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
  