const AWS = require("aws-sdk");
const Producer = require("sqs-producer");
const {
  jsonEncoder: { JSON_V2 }
} = require("zipkin");
const SQSLogger = require("./SQSLogger");

const encoder = { encode: span => `[${JSON_V2.encode(span)}]` };

const LoggerFactory = {
  assumeRole(opts, cb) {
    const sts = new AWS.STS();
    sts.assumeRole(opts, (error, data) => {
      if (error) {
        cb(error);
      } else {
        const modEnv = process.env;

        modEnv.AWS_ACCESS_KEY_ID = data.Credentials.AccessKeyId;
        modEnv.AWS_SECRET_ACCESS_KEY = data.Credentials.SecretAccessKey;
        modEnv.AWS_SESSION_TOKEN = data.Credentials.SessionToken;

        cb(null, {
          AWS_ACCESS_KEY_ID: data.Credentials.AccessKeyId,
          AWS_SECRET_ACCESS_KEY: data.Credentials.SecretAccessKey,
          AWS_SESSION_TOKEN: data.Credentials.SessionToken
        });
      }
    });
  },

  createLogger(opts, cb) {
    const sqsDefaults = {
      region: "us-east-1"
    };

    const options = Object.assign({}, opts);
    const sqsOpts = Object.assign({}, sqsDefaults, options.sqs || {});

    const onError =
      options.onError ||
      function(err) {
        const log = options.log || console;
        log.error(err);
      };

    const loggerOpts = {
      encoder,
      onError
    };

    if (options.assumeRole) {
      this.assumeRole(options.assumeRole, (error, creds) => {
        if (error) {
          cb(error);
        } else {
          const opts = Object.assign({}, sqsOpts, creds);
          const producer = Producer.create(opts);
          const logger = new SQSLogger(
            Object.assign({}, loggerOpts, {
              producer
            })
          );

          cb(null, logger);
        }
      });
    } else {
      try {
        const producer = Producer.create(sqsOpts);
        const logger = new SQSLogger(
          Object.assign({}, loggerOpts, {
            producer
          })
        );
        cb(null, logger);
      } catch (error) {
        cb(error);
      }
    }
  }
};

module.exports = LoggerFactory;
