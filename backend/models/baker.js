const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BakerSchema = new Schema({
  confirmedOrder: {type: Array},
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
  },
});

// Export model
const Baker = mongoose.model("Baker", BakerSchema);

module.exports = Baker;
