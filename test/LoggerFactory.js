const test = require("tape");
const proxyquire = require("proxyquire").noCallThru();
const sinon = require("sinon");

const fakeSts = {
  assumeRole: sinon.stub()
};
const fakeAws = {
  STS: function() {
    return fakeSts;
  }
};
const fakeProducer = {
  create: sinon.stub()
};

const LoggerFactory = proxyquire("../lib/LoggerFactory", {
  "aws-sdk": fakeAws,
  "sqs-producer": fakeProducer
});
const SQSLogger = require("../lib/SQSLogger");

function setup() {
  sinon.reset();
}

test("fail to construct a logger missing required sqs options", t => {
  t.plan(2);
  setup();

  const producerError = new Error("producer error");
  fakeProducer.create.throws(producerError);

  const opts = {};
  LoggerFactory.createLogger(opts, (error, logger) => {
    t.is(fakeProducer.create.callCount, 1);
    t.is(error, producerError);
    t.end();
  });
});

test("fail to construct a logger missing required aws options", t => {
  t.plan(2);
  setup();

  const assumeError = new Error("assume error");
  fakeSts.assumeRole.callsArgWith(1, assumeError);

  const opts = {
    onError: () => {},
    assumeRole: {},
    sqs: {
      queueUrl: "url"
    }
  };
  const loggerInstance = LoggerFactory.createLogger(opts, (error, logger) => {
    t.is(error, assumeError);
    t.is(fakeProducer.create.callCount, 0);

    t.end();
  });
});

test("construct a logger default options", t => {
  t.plan(2);
  setup();

  const producerInstance = {};
  fakeProducer.create.returns(producerInstance);

  const opts = {
    onError: () => {},
    sqs: {
      queueUrl: "https://sqs.eu-west-1.amazonaws.com/account-id/queue-name"
    }
  };
  LoggerFactory.createLogger(opts, (error, logger) => {
    t.is(error, null);
    t.is(logger instanceof SQSLogger, true);
    t.end();
  });
});

test.skip("construct a logger and assume role", t => {
  t.plan(1);

  const opts = {
    onError: () => {},
    assumeRole: {
      RoleArn: "arn:aws:iam::123456789012:role/demo",
      RoleSessionName: "Bob"
    },
    sqs: {
      queueUrl: "https://sqs.eu-west-1.amazonaws.com/account-id/queue-name"
    }
  };
  const loggerInstance = LoggerFactory.createLogger(opts, (error, logger) => {
    t.is(error.code, "AccessDenied");
    t.end();
  });
});
