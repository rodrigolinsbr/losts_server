const uuid = require("uuid/v4");
const bcrypt = require("bcryptjs");
const ItemRepository = require("./item.repository");
const mongoose = require("mongoose");
const Item = mongoose.model("Item");
const status = require("http-status");

async function checkUser(username, access_token) {
  let result = {
    authorized: false,
    isActive: false
  };

  try {
    let user = await ItemRepository.findAdminByEmail(username);

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
    try {
      let user = await ItemRepository.findAdminByEmailIsActive(req.body.email);

      if (!user) {
        console.log(req.body);
        let user = await ItemRepository.adminCreate(req.body);

        // necessario gerar token
        let password = "123456@Aa";

        await ItemRepository.bcryptSave(user._id, password);

        user.password = undefined;

        res.status(status.CREATED).json({ message: status["200_MESSAGE"] });

        console.log(user);
      } else {
        user.password = undefined;
        user.auth = undefined;
        user.isActive = undefined;
        user._id = undefined;
        res.status(status.CONFLICT).json({ message: status["409_MESSAGE"] });
      }
    } catch (err) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json({ result: err, message: status["500_MESSAGE"] });
    }
  },

  async update(req, res) {
    let messages = [];
    let result = {};
    let statusCode = status.INTERNAL_SERVER_ERROR;
    let { username, access_token } = req.headers;

    let {
      email,
      name,
      phone,
      cpf,      
      password,
      access_level,
      situation
    } = req.body;    
    
    try {
      if (true) {
        //autorization amazon        
        if (name) {
          result = await Admin.updateOne(
            { _id: req.params.id },
            { name: req.body.name }
          );
        }
        if (password){
          result = await Admin.updateOne(
            { _id: req.params.id },
            { password: bcrypt.hashSync(req.body.password, 10) }
          );
        }

        if (access_level) {
          result = await Admin.updateOne(
            { _id: req.params.id },
            { access_level: req.body.access_level }
          );
        }

        if (phone) {
          result = await Admin.updateOne(
            { _id: req.params.id },
            { phone: phone }
          );
        }
        if (cpf) {
          result = await Admin.updateOne(
            { _id: req.params.id },
            { cpf: req.body.cpf }
          );
        }
        if (situation) {
          result = await Admin.updateOne(
            { _id: req.params.id },
            { situation: req.body.situation }
          );
        }
        if (email) {
          result = await Admin.updateOne(
            { _id: req.params.id },
            { email: req.body.email }
          );
        }
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
      return res.status(statusCode).json({ result, messages });
    } catch (err) {
      return res
        .status(statusCode)
        .json({ result: err, message: status["500_MESSAGE"] });
    }
  },

  async delete(req, res) {
    let messages = [];
    let result = {};
    let statusCode = status.INTERNAL_SERVER_ERROR;
    let { username, access_token } = req.headers;

    try {
      const { authorized } = await checkUser(username, access_token);

      if (true && req.params.id) {
        result = await ItemRepository.adminDisable(req.params.id);

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
      return res
        .status(statusCode)
        .json({ result: err, message: status["500_MESSAGE"] });
    }
  },

  async auth(req, res) {
    let result = {};
    let { email, password } = req.body;
    try {
      let admin = await ItemRepository.findAdminByEmailIsActive(email);
      console.log(admin.password);
      if (admin && bcrypt.compareSync(password, admin.password)) {
        let lifetime = Date.now();
        lifetime += 60 * 60 * 1000; // Add 1 hour
        result = {
          auth: {
            access_token: uuid(),
            _id: admin._id,
            username: admin.name,
            email: admin.email,
            cpf: admin.cpf
          }
        };
        admin.auth = result.auth;
        await ItemRepository.adminSave(admin);
        return res
          .status(status.OK)
          .json({ result, message: status["200_MESSAGE"] });
      } else {
        return res
          .status(status.UNAUTHORIZED)
          .json({ result, message: status["401_MESSAGE"] });
      }
    } catch (err) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json({ result: err, message: status["500_MESSAGE"] });
    }
  },

  async genToken(req, res) {
    let result = {};
    let { email, password } = req.headers;

    try {
      let user = await Admin.findOne({ email, isDeleted: false });

      if (user && bcrypt.compareSync(password, user.password)) {
        let lifetime = Date.now();
        lifetime += 60 * 60 * 1000; // Add 1 hour

        result = {
          auth: {
            access_token: uuid(),
            refresh_token: uuid(),
            lifetime: new Date(lifetime)
          },
          access_level: {
            is_root: [user.access_level.is_root],
            region: [user.access_level.region],
            state: [user.access_level.state],
            profile: [user.access_level.profile]
          }
        };

        user.auth = result.auth;

        await user.save();
        return res
          .status(status.OK)
          .json({ result, message: status["200_MESSAGE"] });
      } else {
        return res
          .status(status.UNAUTHORIZED)
          .json({ result, message: status["401_MESSAGE"] });
      }
    } catch (err) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json({ result: err, message: status["500_MESSAGE"] });
    }
  },

  async getAll(req, res) {
    let result = {};
    let { name, access_token } = req.headers;

    try {
      let user = await Admin.findOne({ name, isDeleted: false });

      if (true) {
        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);

        if (page > 0 && limit > 0) {
        } else {
          const limit = 50;
          const page = 1;
        }

        let all = await ItemRepository.adminGetAll(limit, page);
        let totalRegion = await ItemRepository.adminGetAllRegion();
        let totalState = await ItemRepository.adminGetAllStates();
        let totalAll = totalRegion + totalState;

        result = {
          all,
          totalRegion,
          totalState,
          totalAll
        };
        return res
          .status(status.OK)
          .json({ result, message: status["200_MESSAGE"] });
      } else {
        return res
          .status(status.UNAUTHORIZED)
          .json({ result, message: status["401_MESSAGE"] });
      }
    } catch (err) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json({ result: err, message: status["500_MESSAGE"] });
    }
  },

  async checkToken(req, res) {
    let result = {};
    let { username, access_token } = req.headers;
    try {
      const { authorized } = await checkUser(username, access_token);

      result = { authorized };

      if (authorized) {
        return res
          .status(status.OK)
          .json({ result, message: status["200_MESSAGE"] });
      } else {
        return res
          .status(status.UNAUTHORIZED)
          .json({ result, message: status["401_MESSAGE"] });
      }
    } catch (err) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json({ result: err, message: status["500_MESSAGE"] });
    }
  },
  async getAdmin(req, res) {
    let result = {};
    let { fancy_name, access_token } = req.headers;

    try {
      let user = await Admin.findOne({ _id: req.params.id });
      // console.log(user);

      // if (fancy_name && user.auth.access_token === access_token) {
      if (user) {
        result = user;
        return res
          .status(status.OK)
          .json({ result, message: status["200_MESSAGE"] });
      } else {
        return res
          .status(status.UNAUTHORIZED)
          .json({ result, message: status["401_MESSAGE"] });
      }
    } catch (err) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json({ result: err, message: status["500_MESSAGE"] });
    }
  }
};
