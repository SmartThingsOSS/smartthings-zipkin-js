const uuidv1 = require("uuid/v1");

function SQSLogger(options) {
  this.producer = options.producer;
  this.onError = options.onError;
  this.encoder = options.encoder;
}

SQSLogger.prototype.logSpan = function(span) {
  try {
    const payload = {
      id: uuidv1(),
      body: this.encoder.encode(span)
    };

    this.producer.send([payload], error => {
      if (error) {
        this.onError(error);
      }
    });
  } catch (error) {
    this.onError(error);
  }
};

module.exports = SQSLogger;
