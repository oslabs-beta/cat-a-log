"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.catalog = catalog;
var logger_1 = require("@aws-lambda-powertools/logger");
var ajv_1 = require("ajv");
//cache entries are structured thusly: 'Namespace + Dimensions(Alphabetically)': EMFObject
var cache = {};
//catalog(kilos, "kilos" , "lambda-function-metrics", "Kilograms", {'functionVersion': $LATEST, 'testDimension': derp});
function catalog(trackedVariable_1, metricName_1, metricNamespace_1) {
    return __awaiter(this, arguments, void 0, function (trackedVariable, metricName, metricNamespace, metricUnitLabel, CustomerDefinedDimension, resolution, deploy) {
        var logger, ajv, emfSchema, validateEmf, sortedDimensions, i, check, newEmfLog, isValid, i, member;
        var _a;
        if (metricUnitLabel === void 0) { metricUnitLabel = 'None'; }
        if (CustomerDefinedDimension === void 0) { CustomerDefinedDimension = {}; }
        if (resolution === void 0) { resolution = 60; }
        if (deploy === void 0) { deploy = false; }
        return __generator(this, function (_b) {
            //Check for any errors & validate inputs based on documentations
            if (!cache)
                throw new Error('cache is not found, please import cache from cat-a-log');
            if (Object.keys(CustomerDefinedDimension).concat([metricName.toLowerCase()]).filter(function (el) { return el === "level" || "message" || "sampling_rate" || "service" || "timestamp" || "xray_trace_id"; }).length > 0)
                throw new Error("metricName, or Dimension names cannot be the same as these native logger keys: level || message || sampling_rate || service || timestamp || xray_trace_id");
            if (Array.isArray(trackedVariable)) {
                if (trackedVariable.length > 100)
                    throw new Error('metric value cannot have more than 100 elements');
            }
            if (Object.keys(CustomerDefinedDimension).length > 30) {
                throw new Error('EMF has a limit of 30 user defined dimension keys per log');
            }
            logger = new logger_1.Logger({ serviceName: 'serverlessAirline' });
            ajv = new ajv_1.default();
            emfSchema = {
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
                                                        pattern: '^(Seconds|Microseconds|Milliseconds|Bytes|Kilobytes|Megabytes|Gigabytes|Terabytes|Bits|Kilobits|Megabits|Gigabits|Terabits|Percent|Count|Bytes\\/Second|Kilobytes\\/Second|Megabytes\\/Second|Gigabytes\\/Second|Terabytes\\/Second|Bits\\/Second|Kilobits\\/Second|Megabits\\/Second|Gigabits\\/Second|Terabits\\/Second|Count\\/Second|None)$',
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
            validateEmf = ajv.compile(emfSchema);
            sortedDimensions = {};
            for (i = 0; i < Object.keys(CustomerDefinedDimension).sort().length; i++) {
                sortedDimensions[Object.keys(CustomerDefinedDimension).sort()[i]] =
                    CustomerDefinedDimension[Object.keys(CustomerDefinedDimension).sort()[i]];
            }
            check = cache["".concat(metricNamespace).concat(sortedDimensions)];
            if (check != undefined) {
                //push the metrics object to Metrics array
                cache["".concat(metricNamespace).concat(sortedDimensions)]['_aws']['CloudWatchMetrics'][0]['Metrics'].push({
                    Name: metricName,
                    Unit: metricUnitLabel,
                    StorageResolution: resolution,
                });
                //add key value to Log
                check["".concat(metricName)] = trackedVariable;
            }
            else {
                newEmfLog = Object.assign((_a = {
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
                        }
                    },
                    _a["".concat(metricName)] = trackedVariable,
                    _a), CustomerDefinedDimension);
                // Log the Unit value before validation
                console.log('index.ts - Unit value before validation: ', newEmfLog._aws.CloudWatchMetrics[0].Metrics[0].Unit);
                isValid = validateEmf(newEmfLog);
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
                cache["".concat(metricNamespace).concat(sortedDimensions)] = newEmfLog;
            }
            if (deploy) {
                //after last catalog function is invoked, send all cached logs with logger at once
                for (i = 0; i < Object.keys(cache).length; i++) {
                    logger.info("Your EMF compliant Structured Metrics Log ".concat(i + 1), cache[Object.keys(cache)[i]]);
                }
                //clear cache
                console.log("BEFORE:", cache);
                for (member in cache)
                    delete cache[member];
                console.log("AFTER:", cache);
            }
            return [2 /*return*/];
        });
    });
}
exports.default = {
    cache: cache,
    catalog: catalog,
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
