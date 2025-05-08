/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

import {catalog, deployCatalog} from "cat-a-logs/index.js";

export const lambdaHandler = async (event, context) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hello world',
    }),
  };
  
  let testVariable1 = Math.ceil(Math.random()*75);
  let testVariable2 = Math.ceil(Math.random()*35);
  let testVariable3 = Math.ceil(Math.random()*20);

  catalog(testVariable1, 'Test01', 'lambda-function-metrics2', 'None', {
    functionVersion: '$LATEST',
    testDimension: 'experimental',
  });

  catalog(testVariable2, 'Test02', 'lambda-function-metrics2', 'Count', {
    testDimension: 'experimental',
    functionVersion: '$LATEST',
  });
  catalog(testVariable2, 'Test03', 'lambda-function-metrics2', 'Count', {
    testDimension2: 'check',
    functionVersion: '$LATEST',
  });

  catalog(
    testVariable3,
    'Latency',
    'CatALog',
    'Milliseconds',
    { functionVersion: '$LATEST', Server: 'Prod' },
  );
  
  deployCatalog();
  return response;
};
