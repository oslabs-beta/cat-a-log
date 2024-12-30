import { Logger } from '@aws-lambda-powertools/logger';
import { LogItemExtraInput } from '@aws-lambda-powertools/logger/lib/cjs/types/Logger';

const logger = new Logger({ serviceName: 'serverlessAirline' });

//catalog(kilos, "kilos" , "lambda-function-metrics", "Kilograms", {'functionVersion': $LATEST, 'testDimension': derp});
export async function catalog(trackedVariable: any, metricName: string , metricNamespace: string, metricUnitLabel: string, CustomerDefinedDimension: Object={}): Promise<void>{
  //Check for any errors & validate inputs based on documentations
  logger.info(JSON.stringify(
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
                StorageResolution: 60
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
  )
}


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