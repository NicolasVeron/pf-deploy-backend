const express = require("express");
const Order = require("./../models/orderModel");
const asyncHandler = require("express-async-handler");

const orderRouter = express.Router();

//

exports.getAllOrders = async (req, res) => {
  //La función callback se llama Route Handler
  try {
    //EXECUTE THE QUERY
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: "i" } }
      : {};
    const orders = await Order.find({ ...keyword }).populate("user"); //esto va a devolver una promesa, por eso usamos await

    //SEND RESPONSE
    res.status(203).json({
      status: "success",
      results: orders.length,
      data: { orders },
    });
  } catch (err) {
    res.status(404).json({ status: "fail", message: err });
  }
};

//CREATE ORDER

exports.createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    userId,
    userEmail
  } = req.body;
  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  } else {
    const order = new Order({
      orderItems,
      user: userId,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });
    const createOrder = await order.save();

    const mappedOrderItems = orderItems.reduce((a, b) => {
      return a + '<tr><td>' + b.name + '</td><td>' + b.qty + '</td><td>' + b.price + '</td></tr>';
    })

    const subject = "Orden de compra - Fashion Clothing"
    const send_to = userEmail
    const sent_from = process.env.EMAIL_USER
    const message = `
    <h1><strong>Tu compra en Fashion Clothing se ha efectuado con exito</strong></h1>

    <h2>Tus datos de compra son...</h2>

    <div>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Cantidad</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
        ${mappedOrderItems}
        </tbody>
      </table>
    </div>

    <h2>Con un total de $${totalPrice}</h2>
    
    <p>- Fashion Cloth Mode</p>`

    await sendEmail(subject, message, send_to, sent_from);

    res.status(201).json(createOrder);
  }
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "fullName email"
  );
  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

exports.updateOrder = async (request, response) => {

  const order = await Order.findById(request.body.orderId);

  if (order) {
    try {
      const { isPaid, isDelivered } = order;
      order.isPaid = request.body.isPaid || isPaid
      order.isDelivered = request.body.isDelivered || isDelivered;

      const updatedOrder = await order.save();

      response.status(200).json({
        message: "Order Update Succesfully",
        isPaid: updatedOrder.isPaid,
        isDelivered: updatedOrder.isDelivered,
      })
    } catch (e) {
      response.status(400).json({ message: e })
    }
  } else {
    response.status(400).json({ message: "No user" })
  }
}