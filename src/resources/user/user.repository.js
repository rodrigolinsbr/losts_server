const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");

exports.findUserByEmail = async email => {
  try {
    data = await User.findOne({ email: email });
    return data;
  } catch (e) {
    throw new Error(e);
  }
};

exports.findUserByEmailIsActive = async email => {
  try {
    data = await User.findOne({ email: email, isDeleted: false });
    return data;
  } catch (e) {
    throw new Error(e);
  }
};
exports.userCreate = async user => {
  try {
    data = await User.create(user);
    return data;
  } catch (e) {
    throw new Error(e);
  }
};

exports.bcryptSave = async (userId, password) => {
  try {
    data = await User.updateOne(
      { _id: userId },
      { password: bcrypt.hashSync(password, 10) }
    );
    return data;
  } catch (e) {
    throw new Error(e);
  }
};

exports.userDisable = async userId => {
  try {
    data = await User.updateOne({ _id: userId }, { isDeleted: true });
    console.log("repository" + data);
    return data;
  } catch (e) {
    throw new Error(e);
  }
};

exports.userGetAll = async (limit,page) => {
  try {
    let data = await User.find({isDeleted: false}).skip(page>0 ?((page-1)*limit):0).
    limit(limit);
    return data;
  } catch (e) {
    throw new Error(e);
  }
};

exports.userGetAllCount = async () => {
  try {
    let data = await User.countDocuments({isDeleted: false});
    return data;
  } catch (e) {
    throw new Error(e);
  }
};

exports.userGetAllCountSituation = async (situation) => {
  try {
    let data = await User.countDocuments({situation: situation, isDeleted: false });
    return data;
  } catch (e) {
    throw new Error(e);
  }
};

exports.updateUserPassword = async (id, newPassword) => {
  try {
    let data = await User.updateOne(
      { _id: id, isDeleted: false }, //find criteria
      { $set: 
        { password: newPassword }
      });
    return data;
  } catch (e) {
    throw new Error(e);
  }
}
