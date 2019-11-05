const express = require('express');
const app = express();

// require('../resources/admin/admin.model');
require('../resources/user/user.model');
require('../resources/item/item.model');
// require('../resources/util/passwordRecover/passwordRecover.model');

// const admin = require('../resources/admin/admin.routes');
const user = require('../resources/user/user.routes');
const item = require('../resources/item/item.routes');
// const storekeeper = require('../resources/storekeeper/storekeeper.routes');
// const passwordRecover = require('../resources/util/passwordRecover/passwordRecover.routes');

app.use(user);
app.use(item);
// app.use(admin);
// app.use(passwordRecover);

module.exports =  app








