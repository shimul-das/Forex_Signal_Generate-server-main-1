const mongooes = require('mongoose');

const userSchema = new mongooes.Schema({
    name: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        //required: true
      },
      photo: {
        type: String,
         required: true
      },
      email: {
        type: String,
        required: true,
        unique: true
      },
      password: {
        type: String,
        //required: true
      },
      role: {
        type: String,
        enum: ['user', 'admin','deliverymen'],
        default: 'user' 
      }
});

module.exports = userSchema;
