const { Schema, model } = require('mongoose')

const clientSchema = new Schema({
  email: {
    type: String,
    required: [true, "Email obligatorio"],
    match: [/^\S+@\S+\.\S+$/, "Dirección de correo inválida"],
    unique: true,
    lowercase: true,
    trim: true
  },
  name: String,
  passwordHash: {
    type: String,
    required: [true, "Contraseña obligatoria"]
  },
  address: {
    city: String,
    street: String,
    number: String
  },
  orders: [
    {
      type:Schema.Types.ObjectId,
      ref: "order"
    }
  ]
},
{
  timestamps: {
    createdAt: "createdAt",
    updatedAt: "updatedAt"
  }
}
)

module.exports = model("Client", clientSchema)