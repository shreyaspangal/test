const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema(
  {
    BANK: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    IFSC: {
      type: String,
      required: true,
      trim: true,
    },
    BRANCH: {
      type: String,
      required: true,
      trim: true,
    },
    ADDRESS: {
      type: String,
      required: true,
      trim: true,
    },
    CITY1: {
      type: String,
      required: true,
      trim: true,
    },
    CITY2: {
      type: String,
      required: true,
      trim: true,
    },
    STATE: {
      type: String,
      required: true,
      trim: true,
    },
    "STD CODE": {
      type: String,
      required: true,
      trim: true,
    },
    PHONE: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: false,
  }
);

/**
 * @typedef Product
 */
const BankModel = mongoose.model("Bank_details", bankSchema);

module.exports = BankModel;
// module.exports.bankSchema = bankSchema;
