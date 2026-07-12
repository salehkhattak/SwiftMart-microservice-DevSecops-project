const axios = require("axios");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const snsClient = new SNSClient({
  region: process.env.AWS_REGION || "us-east-1"
});

const publishViaSns = async (event) => {
  await snsClient.send(
    new PublishCommand({
      TopicArn: process.env.ORDER_EVENTS_TOPIC_ARN,
      Message: JSON.stringify(event),
      MessageAttributes: {
        eventType: {
          DataType: "String",
          StringValue: event.eventType
        }
      }
    })
  );
};

const publishViaHttp = async (event) => {
  await axios.post(
    "http://notification-service:5005/api/notifications",
    {
      user_id: event.user_id,
      type: event.type,
      message: event.message,
      order_id: event.order_id
    },
    {
      headers: {
        "x-internal-service-token": process.env.INTERNAL_SERVICE_TOKEN
      }
    }
  );
};

const publishNotificationEvent = async (event) => {
  if (process.env.ORDER_EVENTS_TOPIC_ARN) {
    await publishViaSns(event);
    return;
  }

  await publishViaHttp(event);
};

module.exports = {
  publishNotificationEvent
};
