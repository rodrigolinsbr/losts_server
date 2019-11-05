const mongoose = require("mongoose");
const PasswordRecover = mongoose.model("PasswordRecover");


exports.saveToken = async passwordRecover => {
    try {
        data = await PasswordRecover.create(passwordRecover);
        console.log('the token was addicted to black list');
        return data;
    } catch (e) {
        throw new Error(e);
    }
};  

exports.getOneToken = async token => {
    try {
        data = await PasswordRecover.find({token: token});
        return data;
    } catch (e) {
        throw new Error(e);
    }
};  

exports.getAllTokens = async () => {
    try {
        data = await PasswordRecover.find();
        return data;
    } catch (e) {
        throw new Error(e);
    }
}; 





  