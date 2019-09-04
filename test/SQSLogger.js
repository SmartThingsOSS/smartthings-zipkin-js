const test = require("tape");
const sinon = require("sinon");
const SQSLogger = require("../lib/SQSLogger");

const producer = {
  send: sinon.stub()
};
let onError = sinon.stub();
const encoder = {
  encode: sinon.stub()
};

function setup() {
  sinon.reset();
}

test("calls error with producer returning error", t => {
  setup();
  t.plan(3);

  const producerError = new Error("producer");
  const opts = {
    producer,
    onError,
    encoder
  };
  const payload = { test: true };
  const loggerInstance = new SQSLogger(opts);

  producer.send.callsArgWith(1, producerError);
  encoder.encode.returns("encodedSpan");

  loggerInstance.logSpan(payload);

  t.is(producer.send.callCount, 1);
  t.is(onError.callCount, 1);
  t.is(onError.getCall(0).args[0], producerError);

  t.end();
});

test("calls error with unexpected error", t => {
  setup();
  t.plan(3);

  const unexpectedError = new Error("unexpected");
  const opts = {
    producer,
    onError,
    encoder
  };
  const payload = { test: true };
  const loggerInstance = new SQSLogger(opts);

  producer.send.throws(unexpectedError);
  encoder.encode.returns("encodedSpan");

  loggerInstance.logSpan(payload);

  t.is(producer.send.callCount, 1);
  t.is(onError.callCount, 1);
  t.is(onError.getCall(0).args[0], unexpectedError);

  t.end();
});

test("successfully send message", t => {
  setup();
  t.plan(2);

  const opts = {
    producer,
    onError,
    encoder
  };
  const payload = { test: true };
  const loggerInstance = new SQSLogger(opts);

  producer.send.callsArg(1, null);
  encoder.encode.returns("encodedSpan");

  loggerInstance.logSpan(payload);

  t.is(producer.send.callCount, 1);
  t.is(onError.callCount, 0);

  t.end();
});
