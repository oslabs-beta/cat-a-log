import cache from '../client/index.ts';
import { catalog } from '../client/index.ts';
import Ajv from 'ajv';

const ajv = new Ajv();
// from AWS: EMF schema to test/validate against
const emfSchema = {
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
                      pattern:
                        '^(Seconds|Microseconds|Milliseconds|Bytes|Kilobytes|Megabytes|Gigabytes|Terabytes|Bits|Kilobits|Megabits|Gigabits|Terabits|Percent|Count|Bytes\\/Second|Kilobytes\\/Second|Megabytes\\/Second|Gigabytes\\/Second|Terabytes\\/Second|Bits\\/Second|Kilobits\\/Second|Megabits\\/Second|Gigabits\\/Second|Terabits\\/Second|Count\\/Second|None)$',
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

const validateEmf = ajv.compile(emfSchema);

describe('Catalog function EMF validation', () => {
  it('should build valid EMF logs matching EMF schema', () => {
    let testMetric1 = 115;
    let testMetric2 = 125;
    catalog(
      testMetric1,
      'testingMetric1',
      'lambda-function-metrics2',
      'Milliseconds',
      { testDimension1: 'KPIs', functionVersion: '$LATEST' }
    );
    catalog(
      testMetric2,
      'testingMetric2',
      'lambda-function-metrics2',
      'Milliseconds',
      { testDimension1: 'KPIs', functionVersion: '$LATEST' }
    );
    // capture values from cache
    // const cachedValues = Object.values(cache);
    // console.log("cache = ", cache);
    // console.log('cachedValues =', cachedValues)
    const awsObjects = Object.values(Object.values(cache)[0]);
    console.log('Final cache structure: ', JSON.stringify(cache, null, 2));
    console.log('awsObjects =', awsObjects);

    for (const awsObject of awsObjects) {
      const testMetric = awsObject._aws.CloudWatchMetrics[0].Metrics[0];
      console.log('Metric to validate: ', JSON.stringify(testMetric, null, 2));
      const isValidMetric = validateEmf({
        _aws: {
          Timestamp: awsObject._aws.Timestamp,
          CloudWatchMetrics: [
            {
              Namespace: awsObject._aws.CloudWatchMetrics[0].Namespace,
              Dimensions: awsObject._aws.CloudWatchMetrics[0].Dimensions,
              Metrics: [testMetric],
            },
          ],
        },
      });
      console.log(
        'Isolated metric validation result: ',
        isValidMetric,
        validateEmf.errors
      );

      console.log('awsObject= ', awsObject);
      console.log(
        'stringified awsObject: ',
        JSON.stringify(awsObject, null, 2)
      );
      console.log(
        'Raw Unit value: ',
        awsObject._aws.CloudWatchMetrics[0].Metrics[0].Unit
      );
      console.log(
        'Trimmed Unit value: ',
        awsObject._aws.CloudWatchMetrics[0].Metrics[0].Unit.trim()
      );
      console.log(
        'Length of Unit value: ',
        awsObject._aws.CloudWatchMetrics[0].Metrics[0].Unit.length
      );

      // const isValid = validateEmf(awsObject);
      const isValid = validateEmf(awsObject);
      console.log(
        'isValid result followed by validateEmf.errors result: ',
        isValid,
        validateEmf.errors
      );
      console.log('isValid = ', isValid, typeof isValid);
      expect(isValid).toBe(true);
      if (!isValid) {
        console.error('catalog.test.ts - validation error', validateEmf.errors);
        console.log('catalog.test.ts - entering if block');
        throw new Error(
          'Supplied/Proposed structured log does not comply with EMF schema'
        );
      } else {
        console.log('catalog.test.ts - entering else block');
        console.log('catalog.test.ts - EMF Validation passed!');
      }
    }
  });
  it("should throw an error - doesn't match EMF schema", () => {
    // mock console.error to prevent error message from displaying in this EMF validation failure test
    // store original console.error function for restoring after this test case
    const originalConsoleError = console.error;
    // mocking console.error w/ a mock function that does nothing
    console.error = jest.fn(); 
    return expect(
      catalog(75, 'testingMetric2', 'lambda-junction-metrics2', 'invalidUnit', {
        testDimension1: 'KPIs',
        functionVersion: '$LATEST',
      })
    )
      .rejects.toThrow(
        'Supplied/Proposed structured log does not comply with EMF schema'
      )
      .finally(() => {
        // restore console.error back to original state for any future following tests
        console.error = originalConsoleError; 
      });
  });
  // await expect(catalog(75, "testingMetric2", "lambda-junction-metrics2", "invalidUnit", {testDimension1: 'KPIs', functionVersion: '$LATEST'})).rejects.toThrowError("Supplied log failed to comply with EMF schema spec");
  // });
});
