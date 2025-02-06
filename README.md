# cat-a-log
This function will help you create AWS Embedded Metric Format Logs and publish them to AWS Cloudwatch. EMF formatting will allow for chosen metrics to be automatically visualized in graphs for simplier debugging.

**What is Embedded Metric Formatting (EMF):**\
This is a JSON specification to communicate with Cloudwatch Logs to automatically extract values embedded in the structured log events.
EMF is especially great for applications that make logs and need custom metrics without more complexity or cost.
 For more information please visit the link below 

<a href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format_Specification.html" target="_blank">AWS Documentation on EMF Formatting</a>


**Why use cat-a-log?:**\
Why use a washing machine when you can do them by hand? Becuase it makes your job way easier! Leveraging AWS Lambda Powertools we can use the cat-a-log function to invoke and format logs into AWS Embedded Metric Format. By publishing these logs to AWS Cloudwatch, we are able to provide engineers with automatic metric visulaization to make the process of debugging logs much more efficient. Cat-a-log utilizies a cache to make effcient work of sending logs to Cloudwatch.


**How do I use cat-a-log?:**\
npm install  our package using the command `npm install cat-a-logs` into your app.mjs file then capture the function and cache (we will talk about this later) 
`import {cache, catalog} from "cat-a-logs/index.js";`

The catalog function  below takes in the following arguments - lets look at each argument one at a time:

`function catalog(
  trackedVariable: number | Array<number>,
  metricName: string,
  metricNamespace: string,
  metricUnitLabel: string = "None",
  CustomerDefinedDimension: { [key: string]: string } = {},
  resolution: 1 | 60 = 60,
  deploy: boolean = false
)`

trackedVariable: This parameter allows you to caputre and track a variable of 
metricName:
metricNamespace:
metricUnitLabel: Can only be the fo
- Seconds | Microseconds | Milliseconds | Bytes | Kilobytes | Megabytes | Gigabytes | Terabytes | Bits | Kilobits | Megabits | Gigabits | Terabits | Percent | Count | Bytes/Second | Kilobytes/Second | Megabytes/Second | Gigabytes/Second | Terabytes/Second | Bits/Second | Kilobits/Second | Megabits/Second | Gigabits/Second | Terabits/Second | Count/Second | None
CustomerDefinedDimension: 
resolution: 
deploy: 

**Structure of the files:**\
<a href="https://www.npmjs.com/package/cat-a-logs?activeTab=readme" target="_blank">Link to npm package</a>

`index.ts` is compiled to `index.js`. Important to compile `.ts` file to es6 js syntax using the `tsc —target es6 (filepath)` command
`app.mjs ` is a "pathway" to our lambda function. Here is where we will import catalog function and use it to involke our lambda function

index.ts lines 25-30 is checking to see if the value "level" || "message" || "sampling_rate" || "service" || "timestamp" ||"xray_trace_id"

logger.info gives you some information level is key and value is info


if you write name that it will overwrite the keys 

**Tech Challenges**
Spent 3 days dealing with inconsistencies of ES6/CommonJS in our code before compiling .js in ES6