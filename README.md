# Welcome to Cat-A-Log!
This npm package will help you create AWS Embedded Metric Format Logs and publish them to AWS Cloudwatch using AWS Lambda Powertools. EMF formatting will allow for chosen metrics to be automatically visualized in Cloudwatch metrics  for simplier log debugging.

  <p align="center">
  <img src="./snapshots/Catalog_art.png" width="200" />
  </p>


## About Embedded Metric Formatting (EMF):
This is a JSON specification to communicate with Cloudwatch Logs to automatically extract values embedded in the structured log events. EMF is especially great for applications that make logs and need custom metrics without more complexity or cost. For more information please visit the following link:
<a href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format_Specification.html" target="_blank">AWS Documentation on EMF Formatting</a>

## Why use Cat-A-Log?
Why use a washing machine when you can do them by hand? Because it saves you time and makes your job way easier! Leveraging AWS Lambda Powertools we can use the cat-a-log function to invoke and format logs into AWS Embedded Metric Format. By publishing these logs to AWS Cloudwatch, we are able to provide engineers with automatic metric visulaization to make the process of debugging logs much more efficient. Cat-a-log utilizies a cache to make effcient work of sending logs to Cloudwatch.


## Instructions
**Prerequites:**
Your chosen Integated Development Environment (i.e. VS Code) must already be be connected to AWS Lambda. For more guidence on setting up AWS Lambda we recommend following this helpful tutorial from AWS: <a href="https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started-hello-world.html" target="_blank">Deploy Hello World Application with AWS SAM</a>

**Installation:**
1. Install our package using the command `npm install cat-a-logs` then import the function and cache into your js file that connects to AWS Lambda `import { cache, catalog } from "cat-a-logs/index.js";` Check out Cat-A-Log on npm using the attached link:
<a href="https://www.npmjs.com/package/cat-a-logs?activeTab=readme" target="_blank">Cat-A-Log</a>

2. Now enter your arguments into the catalog function! Lets go through each argument one at a time and see what this looks like. First Lets take a look at the function definition:

      ```
      function catalog(
        trackedVariable: number | Array<number>,
        metricName: string,
        metricNamespace: string,
        metricUnitLabel: string = "None",
        CustomerDefinedDimension: { [key: string]: string } = {},
        resolution: 1 | 60 = 60,
        deploy: boolean = false)
      ```

    - **trackedVariable**: This variable represents a number that is dynamic and can change with each call - these numbers are reflected under Metrics
    - **metricName**: This is a unique label of the tracked variable that will be reflected inside AWS Lambda. Must be written as a `string`
    - **metricNamespace**: This will be your metric namespace in AWS Cloudwatch the metric or metrics will appear in
    - **metricUnitLabel**: Explict Unit that Cloudwatch uses for EMF Configuration. Please note - Can only be the following labels:
      - Seconds | Microseconds | Milliseconds | Bytes | Kilobytes | Megabytes | Gigabytes | Terabytes | Bits | Kilobits | Megabits | Gigabits | Terabits | Percent | Count | Bytes/Second | Kilobytes/Second | Megabytes/Second | Gigabytes/Second | Terabytes/Second | Bits/Second | Kilobits/Second | Megabits/Second | Gigabits/Second | Terabits/Second | Count/Second | None

      - To read more about Metric Datum see this <a href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_MetricDatum.html" target="_blank">link</a>
    - **CustomerDefinedDimension**: This is an object - key will be demension and value 
    - **resolution**: automatically set to default value
    - **deploy**: automatically set to false 



## Notes to Self:
**Structure of the files:**

`index.ts` is compiled to `index.js`. Important to compile `.ts` file to es6 js syntax using the `tsc —target es6 (filepath)` command
`app.mjs ` is a "pathway" to our lambda function. Here is where we will import catalog function and use it to involke our lambda function

index.ts lines 25-30 is checking to see if the value "level" || "message" || "sampling_rate" || "service" || "timestamp" ||"xray_trace_id"

logger.info gives you some information level is key and value is info


if you write name that it will overwrite the keys 

**Tech Challenges**
Spent 3 days dealing with inconsistencies of ES6/CommonJS in our code before compiling .js in ES6

**Files to Delete**
App.js
App.tsx
tailwind.css?
tailwind.config.js
input.css?
postcss.config.js
server(folder)
coverage (folder)
bin (folder)
template.html
testlogger.js 

-->webpack.config.js?  **Test renaming to see if it breaks.  

Package json: 
    "@babel/core": "^7.25.7",
    "@babel/plugin-transform-runtime": "^7.25.7",
    "@babel/preset-env": "^7.25.8",
    "@babel/preset-react": "^7.25.7",
    "@babel/runtime": "^7.25.7",
    "babel-eslint": "^10.1.0",
    "babel-loader": "^9.2.1",
    "cross-env": "^7.0.3",
    "css-loader": "^7.1.2",
    "html-webpack-plugin": "^5.6.0",
    "node-mocks-http": "^1.16.1",
    "nodemon": "^3.1.7",
    "postcss": "^8.4.49",
    "postcss-loader": "^8.1.1",
    "postcss-preset-env": "^10.1.1",
    "sass": "^1.80.5",
    "sass-loader": "^16.0.2",
    "style-loader": "^4.0.0",
    "tailwindcss": "^3.4.15",
    "webpack": "^5.95.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^5.1.0"
    "bcrypt": "^5.1.1",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "express": "^4.21.1",
    "express-session": "^1.18.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.27.0"

**npmignore**
lambda-nodejs22.x

**gitignore**
lambda-nodejs22.x