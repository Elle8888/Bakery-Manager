const BatchOrder = require("../models/BatchOrder");
const Order = require("../models/order");
const TokenGenerator = require("../models/token_generator");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Item = require("../models/item");

const OrdersController = {
  getAll: (req, res) => {
    Order.find({userId: req.user_id})
    .exec((err, orders) => {
      const token = TokenGenerator.jsonwebtoken(req.user_id);
      if(err) return res.status(400).send(err);
      res.status(200).json({ orders: orders, token: token });
    })
  },
  createOrder: (req, res) => {
    User.find({_id: req.user_id }, function (err, docs)
    {
      if (err) {
        throw err;
      }
    })
    // console.log("POST ORDER")
    console.log(req.body)
    const order = new Order({userId: req.user_id, company: req.body.company, order: req.body.order
      // date_of_order: req.body.date_of_order, date_required: req.body.date_required 
    });
    // console.log("NEW ORDER: ", order)
    order.save(async (err) => {
      if (err) {
        throw err;
      }
      Order.find(async (err, orders) => {
        if (err){
          throw err;
        }
        const token = await TokenGenerator.jsonwebtoken(req.user_id);
        res.status(201).json({ message: "OK", order: order, token: token});
      })
      
      // const allOrders = await Order.find()
      // res.status(201).json({Order: allOrders, token: token});
    }
  )},
  addBatch: async (req, res) => {
    const orderID = req.params.orderID
    const orderRef = orderID;
    const batchOrder = new BatchOrder(req.body);
    batchOrder.save();
    
    await Order.findByIdAndUpdate(orderRef, { $push: { orders: batchOrder } });
    
    res.status(201).json({batchOrder: batchOrder})
  },
  getBatch: async (req,res) => {
    const filter = { _id: req.params.batchID };
    const batch = await BatchOrder.find(filter)
    // console.log("batch: ", batch)
    res.json(batch)
    
  },
  getBasketInfoByID: async (req,res) => {
    const filter = { _id: req.params.orderID };
    //Firstly filter the through the orders DB.
    //Then populate the variable 'batchOrders' with all in info in the orders field 
    const batchOrders = await Order.find(filter).populate('orders').exec()
    res.status(200).json(batchOrders)
  },
  getOrderByID: async (req, res) => {
    const orderID = req.params.orderID;
    let order = await Order.findById(orderID)
    // console.log("ORDER:", order)
    res.status(200).json(order)

  },
  getOrderByIDFilled: async (req, res) => {
    const orderID = req.params.orderID;
    let order = await Order.findById(orderID).populate('orders').exec()
    // const entries = await Entry.find().populate('corrections').exec()
    console.log("ORDER:", order)
    res.status(200).json(order)

  },
  deleteBatchByID: async (req, res) => {
    const orderID = req.body.orderID;

    let order = await Order.findById(orderID)
    // console.log("ORDER:", order)
    const filter = { _id: orderID};

    //Remove batch from the orders array in Order DB
    console.log("ORDER TO UPDATE: ",order)
    const previousBatchOrders = order.orders;
    console.log("PREVIOUS BATCH ORDERS",previousBatchOrders)
    const newBatchOrders = previousBatchOrders.remove(req.params.batchID)
    console.log("NEW BATCH ORDERS", newBatchOrders)
    const update = { orders: newBatchOrders };
    await Order.findOneAndUpdate(filter, update);
    
    //Remove batch order from BatchOrder DB
    await BatchOrder.deleteOne({ _id: req.params.batchID})
    console.log("Batches in Order", order.orders)
    res.status(201).json(order)
  },
  updateOrder: async(req, res) => {
    User.find({_id: req.user_id }, function (err)
    {
      if (err) {
        throw err;
      }
      const token = TokenGenerator.jsonwebtoken(req.user_id);
      res.status(201).json({ message: "OK", token: token});
    })
    const filter = { _id: req.params.order_id};
    const update = { date_of_order: new Date, date_required: req.body.date_required }
    await Order.findByIdAndUpdate( req.params.order_id, update);
    const order = await Order.find(filter)
    return order
  },
  updateOrderPrice:async(req, res) => {
    const filter = { _id: req.params.order_id};
    const update = { totalPrice:  req.body.totalPrice}
    await Order.findByIdAndUpdate( req.params.order_id, update);
    const order = await Order.find(filter)
    res.status(202).json(order);
  }
}




module.exports = OrdersController