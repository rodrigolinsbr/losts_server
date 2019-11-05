const uuid = require("uuid/v4");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const UserRepository = require("./user.repository");
const status = require("http-status");
const bcrypt = require("bcryptjs");

async function checkUser(username, access_token) {
  let result = {
    authorized: false,
    isActive: false
  };

  try {
    // let user = await User.findOne({ email: username });
    let user = await UserRepository.findUserByEmail(username);

    if (user) {
      result.isActive = user.isActive;
    }
    if (user && user.isActive && user.auth.access_token === access_token) {
      result.authorized = true;
    }

    return result;
  } catch (err) {
    return result;
  }
}

module.exports = {
  async new(req, res) {
    let messages = [], user;
    let statusCode = status.INTERNAL_SERVER_ERROR;

    try {
      
      let userExists = await UserRepository.findUserByEmailIsActive(req.body.email);

      if (!userExists) { //se o usuário não existe, é feito o seu registro no sistema
        user = await User.create(req.body);
        await UserRepository.bcryptSave(user._id, req.body.password);
        
        user.password = undefined;

        messages.push(status["200_MESSAGE"]);
        statusCode = status.OK;
      } else {
        user.password = undefined;
        user.auth = undefined;
        user._id = undefined;
        user.isActive = undefined;

        messages.push(status["409_MESSAGE"]);
        statusCode = status.CONFLICT;
      }

      return res.status(statusCode).json({ result: user, messages });
    } catch (err) {
      return res.status(statusCode).json({ result: err, message: status["500_MESSAGE"]});
    }
  },

  async update(req, res) {
    let messages = [];
    let result = {};
    let statusCode = status.INTERNAL_SERVER_ERROR;
    let { username, access_token } = req.headers;
    let { email, name, old_password, password, situation, phone, cpf } = req.body;
    console.log(req.body)
    console.log(req.params.id)
    
    try {
      
      // const { authorized } = await checkUser(username, access_token);
      const authorized = true

      if (authorized && req.params.id) {
        if (name)
          result = await User.updateOne(
            { _id: req.params.id },
            { name: req.body.name }
          );

        if (phone)
          result = await User.updateOne(
            { _id: req.params.id },
            { phone: req.body.phone }
          );

        if (email)
          result = await User.updateOne(
            { _id: req.params.id },
            { email: req.body.email }
          );

        if (situation)
          result = await User.updateOne(
            { _id: req.params.id },
            { situation: req.body.situation }
          );

        if (cpf)
          result = await User.updateOne(
            { _id: req.params.id },
            { cpf: req.body.cpf }
          );        
        if (password)
          
          result = await User.updateOne(
            { _id: req.params.id },
            { password: bcrypt.hashSync(req.body.password, 10) }
          );

        if (result && result.nModified > 0) {
          messages.push(status["200_MESSAGE"]);
          statusCode = status.OK;
        } else if (result && result.n === 0) {
          messages.push(status["404_MESSAGE"]);
          statusCode = status.OK;
        } else if (!result || result.n > 0 || result.nModified === 0) {
          messages.push(status["400_MESSAGE"]);
          statusCode = status.BAD_REQUEST;
        }
      } else {
        messages.push(status["401_MESSAGE"]);
        statusCode = status.UNAUTHORIZED;
      }
      return res.status(statusCode).json({result: result, messages});
    } catch (err) {
      return res.status(statusCode).json({result: err, message: status["500_MESSAGE"]});
    }
  },

  async delete(req, res) {
    let messages = [];
    let result = {};
    let statusCode = status.INTERNAL_SERVER_ERROR;
    let { username, access_token } = req.headers;

    try {
      //const { authorized } = await checkUser(username, access_token);
      const authorized = true;
      console.log(req.params.id);
      if (authorized && req.params.id) {
        result = await UserRepository.userDisable(req.params.id);
        // result = await User.updateOne(
        //   { _id: req.params.id },
        //   { isActive: false }
        // );

        if (result && result.nModified > 0) {
          messages.push(status["200_MESSAGE"]);
          statusCode = status.OK;
        } else if (result && result.n === 0) {
          messages.push(status["404_MESSAGE"]);
          statusCode = status.NOT_FOUND;
        } else if (!result || result.n > 0 || result.nModified === 0) {
          messages.push(status["400_MESSAGE"]);
          statusCode = status.BAD_REQUEST;
        }
      } else {
        messages.push(status["401_MESSAGE"]);
        statusCode = status.UNAUTHORIZED;
      }
      return res.status(statusCode).json({ result: result, messages });
    } catch (err) {
      return res.status(statusCode).json({ result: err, message: status["500_MESSAGE"] });
    }
  },

  async auth(req, res) {
    let result = {};
    let { email, password } = req.body;
    try {
      
      let user = await UserRepository.findUserByEmailIsActive(email);
      if (user && bcrypt.compareSync(password, user.password)) {
        let lifetime = Date.now();
        lifetime += 60 * 60 * 1000; // Add 1 hour

        result = {
          auth: {
            access_token: uuid(),
            _id: user._id,
            username: user.name,
            email: user.email,
            cpf: user.cpf,
            phone: user.phone
          }
        };

        user.auth = result.auth;
        await user.save();
        return res.status(status.OK).json({result, message: status["200_MESSAGE"]});
      }else{
        return res.status(status.UNAUTHORIZED).json({result, message: status["401_MESSAGE"]});
      }
    } catch (err) {
      return res.status(status.INTERNAL_SERVER_ERROR).json({result: err, message: status["500_MESSAGE"]});
    }
  },

  async getAll(req, res) {
    let result = {};
    let { name, access_token } = req.headers;
    console.log(req.headers);

    try {
      
      let user = await UserRepository.findUserByEmailIsActive(name);
      console.log(user);
      name = true;
      if (name) {       
     

        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);

        if (page > 0 && limit > 0) {
        } else {
          const limit = 50;
          const page = 1;
        }
        
        let all = await UserRepository.userGetAll(limit, page);
        let totalAll = await UserRepository.userGetAllCount();
        let totalActive = await UserRepository.userGetAllCountSituation("active");
        let totalInactive = totalAll - totalActive
        
        result = {
         all, totalAll, totalActive, totalInactive
        };
        
        //user.auth = result.auth;

        //await user.save();
        return res.status(status.OK).json({result, message: status["200_MESSAGE"]});
      } 
      return res.status(status.UNAUTHORIZED).json({result, message: status["401_MESSAGE"]});
    } catch (err) {
      return res.status(status.INTERNAL_SERVER_ERROR).json({result: err, message: status["500_MESSAGE"]});
    }
  },

  async genToken(req, res) {
    let result = {};
    let { email, password } = req.headers;

    try {
      let user = await User.findOne({ email, isDeleted: false });

      if (user && bcrypt.compareSync(password, user.password)) {
        let lifetime = Date.now();
        lifetime += 60 * 60 * 1000; // Add 1 hour

        result = {
          auth: {
            access_token: uuid(),
            refresh_token: uuid(),
            lifetime: new Date(lifetime)
          }
        };

        user.auth = result.auth;

        await user.save();
        return res.status(status.OK).json({result, message: status["200_MESSAGE"]});
      } else{
        return res.status(status.UNAUTHORIZED).json({result, message: status["401_MESSAGE"]});
      }
    } catch (err) {
      return res.status(status.INTERNAL_SERVER_ERROR).json({result, message: status["500_MESSAGE"]});
    }
  },

  async checkToken(req, res) {
    let result = {};
    let { username, access_token } = req.headers;

    try {
      const { authorized } = await checkUser(username, access_token);

      result = { authorized };

      if (authorized) {
        return res.status(status.OK).json({result, message: status["200_MESSAGE"]});
      } else{
        return res.status(status.UNAUTHORIZED).json({result, message: status["401_MESSAGE"]});
      }
    } catch (err) {
      return res.status(status.INTERNAL_SERVER_ERROR).json({result, message: status["500_MESSAGE"]});
    }
  },

  async getUser(req, res) {
		let result = {};
		let { access_token } = req.headers;

		try {
			let user = await User.findOne({ _id: req.params.id });
			// console.log(user);

			// if (fancy_name && user.auth.access_token === access_token) {
			if (user) {
				result = user;
				return res.status(status.OK).json({result, message: status["200_MESSAGE"]});
			}else{
				return res.status(status.UNAUTHORIZED).json({result, message: status["401_MESSAGE"]});
			}
		} catch (err) {
			return res.status(status.INTERNAL_SERVER_ERROR).json({result: err, message: status["500_MESSAGE"]});
		}
  	}
};
