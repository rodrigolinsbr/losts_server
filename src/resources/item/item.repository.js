const mongoose = require("mongoose");
const Item = mongoose.model("Item");
const bcrypt = require("bcryptjs");

exports.findAdminByEmail = async email => {
  try {
    data = await Item.findOne({ email: email, isDeleted: false });
    return data;
  } catch (e) {
    throw new Error(e);
  }
};

exports.findAdminByToken = async token => {
  try {
    data = await Item.findOne({
      "auth.access_token": token
    });
    return data;
  } catch (e) {
    throw new Error(e);
  }
};

exports.findAdminByEmailIsActive = async email => {
  try {
    data = await Item.findOne({ email: email, isDeleted: false });
    return data;
  } catch (e) {
    throw new Error(e);
  }
};

exports.itemCreate = async item => {
  try {
    
    data = await Item.create(item);
    return data;
  } catch (e) {
    throw new Error(e);
  }
};

exports.bcryptSave = async (adminId, password) => {
  try {
    data = await Item.updateOne(
      { _id: adminId },
      { password: bcrypt.hashSync(password, 10) }
    );
    return data;
  } catch (e) {
    throw new Error(e);
  }
};

exports.adminDisable = async adminId => {
  try {
    data = await Item.updateOne({ _id: adminId }, { isDeleted: true });
    console.log("repository" + data);
    return data;
  } catch (e) {
    throw new Error(e);
  }
};

exports.adminSave = async admin => {
  try {
    console.log("saving");
    data = await Item.save();
    console.log("repository save" + data);
    return data;
  } catch (e) {
    throw new Error(e);
  }
};

// exports.adminPermissionEdit = async (acess_token) => {
//     try {
//         console.log("saving")

//         data = await Item.findOne({ email: email });
//         if(data.access_level.isRoot === true || data.access_level.state != "" ){

//         }
//         console.log("repository save"+data)
//         return data
//     } catch (e) {
//         throw new Error(e);
//     }
// };

exports.adminGetAll = async (pagelimit,page) => {  
  
  try {
    let data = await Item.find({isDeleted:false}).skip(page>0 ?((page-1)*pagelimit):0).
    limit(pagelimit);    
    
    return data;
  } catch (e) {
    throw new Error(e);
  }
};

exports.adminGetAllRegion = async () => {
  try {
    let data = await Item.find({
      "access_level.state": "", isDeleted:false
    }).count();

    return data;
  } catch (e) {
    throw new Error(e);
  }
};

exports.adminGetAllStates = async () => {
  try {
    let data = await Item.find({
      "access_level.state": {$ne : ""} , isDeleted:false
    }).count();

    return data;
  } catch (e) {
    throw new Error(e);
  }
};

exports.updateAdminPassword = async (id, newPassword) => {
  try {
    let data = await Item.updateOne(
      { _id: id }, //find criteria
      { $set: 
        { password: newPassword }
      });
    return data;
  } catch (e) {
    throw new Error(e);
  }
}
