# smartthings-zipkin-js

SmartThings JavaScript Zipkin package

## SQS Options

All SQS interactions are handled using the `sqs-producer` package, which minimizes the code required to enqueue new
messages. `sqs-producer` is an abstraction on top of the official AWS SQS lib and as all configuration options used to
create an SQS client instance should be valid. The only required configuration option is `queueUrl`.

[https://github.com/bbc/sqs-producer](https://github.com/bbc/sqs-producer)

## AWS AssumeRole

In accordance with best practices, this package allows for interactions with AWS services to operate under an assumed
role. By default the IAM credentials provided by the AWS instance will be used for all interactions. The presence of a
an `assumeRole` configuration block will result in an auth session using an assumed role which provides the ability to
leave the minimally required access permissions for a user and rely in IAM roles to grant appropriate access.

[https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/STS.html#assumeRole-property](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/STS.html#assumeRole-property)

## Error Handling

The default configuration will log errors to the console. If you would like to leverage a pre-existing logging solution,
simply provide a logger instance in your configuration. The `error` method of the logger will be called with any errors
encountered during execution.

## Configuration Options

```javascript
{
    "onError": myLogger,
    "assumeRole": {
        "DurationSeconds": 3600,
        "RoleArn": "arn:aws:iam::123456789012:role/demo",
        "RoleSessionName": "Bob"
    },
    "sqs": {
        "queueUrl": "https://sqs.eu-west-1.amazonaws.com/account-id/queue-name",
        "region": "eu-west-1"
    }
}
```
