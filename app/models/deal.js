var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var dealSchema = mongoose.Schema({
    score : {
        type : Number,
        required: true,
        default : 0
    },
    title : String,
    tags : [],
    keywords : [],
    comments : [],
    user : String,
    url : {
        type: String,
        required : false
    },
    
    upVotes : {
        type : Number,
        required: true,
        default : 0
    },
    downVotes : {
        type : Number,
        required: true,
        default : 0
    },
    updated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Deal', dealSchema);