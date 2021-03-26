const mongoose = require('mongoose');
const trensferSchema = new mongoose.Schema({
    amount: {
    type: String,
    require: [true, 'merci de saisir  le montent .']
  },
  currency : {
      type:String,
      require:[true,'merci de saisir votre currency']
  },
  externalId: {
      type:Number,
      require:[true,'merci de saisir votre telephone'],
      unique:true
  },
  payee : {
    partyIdType: {
        type:String,
        require:[true],
        default:'MSISDN',
    },
    partyId:{
        type:Number,
        require:[true],
        unique:true
    }

  },
  payerMessage : {
      type:String,
      require:[true],

  },
  payeeNote : {
      type:String,
      require:[true]

  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
 
});

const Trensfer = mongoose.model('Trensfer', trensferSchema);

module.exports = Trensfer;
