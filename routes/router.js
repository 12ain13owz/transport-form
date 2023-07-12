const express = require("express");
const router = express.Router();
const controller = require("../controllers/transport.controller");

router.post("/create", controller.createOrder);
router.put("/update", controller.updateOrder);
router.delete("/delete/:id", controller.deleteOrder);

router.post("/excel", controller.getExcel);
router.post("/word", controller.getWord);
router.post("/report", controller.getReport);

router.get("/shop", controller.getShop);
router.get("/allshop", controller.getAllShop);
router.post("/shop", controller.createShop);
router.put("/shop", controller.updateShop);

router.get("/index/:date/:shop", controller.getIndex);
router.get("/all", controller.getAllOrder);
router.get("/id/:id", controller.getOrderByID);

router.get("/table", controller.updateTable);

router.get("*", (req, res) => {
  res.status(404).send({ message: "Not Found! Error 404." });
});

module.exports = router;
