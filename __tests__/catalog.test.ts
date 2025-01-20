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

describe('Catalog function EMF validation',
  () => {
    it('should build valid EMF logs matching EMF schema', () => {
      let testMetric1 = 115;
      let testMetric2 = 125;
      catalog(
        testMetric1,
        'testingMetric1',
        'lambda-function-metrics2',
        'Count/Second',
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
      const cachedValues = Object.values(cache);
      for(const cachedValue of cachedValues) {
        const isValid = validateEmf(cachedValue);
        expect(isValid).toBe(true);
        if (!isValid) {
          console.error(validateEmf.errors)
          throw new Error("Supplied/Proposed structured log does not comply with EMF schema")
        }
      }
    });
    it("should throw an error - doesn't match EMF schema", () => {
      return expect(catalog(75, "testingMetric2", "lambda-junction-metrics2", "invalidUnit", {testDimension1: 'KPIs', functionVersion: '$LATEST'})).rejects.toThrow("Supplied/Proposed structured log does not comply with EMF schema");
      });
      // await expect(catalog(75, "testingMetric2", "lambda-junction-metrics2", "invalidUnit", {testDimension1: 'KPIs', functionVersion: '$LATEST'})).rejects.toThrowError("Supplied log failed to comply with EMF schema spec");
      // });
  });
