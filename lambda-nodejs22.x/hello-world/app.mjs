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
// import catalog from "client/index.ts";

// Ajv instance
const ajv = new Ajv();
// from AWS: EMF schema to test/validate against
const emfSchema = {
  type: 'object',
  title: 'Root Node',
  required: ['_aws'],
  properties: {
    _aws: {
      $id: '#/properties/_aws',
      type: 'object',
      title: 'Metadata',
      required: ['Timestamp', 'CloudWatchMetrics'],
      properties: {
        Timestamp: {
          $id: '#/properties/_aws/properties/Timestamp',
          type: 'integer',
          title: 'The Timestamp Schema',
          examples: [1565375354953],
        },
        CloudWatchMetrics: {
          $id: '#/properties/_aws/properties/CloudWatchMetrics',
          type: 'array',
          title: 'MetricDirectives',
          items: {
            $id: '#/properties/_aws/properties/CloudWatchMetrics/items',
            type: 'object',
            title: 'MetricDirective',
            required: ['Namespace', 'Dimensions', 'Metrics'],
            properties: {
              Namespace: {
                $id: '#/properties/_aws/properties/CloudWatchMetrics/items/properties/Namespace',
                type: 'string',
                title: 'CloudWatch Metrics Namespace',
                examples: ['MyApp'],
                pattern: '^(.*)$',
                minLength: 1,
                maxLength: 1024,
              },
              Dimensions: {
                $id: '#/properties/_aws/properties/CloudWatchMetrics/items/properties/Dimensions',
                type: 'array',
                title: 'The Dimensions Schema',
                minItems: 1,
                items: {
                  $id: '#/properties/_aws/properties/CloudWatchMetrics/items/properties/Dimensions/items',
                  type: 'array',
                  title: 'DimensionSet',
                  minItems: 0,
                  maxItems: 30,
                  items: {
                    $id: '#/properties/_aws/properties/CloudWatchMetrics/items/properties/Dimensions/items/items',
                    type: 'string',
                    title: 'DimensionReference',
                    examples: ['Operation'],
                    pattern: '^(.*)$',
                    minLength: 1,
                    maxLength: 250,
                  },
                },
              },
              Metrics: {
                $id: '#/properties/_aws/properties/CloudWatchMetrics/items/properties/Metrics',
                type: 'array',
                title: 'MetricDefinitions',
                items: {
                  $id: '#/properties/_aws/properties/CloudWatchMetrics/items/properties/Metrics/items',
                  type: 'object',
                  title: 'MetricDefinition',
                  required: ['Name'],
                  properties: {
                    Name: {
                      $id: '#/properties/_aws/properties/CloudWatchMetrics/items/properties/Metrics/items/properties/Name',
                      type: 'string',
                      title: 'MetricName',
                      examples: ['ProcessingLatency'],
                      pattern: '^(.*)$',
                      minLength: 1,
                      maxLength: 1024,
                    },
                    Unit: {
                      $id: '#/properties/_aws/properties/CloudWatchMetrics/items/properties/Metrics/items/properties/Unit',
                      type: 'string',
                      title: 'MetricUnit',
                      examples: ['Milliseconds'],
                      pattern:
                        '^(Seconds|Microseconds|Milliseconds|Bytes|Kilobytes|Megabytes|Gigabytes|Terabytes|Bits|Kilobits|Megabits|Gigabits|Terabits|Percent|Count|Bytes\\/Second|Kilobytes\\/Second|Megabytes\\/Second|Gigabytes\\/Second|Terabytes\\/Second|Bits\\/Second|Kilobits\\/Second|Megabits\\/Second|Gigabits\\/Second|Terabits\\/Second|Count\\/Second|None)$',
                    },
                    StorageResolution: {
                      $id: '#/properties/_aws/properties/CloudWatchMetrics/items/properties/Metrics/items/properties/StorageResolution',
                      type: 'integer',
                      title: 'StorageResolution',
                      examples: [60],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const validateEmf = ajv.compile(emfSchema);

const cache = {};
async function catalog(
  trackedVariable,
  metricName,
  metricNamespace,
  metricUnitLabel,
  CustomerDefinedDimension = {},
  resolution = 60,
  deploy = false
) {
  //Check for any errors & validate inputs based on documentations
  if (!cache)
    throw new Error('cache is not found, please import cache from cat-a-log');
  if (Array.isArray(trackedVariable)) {
    if (trackedVariable.length > 100)
      throw new Error('metric value cannot have more than 100 elements');
  }
  if (Object.keys(CustomerDefinedDimension).length > 30) {
    throw new Error(
      'EMF has a limit of 30 user defined dimension keys per log'
    );
  }
  //sort customerDimensions key values in alphabetical order
  const sortedDimensions = {};
  for (
    let i = 0;
    i < Object.keys(CustomerDefinedDimension).sort().length;
    i++
  ) {
    sortedDimensions[Object.keys(CustomerDefinedDimension).sort()[i]] =
      CustomerDefinedDimension[Object.keys(CustomerDefinedDimension).sort()[i]];
  }
  //if Object with Namespace and Dimensions already exists in Set
  if (cache[`${metricNamespace}${JSON.stringify(sortedDimensions)}`] != undefined) {
    //push the metrics object to Metrics array
    cache[`${metricNamespace}${JSON.stringify(sortedDimensions)}`]['_aws'][
      'CloudWatchMetrics'
    ][0]['Metrics'].push({
      Name: metricName,
      Unit: metricUnitLabel,
      StorageResolution: resolution,
    });
    //add key value to Log
    cache[`${metricNamespace}${JSON.stringify(sortedDimensions)}`][`${metricName}`] = trackedVariable;
  } else {
    // //create new Structured Log and add it to cachedStructuredLogs  - BMA 1/18/25 removed to test Ajv
    // cache[`${metricNamespace}${sortedDimensions}`] = Object.assign(
    // NameSpace & Dimensions for EMF part don't exist yet.  Initialize variable to capture EMF/aws key:value pair
    const newEmfLog = Object.assign(
      {
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
                },
              ],
            },
          ],
        },
        [`${metricName}`]: trackedVariable,
      },
      CustomerDefinedDimension
    );
    // validate the new EMF JSON schema against AWS EMF JSON schema before adding to cache object
    const isValid = validateEmf(newEmfLog);
    // if it fails validation throw error
    if (!isValid) {
      console.error('EMF validation failed', validateEmf.errors);
      throw new Error(
        'Supplied/Proposed structured log does not comply with EMF schema'
      );
    }
    // If it passes then add to cache object
    cache[`${metricNamespace}${JSON.stringify(sortedDimensions)}`]= newEmfLog;
  }
}

export const lambdaHandler = async (event, context) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hello world',
    }),
  };
  let kilos = 70;
  let pounds = 34;
  catalog(pounds, 'poundsTest', 'lambda-junction-metrics2', 'lbs', {
    functionVersion: '$LATEST',
    testDimension: 'berp',
  });
  catalog(60, 'cacheTest', 'lambda-junction-metrics2', 'Count', {
    testDimension: 'berp',
    functionVersion: '$LATEST',
  });
  catalog(
    kilos,
    'Weight',
    'lambda-junction-metrics2',
    'Kilograms',
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
