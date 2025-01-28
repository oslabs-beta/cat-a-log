import { Logger } from '@aws-lambda-powertools/logger';
import { LogItemExtraInput } from '@aws-lambda-powertools/logger/lib/cjs/types/Logger';
import Ajv from 'ajv';



//cache entries are structured thusly: 'Namespace + Dimensions(Alphabetically)': EMFObject
const cache: { [key: string]: any } = {};
//catalog(kilos, "kilos" , "lambda-function-metrics", "Kilograms", {'functionVersion': $LATEST, 'testDimension': derp});
export async function catalog(
  trackedVariable: number | Array<number>,
  metricName: string,
  metricNamespace: string,
  metricUnitLabel: string = 'None',
  CustomerDefinedDimension: { [key: string]: string } = {},
  resolution: 1 | 60 = 60,
  deploy: boolean = false
): Promise<void> {
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
  const logger = new Logger({ serviceName: 'serverlessAirline' });
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
  //sort customerDimensions key values in alphabetical order
  const sortedDimensions: { [key: string]: string } = {};
  for (
    let i = 0;
    i < Object.keys(CustomerDefinedDimension).sort().length;
    i++
  ) {
    sortedDimensions[Object.keys(CustomerDefinedDimension).sort()[i]] =
      CustomerDefinedDimension[Object.keys(CustomerDefinedDimension).sort()[i]];
  }
  //if Object with Namespace and Dimensions already exists in Set
  let check = cache[`${metricNamespace}${sortedDimensions}`];
  if (check != undefined) {
    //push the metrics object to Metrics array
    cache[`${metricNamespace}${sortedDimensions}`]['_aws'][
      'CloudWatchMetrics'
    ][0]['Metrics'].push({
      Name: metricName,
      Unit: metricUnitLabel,
      StorageResolution: resolution,
    });
    //add key value to Log
    check[`${metricName}`] = trackedVariable;
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
    if(!isValid) {
      console.error("EMF validation failed", validateEmf.errors);
      throw new Error("Supplied/Proposed structured log does not comply with EMF schema")
    }
    // If it passes then add to cache object
    cache[`${metricNamespace}${sortedDimensions}`] = newEmfLog;
  }

  if (deploy) {
    //after last catalog function is invoked, send all cached logs with logger at once
    for (let i = 0; i < Object.keys(cache).length; i++) {
      logger.info(
        `Your EMF compliant Structured Metrics Log ${i + 1}`,
        cache[Object.keys(cache)[i]]
      );
    }
    //clear cache
    console.log(cache);
    for (var member in cache) delete cache[member];
    console.log(cache);
  }
}

export default {
  cache,
  catalog,
};

/*Current Working logger invocation
logger.info("Your EMF compliant Structured Metrics Log",
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
    [`${metricName}`]: trackedVariable,
    }, 
      CustomerDefinedDimension
    )
  
)
*/

//Old handler function
// export const handler = async (_event, _context): Promise<void> => {
//   const testObj = {
//     testguy: "hi",
//     fool: 42,
//     functionVersion: "$LATEST",
//     _aws: {
//       Timestamp: Date.now(),
//       CloudWatchMetrics: [
//         {
//           Namespace: "lambda-function-metrics",
//           Dimensions: [["functionVersion"]],
//           Metrics: [
//             {
//               Name: "fool",
//               Unit: "Milliseconds",
//               StorageResolution: 60
//             }
//           ]
//         }
//       ]
//     },
//   }
//   logger.info(JSON.stringify(testObj));
// };
