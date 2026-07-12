const orderService =
require("../services/orderService");

const createOrder =
async (req, res) => {

  try {

    const result =
    await orderService.createOrder(
      req.user.userId,
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

const getOrders =
async (req, res) => {

  try {

    const result =
    await orderService.getOrders(req.user);

    res.status(200).json(result);

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

const getOrderById =
async (req, res) => {

  try {

    const result =
    await orderService.getOrderById(
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

const updateOrderStatus =
async (req, res) => {

  try {

    const result =
    await orderService.updateOrderStatus(
      req.params.id,
      req.body.status
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
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
};
