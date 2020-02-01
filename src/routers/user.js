const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account')

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb)  {
        // Reject
        // cb(new Error('Please upload an image'))
        // Accept
        // cb(undefined, true)
        // Ignore
        // cb(undefined, false)
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload a jpg|jpeg|png image'))
        }
        cb(undefined, true)
    }
})

router.post('/users', async (req, res) => {

    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({
            user,
            token
        })
    } catch (error) {
        res.status(400).send(error)
    }

})

router.post('/users/logout', auth, async (req, res) => {
    try {
        console.log('Entrou router post começo\n')
        req.user.tokens = req.user.tokens.filter(tokens => {
            return tokens.token !== req.token
        })
        await req.user.save()
        console.log('Terminou router post entrar send()\n')
        res.status(200).send(req.user)
        console.log('Fez send e acabou try\n')
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        if (!user) return res.status(404).send()
        const token = await user.generateAuthToken()
        res.status(200).send({
            user,
            token
        })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.status(200).send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) return res.status(400).send({ error: 'Invalid updates' })

    try {
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        //     new: true,
        //     runValidators: true
        // })
        // ************************** //
        // const user = await User.findById(req.params.id)
        if (!req.user) return res.status(404).send()
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        res.status(201).send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.params.id)
        // if (!user) return res.status(404).send({ error: 'Not found' })
        // res.status(200).send(user)
        sendGoodbyeEmail(req.user.email, req.user.name)
        await req.user.remove()
        res.status(200).send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) throw new Error()
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router
