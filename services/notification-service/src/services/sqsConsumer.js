const {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand
} = require("@aws-sdk/client-sqs");

const notificationService = require("./notificationService");

const queueUrl = process.env.NOTIFICATION_EVENTS_QUEUE_URL;
const pollIntervalMs = Number(process.env.SQS_POLL_INTERVAL_MS || 5000);

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || "us-east-1"
});

const parseMessageBody = (body) => {
  const parsed = JSON.parse(body);

  if (parsed.Message) {
    return JSON.parse(parsed.Message);
  }

  return parsed;
};

const processMessage = async (message) => {
  const event = parseMessageBody(message.Body);

  await notificationService.createNotification({
    user_id: event.user_id,
    type: event.type,
    message: event.message,
    order_id: event.order_id
  });

  await sqsClient.send(
    new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: message.ReceiptHandle
    })
  );
};

const pollQueue = async () => {
  if (!queueUrl) {
    return;
  }

  try {
    const response = await sqsClient.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 5,
        WaitTimeSeconds: 10,
        VisibilityTimeout: 60
      })
    );

    const messages = response.Messages || [];

    for (const message of messages) {
      await processMessage(message);
    }
  } catch (error) {
    console.error("SQS notification polling failed:", error.message);
  }
};

const startSqsConsumer = () => {
  if (!queueUrl) {
    console.log("SQS queue URL not configured; HTTP notification mode enabled");
    return;
  }

  console.log("SQS notification consumer started");
  pollQueue();
  setInterval(pollQueue, pollIntervalMs);
};

module.exports = {
  startSqsConsumer
};
