const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value) {
            if (value.toLowerCase().match(/^password$/)) {
                throw new Error("Invalid password")
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error("Age must be a positive number")
            }
        }
    },
    tokens : [{
        token: {
            type: String,
            required: false
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// You can use on "User" (Model)
userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({ email })
    if (!user) throw new Error('Unable to login')

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new Error('Unable to login')

    return user

}

// You can use on "user"
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
        expiresIn: '10 hours'
    })

    user.tokens = user.tokens.concat({
        token
    })
    await user.save()

    return token
}

userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject

}

// Hash the plain text password before saving
userSchema.pre('save', async function(next) {
    console.log('Começo pre-save usuário\n')
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    console.log('Fim pre-save usuário\n')
    next()
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function(next) {
    const user = this

    await Task.deleteMany({
        owner: user._id
    })

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
