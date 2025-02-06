var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Logger } from "@aws-lambda-powertools/logger";
import { Ajv } from "ajv";
//cache entries are structured thusly: 'Namespace + Dimensions(Alphabetically)': EMFObject
const cache = {};
//catalog(kilos, "kilos" , "lambda-function-metrics", "Kilograms", {'functionVersion': $LATEST, 'testDimension': derp});
function catalog(trackedVariable_1, metricName_1, metricNamespace_1) {
    return __awaiter(this, arguments, void 0, function* (trackedVariable, metricName, metricNamespace, metricUnitLabel = "None", CustomerDefinedDimension = {}, resolution = 60, deploy = false) {
        //Check for any errors & validate inputs based on documentations
        if (!cache)
            throw new Error("cache is not found, please import cache from cat-a-log");
        console.log(Object.keys(CustomerDefinedDimension).concat([metricName.toLowerCase()]));
        const badKeys = ["level", "message", "sampling_rate", "service", "timestamp", "xray_trace_id"];
        if (Object.keys(CustomerDefinedDimension)
            .concat([metricName.toLowerCase()])
            .filter((el, i) => badKeys[i]).length > 0) {
            throw new Error("metricName, or Dimension names cannot be the same as these native logger keys: level || message || sampling_rate || service || timestamp || xray_trace_id");
        }
        if (Array.isArray(trackedVariable)) {
            if (trackedVariable.length > 100)
                throw new Error("metric value cannot have more than 100 elements");
        }
        if (Object.keys(CustomerDefinedDimension).length > 30) {
            throw new Error("EMF has a limit of 30 user defined dimension keys per log");
        }
        const logger = new Logger({ serviceName: "serverlessAirline" });
        // Ajv instance
        const ajv = new Ajv();
        // from AWS: EMF schema to test/validate against
        const emfSchema = {
            type: "object",
            title: "Root Node",
            required: ["_aws"],
            properties: {
                _aws: {
                    $id: "#/properties/_aws",
                    type: "object",
                    title: "Metadata",
                    required: ["Timestamp", "CloudWatchMetrics"],
                    properties: {
                        Timestamp: {
                            $id: "#/properties/_aws/properties/Timestamp",
                            type: "integer",
                            title: "The Timestamp Schema",
                            examples: [1565375354953],
                        },
                        CloudWatchMetrics: {
                            $id: "#/properties/_aws/properties/CloudWatchMetrics",
                            type: "array",
                            title: "MetricDirectives",
                            items: {
                                $id: "#/properties/_aws/properties/CloudWatchMetrics/items",
                                type: "object",
                                title: "MetricDirective",
                                required: ["Namespace", "Dimensions", "Metrics"],
                                properties: {
                                    Namespace: {
                                        $id: "#/properties/_aws/properties/CloudWatchMetrics/items/properties/Namespace",
                                        type: "string",
                                        title: "CloudWatch Metrics Namespace",
                                        examples: ["MyApp"],
                                        pattern: "^(.*)$",
                                        minLength: 1,
                                        maxLength: 1024,
                                    },
                                    Dimensions: {
                                        $id: "#/properties/_aws/properties/CloudWatchMetrics/items/properties/Dimensions",
                                        type: "array",
                                        title: "The Dimensions Schema",
                                        minItems: 1,
                                        items: {
                                            $id: "#/properties/_aws/properties/CloudWatchMetrics/items/properties/Dimensions/items",
                                            type: "array",
                                            title: "DimensionSet",
                                            minItems: 0,
                                            maxItems: 30,
                                            items: {
                                                $id: "#/properties/_aws/properties/CloudWatchMetrics/items/properties/Dimensions/items/items",
                                                type: "string",
                                                title: "DimensionReference",
                                                examples: ["Operation"],
                                                pattern: "^(.*)$",
                                                minLength: 1,
                                                maxLength: 250,
                                            },
                                        },
                                    },
                                    Metrics: {
                                        $id: "#/properties/_aws/properties/CloudWatchMetrics/items/properties/Metrics",
                                        type: "array",
                                        title: "MetricDefinitions",
                                        items: {
                                            $id: "#/properties/_aws/properties/CloudWatchMetrics/items/properties/Metrics/items",
                                            type: "object",
                                            title: "MetricDefinition",
                                            required: ["Name"],
                                            properties: {
                                                Name: {
                                                    $id: "#/properties/_aws/properties/CloudWatchMetrics/items/properties/Metrics/items/properties/Name",
                                                    type: "string",
                                                    title: "MetricName",
                                                    examples: ["ProcessingLatency"],
                                                    pattern: "^(.*)$",
                                                    minLength: 1,
                                                    maxLength: 1024,
                                                },
                                                Unit: {
                                                    $id: "#/properties/_aws/properties/CloudWatchMetrics/items/properties/Metrics/items/properties/Unit",
                                                    type: "string",
                                                    title: "MetricUnit",
                                                    examples: ["Milliseconds"],
                                                    pattern: "^(Seconds|Microseconds|Milliseconds|Bytes|Kilobytes|Megabytes|Gigabytes|Terabytes|Bits|Kilobits|Megabits|Gigabits|Terabits|Percent|Count|Bytes\\/Second|Kilobytes\\/Second|Megabytes\\/Second|Gigabytes\\/Second|Terabytes\\/Second|Bits\\/Second|Kilobits\\/Second|Megabits\\/Second|Gigabits\\/Second|Terabits\\/Second|Count\\/Second|None)$",
                                                },
                                                StorageResolution: {
                                                    $id: "#/properties/_aws/properties/CloudWatchMetrics/items/properties/Metrics/items/properties/StorageResolution",
                                                    type: "integer",
                                                    title: "StorageResolution",
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
        const sortedDimensions = {};
        for (let i = 0; i < Object.keys(CustomerDefinedDimension).sort().length; i++) {
            sortedDimensions[Object.keys(CustomerDefinedDimension).sort()[i]] =
                CustomerDefinedDimension[Object.keys(CustomerDefinedDimension).sort()[i]];
        }
        //if Object with Namespace and Dimensions already exists in Set
        let check = cache[`${metricNamespace}${sortedDimensions}`];
        if (check != undefined) {
            //push the metrics object to Metrics array
            cache[`${metricNamespace}${sortedDimensions}`]["_aws"]["CloudWatchMetrics"][0]["Metrics"].push({
                Name: metricName,
                Unit: metricUnitLabel,
                StorageResolution: resolution,
            });
            //add key value to Log
            check[`${metricName}`] = trackedVariable;
        }
        else {
            // //create new Structured Log and add it to cachedStructuredLogs  - BMA 1/18/25 removed to test Ajv
            // cache[`${metricNamespace}${sortedDimensions}`] = Object.assign(
            // NameSpace & Dimensions for EMF part don't exist yet.  Initialize variable to capture EMF/aws key:value pair
            const newEmfLog = Object.assign({
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
            }, CustomerDefinedDimension);
            // Log the Unit value before validation
            console.log("index.ts - Unit value before validation: ", newEmfLog._aws.CloudWatchMetrics[0].Metrics[0].Unit);
            // validate the new EMF JSON schema against AWS EMF JSON schema before adding to cache object
            const isValid = validateEmf(newEmfLog);
            // //troubleshooting console.error in test
            // console.log('index.ts - Validation result: ', isValid);
            // troubleshooting console.error in emf test
            // console.log('index.ts - Validation errors: ', validateEmf.errors);
            // if it fails validation throw error
            if (!isValid) {
                console.error("An error occurred during EMF validation: ", validateEmf.errors);
                throw new Error("Supplied/Proposed structured log does not comply with EMF schema");
            }
            // If it passes then add to cache object
            cache[`${metricNamespace}${sortedDimensions}`] = newEmfLog;
        }
        if (deploy) {
            //after last catalog function is invoked, send all cached logs with logger at once
            for (let i = 0; i < Object.keys(cache).length; i++) {
                logger.info(`Your EMF compliant Structured Metrics Log ${i + 1}`, cache[Object.keys(cache)[i]]);
            }
            //clear cache
            console.log("BEFORE:", cache);
            for (var member in cache)
                delete cache[member];
            console.log("AFTER:", cache);
        }
    });
}
export { cache, catalog };
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
