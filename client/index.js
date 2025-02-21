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
//let latency = 300; (Example metric to track)
//Example for in-line use of Cat-a-log w/maximum arguments: catalog(latency, "Latency" , "lambda-function-metrics", "Milliseconds", {'functionVersion': '$LATEST', 'Server': 'Prod'}, 60, deploy);
//Example for in-line use of Cat-a-log w/minimum arguments: catalog(latency, "Latency");
function catalog(trackedVariable_1, metricName_1) {
    return __awaiter(this, arguments, void 0, function* (trackedVariable, metricName, metricNamespace = "CatALog-Default-Metrics", metricUnitLabel = "None", CustomerDefinedDimension = {}, resolution = 60, deploy = false) {
        //Check for any errors & validate inputs based on documentations
        if (!cache)
            throw new Error("cache is not found, please import cache from cat-a-log");
        //check if any provided dimension names or metric names conflict with native logger keys.
        const badKeys = ["level", "message", "sampling_rate", "service", "timestamp", "xray_trace_id"];
        const yourKeys = Object.keys(CustomerDefinedDimension).concat([metricName.toLowerCase()]);
        for (let i = 0; i < yourKeys.length; i++) {
            if (badKeys.includes(yourKeys[i])) {
                //if a dimension name or metric name conflicts with native logger keys, throw error
                throw new Error("metricName, or Dimension names cannot be the same as these native logger keys: level || message || sampling_rate || service || timestamp || xray_trace_id");
            }
        }
        //EMF specification catch: if tracked variable is an array with a length greater than 100, throw error and do not log
        if (Array.isArray(trackedVariable)) {
            if (trackedVariable.length > 100)
                throw new Error("metric value cannot have more than 100 elements");
        }
        //EMF specification catch: make sure provided dimension object does not have more than 30 entries
        // if (Object.keys(CustomerDefinedDimension).length > 30) {
        //   throw new Error(
        //     "EMF has a limit of 30 user defined dimension keys per log"
        //   );
        // }
        //Create new instance of Logger to use in function
        const logger = new Logger({ serviceName: "serverlessAirline" });
        //Set up Ajv instance for JSON validation
        const ajv = new Ajv();
        // from AWS: EMF schema to test/validate against with Ajv
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
        //usable instance of the validation JSON
        const validateEmf = ajv.compile(emfSchema);
        //sort customerDimensions key values in alphabetical order. We will use this to keep the keys in our cache consistant. Since the order of the dimensions do not change where the metrics are stored
        const sortedDimensions = {};
        for (let i = 0; i < Object.keys(CustomerDefinedDimension).sort().length; i++) {
            sortedDimensions[Object.keys(CustomerDefinedDimension).sort()[i]] =
                CustomerDefinedDimension[Object.keys(CustomerDefinedDimension).sort()[i]];
        }
        //Check if Object with Namespace and Dimensions already exists in cache
        let check = cache[`${metricNamespace}${sortedDimensions}`];
        if (check != undefined) {
            //if the Namespace and Dimensions exist, push the metrics object to Metrics array
            cache[`${metricNamespace}${sortedDimensions}`]["_aws"]["CloudWatchMetrics"][0]["Metrics"].push({
                Name: metricName,
                Unit: metricUnitLabel,
                StorageResolution: resolution,
            });
            //add key value to root of existing structured Log
            check[`${metricName}`] = trackedVariable;
        }
        else {
            //create new Structured Log and add it to cachedStructuredLogs
            //If NameSpace & Dimensions for EMF part don't exist yet, initialize variable to capture EMF/aws key:value pair
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
            // if the new EMF object fails validation, throw error and do not cache flawed object
            if (!isValid) {
                console.error("An error occurred during EMF validation: ", validateEmf.errors);
                throw new Error("Supplied/Proposed structured log does not comply with EMF schema");
            }
            // If the new EMF object passes validation then add to cache object
            cache[`${metricNamespace}${sortedDimensions}`] = newEmfLog;
        }
        if (deploy) {
            //after last catalog function is invoked, send all cached logs with logger at once
            for (let i = 0; i < Object.keys(cache).length; i++) {
                logger.info(`Your EMF compliant Structured Metrics Log ${i + 1}`, cache[Object.keys(cache)[i]]);
            }
            //clear cache after logging all cached objects to Lambda
            console.log("BEFORE:", cache);
            for (var member in cache)
                delete cache[member];
            console.log("AFTER:", cache);
        }
    });
}
export { cache, catalog };
