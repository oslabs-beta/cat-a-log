# cat-a-log
Creating AWS EMF structured logs to AWS Cloudwatch logs 

**Why use cat-a-log?:**\
Why use a washing machine when you can do them by hand? Becuase it makes your job way easier! Leveraging AWS Lambda Powertools we can use the cat-a-log function to invoke and format logs into AWS Embedded Metric Format. Then we can and publish to AWS Cloudwatch to provide engineers with automatic metric visulaization to make the process of debugging logs much more seamless.

**What is Embedded Metric Formatting (EMF):**\
This is a JSON specification to communicate with Cloudwatch Logs to automatically extract values embedded in the structured log events. For more information please visit the link below 

<a href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format_Specification.html" target="_blank">AWS Documentation on EMF Formatting</a>

**Structure of the files:**\
`index.ts` is compiled to `index.js`. Important to compile `.ts` file to es6 js syntax using the `tsc —target es6 (filepath)` command
`app.mjs ` is a "pathway" to our lambda function. Here is where we will import catalog function and use it to involke our lambda function

index.ts lines 25-30 is checking to see if the value "level" || "message" || "sampling_rate" || "service" || "timestamp" ||"xray_trace_id"

logger.info gives you some information level is key and value is info


if you write name that it will overwrite the keys 