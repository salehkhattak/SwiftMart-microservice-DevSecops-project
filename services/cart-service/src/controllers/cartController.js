const cartService =
require("../services/cartService");

const addToCart =
async (req, res) => {

  try {

    const result =
    await cartService.addToCart(
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

const getCart =
async (req, res) => {

  try {

    const result =
    await cartService.getCart(
      req.user.userId
    );

    res.status(200).json(result);

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

const updateCartItem =
async (req, res) => {

  try {

    const result =
    await cartService.updateCartItem(
      req.user.userId,
      req.params.itemId,
      req.body.quantity
    );

    res.status(200).json(result);

  } catch (error) {

    res.status(404).json({
      success: false,
      message: error.message
    });

  }

};

const deleteCartItem =
async (req, res) => {

  try {

    const result =
    await cartService.deleteCartItem(
      req.user.userId,
      req.params.itemId
    );

    res.status(200).json(result);

  } catch (error) {

    res.status(404).json({
      success: false,
      message: error.message
    });

  }

};

const clearCart =
async (req, res) => {

  try {

    const result =
    await cartService.clearCart(
      req.user.userId
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
  addToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
  clearCart
};
