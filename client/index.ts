import { Logger } from '@aws-lambda-powertools/logger';
import { LogItemExtraInput } from '@aws-lambda-powertools/logger/lib/cjs/types/Logger';

const logger = new Logger({ serviceName: 'serverlessAirline' });

let cache: {[key:string]: any} = {};
//catalog(kilos, "kilos" , "lambda-function-metrics", "Kilograms", {'functionVersion': $LATEST, 'testDimension': derp});
export async function catalog(trackedVariable: any, metricName: string , metricNamespace: string, metricUnitLabel: string = "None", CustomerDefinedDimension: {[key:string]: string}={}, resolution: 1 | 60=60, deploy: boolean = false): Promise<void>{
  //Check for any errors & validate inputs based on documentations
    //if Object with Namespace and Dimensions already exists in Set
    let check = cache[`${metricNamespace}${Object.keys(CustomerDefinedDimension).sort((a,b) => a-b)}`];
    if(check != undefined){
      //push the metrics object to Metrics array
      check["_aws"]["CloudWatchMetrics"][0]["Metrics"].push({
          Name: metricName,
          Unit: metricUnitLabel,
          StorageResolution: resolution,
      });
      //add key value to Log
      check[`${metricName}`] = trackedVariable;
    }else{
      //create new Structured Log and add it to cachedStructuredLogs
      check = 
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
    }

    if(deploy){
      //after last catalog function is invoked, send all cached logs with logger at once
      for(let i = 0; i < Object.keys(cache).length; i++){
        logger.info(`Your EMF compliant Structured Metrics Log ${i+1}`, cache[Object.keys(cache)[i]]);
      }
      //clear cache
      cache = {};
    }
}

export default {
  cache,
  catalog
}


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