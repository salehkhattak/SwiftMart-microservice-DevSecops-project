const notificationService =
require("../services/notificationService");

const createNotification =
async (req, res) => {

  try {

    const result =
    await notificationService.createNotification(
      req.body
    );

    res.status(201).json(result);

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }

};

// const getNotifications =
// async (req, res) => {

//   try {

//     const result =
//     await notificationService.getNotifications();

//     res.status(200).json(result);

//   } catch (error) {

//     res.status(500).json({
//       success: false,
//       message: error.message
//     });

//   }

// };

const getNotificationsByUser = async (req, res) => {
  try {
    const requestedUserId =
      req.params.userId || req.user.userId;

    if (
      req.user.role !== "admin" &&
      Number(requestedUserId) !== Number(req.user.userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own notifications"
      });
    }

    const result = await notificationService.getNotificationsByUser(
      requestedUserId
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getNotificationById =
async (req, res) => {

  try {

    const result =
    await notificationService.getNotificationById(
      req.user,
      req.params.id
    );

    res.status(200).json(result);

  } catch (error) {

    res.status(404).json({
      success: false,
      message: error.message
    });

  }

};

const deleteNotification =
async (req, res) => {

  try {

    const result =
    await notificationService.deleteNotification(
      req.user,
      req.params.id
    );

    res.status(200).json(result);

  } catch (error) {

    res.status(404).json({
      success: false,
      message: error.message
    });

  }

};

module.exports = {
//   createNotification,
//   getNotifications,
//   getNotificationById,
//   deleteNotification,
//   getNotificationsByUser
    createNotification,
    getNotificationsByUser,
    getNotificationById,
    deleteNotification
};
