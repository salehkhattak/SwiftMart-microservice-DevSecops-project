const express = require("express");

const router = express.Router();


const {
    getCategories,
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");


router.put("/:id", updateProduct);

router.get("/", getProducts);

router.get("/categories", getCategories);

router.get("/:id", getProductById);

router.post("/", createProduct);

router.delete("/:id", deleteProduct);

module.exports = router;


