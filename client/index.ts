import { Logger } from '@aws-lambda-powertools/logger';
import { LogItemExtraInput } from '@aws-lambda-powertools/logger/lib/cjs/types/Logger';


//importing winston to configure/ structure EC2 Logs 
import { createLogger, format, transports } from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';
import dotenv from 'dotenv'; // Import the dotenv module 
dotenv.config(); 


// Attempting to configure logger with winston
const winstonlogger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new transports.Console(),
    new WinstonCloudWatch({
      logGroupName: 'ec2-logs', // CloudWatch Log Group
      logStreamName: 'ec2-log-stream', // CloudWatch Log Stream
      awsOptions: {
        credentials: {
          //TODO May need to convert below to process.env?? 
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        },
        region:'us-east-2a',
      },
    }),
  ],
});




const logger = new Logger({ serviceName: 'serverlessAirline' });

//cache entries are structured thusly: 'Namespace + Dimensions(Alphabetically)': EMFObject
const cache: {[key:string]: any} = {};
//catalog(kilos, "kilos" , "lambda-function-metrics", "Kilograms", {'functionVersion': $LATEST, 'testDimension': derp});
export async function catalog(trackedVariable: number | Array<number>, metricName: string , metricNamespace: string, metricUnitLabel: string = "None", CustomerDefinedDimension: {[key:string]: string}={}, resolution: 1 | 60=60, deploy: boolean = false): Promise<void>{
  //Check for any errors & validate inputs based on documentations
    if(!cache) throw new Error("cache is not found, please import cache from cat-a-log");
    if(Array.isArray(trackedVariable)){
      if(trackedVariable.length > 100) throw new Error("metric value cannot have more than 100 elements")
    } 
    if(Object.keys(CustomerDefinedDimension).length > 30){
      throw new Error("EMF has a limit of 30 user defined dimensions per log");
    }
    //sort customerDimensions key values in alphabetical order
    const sortedDimensions: {[key:string]: string} = {};
    for(let i = 0; i < Object.keys(CustomerDefinedDimension).sort().length; i++){
      sortedDimensions[Object.keys(CustomerDefinedDimension).sort()[i]] = CustomerDefinedDimension[Object.keys(CustomerDefinedDimension).sort()[i]];
    }
    //if Object with Namespace and Dimensions already exists in Set
    let check = cache[`${metricNamespace}${sortedDimensions}`];
    if(check != undefined){
      //push the metrics object to Metrics array
      cache[`${metricNamespace}${sortedDimensions}`]["_aws"]["CloudWatchMetrics"][0]["Metrics"].push({
          Name: metricName,
          Unit: metricUnitLabel,
          StorageResolution: resolution,
      });
      //add key value to Log
      check[`${metricName}`] = trackedVariable;
    }else{
      //create new Structured Log and add it to cachedStructuredLogs
      cache[`${metricNamespace}${sortedDimensions}`] = 
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
      console.log(cache);
      for(var member in cache) delete cache[member];
      console.log(cache);
    }
}

export default {
  cache,
  catalog,
  winstonlogger
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