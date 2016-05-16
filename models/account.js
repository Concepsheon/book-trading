var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var Schema = mongoose.Schema;

var Account = new Schema({
    full_name: String,
    city: String,
    state: String
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model("Account", Account);