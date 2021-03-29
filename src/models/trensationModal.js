const mongoose = require('mongoose');
const validator = require('validator');

const trensferSchema = new mongoose.Schema({
    amount: {
        type: String,
        require: [true, 'merci de saisir  le montent .']
    },
    currency: {
        type: String,
        require: [true, 'merci de saisir votre currency']
    },
    externalId: {
        type: Number,
        require: [true, 'merci de saisir votre telephone'],
        unique: true,
        maxlength: 8,
        minlength: 8,
        validate: {
            validator: function (el) {
                return el.toString().length === 8;
            },
            message: 'le numéro doit etre 8 caractères'
        }

    },
    payee: {
        partyIdType: {
            type: String,
            require: [true],
            default: 'MSISDN',
        },
        partyId: {
            type: Number,
            require: [true],
            unique: true,
            maxlength: 8,
            minlength: 8,
            validate: {
                validator: function (el) {
                    return el.toString().length === 8;

                },
                message: 'le numéro doit etre 8 caractères'
            }

        }

    },
    payerMessage: {
        type: String,
        require: [true],

    },
    payeeNote: {
        type: String,
        require: [true]

    },
    createdAt: {
        type: Date,
        default: Date.now()
    },

});

const Trensfer = mongoose.model('Trensfer', trensferSchema);

module.exports = Trensfer;
