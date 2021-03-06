require('dotenv').config
const router = require('express').Router()
const bcrypt = require('bcrypt')
const Admin = require('../models/Admin.model')
const Client = require('../models/Client.model')


router.post('/login' , (req, res, next) => {
    const {email, password} = req.body

    if (!email || !password) {
        res.status(400).json({message: 'Email y contraseña son necesarios.'})
        return
    }

    Client.findOne({email}, (err, foundClient) => {
        if (err) {
            res.status(500).json({message: 'La busqueda de usuario en /login ha fallado.'})
            return
        }
        if (foundClient) {
            const match = bcrypt.compareSync(password, foundClient.passwordHash)
    
            if (!match) {
                res.status(400).json({ message: 'La contraseña no coincide' })
                return
            }
            res.status(200).json(foundClient)
            return
        } else {
                Admin.findOne({ email }, (err, foundAdmin) => {
                    if (err) {
                        res.status(500).json({ message: 'La busqueda de administrador en /login ha fallado.' })
                        return
                    }
                    if (!foundAdmin) {
                        res.status(400).json({ message: 'El usuario no existe.' })
                        return
                    }
                    
                    const match = bcrypt.compareSync(password, foundAdmin.passwordHash)
                    
                    if (!match) {
                        res.status(400).json({ message: 'La contraseña no coincide' })
                        return
                    }
    
                    res.status(200).json(foundAdmin)
                    return
                })
        }
    }).populate('orders')
})

router.post('/signup', (req, res, next) => {
    const { email, password, isAdmin, rootPassword} = req.body

    if (!email || !password) {
        res.status(400).json({ message: "Email y contraseña son necesarios." })
        return
    }

    if (password.length < 6) {
        res.status(400).json({ message: "La contraseña debe incluir al menos 6 caracteres." })
        return
    }

    if (!isAdmin) {
        Client.findOne({email}, (err, foundClient) => {
            if (err) {
                res.status(500).json({ message: "La busqueda de usuario en /signup ha fallado." })
                return
            }
            if (foundClient) {
                res.status(400).json({ message: "El usuario cliente ya existe." })
                return
            }
            const salt = bcrypt.genSaltSync()
            const passwordHash = bcrypt.hashSync(password, salt)
                Client.create({
                    email,
                    passwordHash,
                }, (err, newClient) => {
                    if (err) {
                        res.status(500).json({ message: "Error al crear el usuario Admin" })
                        return
                    }
                    res.status(200).json(newClient)
                    return
                })
        })
        return
    }

    Admin.findOne({ email }, (err, foundUser) => {
        if (err) {
            res.status(500).json({ message: "La busqueda de usuario en /signup ha fallado." })
            return
        }
        if (foundUser) {
            res.status(400).json({ message: "El usuario admin ya existe." })
            return
        }

        const salt = bcrypt.genSaltSync()
        const passwordHash = bcrypt.hashSync(password, salt)
        if (req.body.rootPassword == process.env.ROOT_PASSWORD) {
            Admin.create({
                email,
                passwordHash,
            }, (err, newAdmin) => {
                if (err) {
                    res.status(500).json({ message: "Error al crear el usuario Admin" })
                    return
                }
                req.login(newAdmin, (err) => {
                    if (err) {
                        res.status(500).json({ message: "El login despues de signup ha fallado" })
                        return
                    }
                    res.status(200).json(newAdmin)
                    return
                })
            })
        } else {
            res.status(400).json({ message: 'La contraseña root no es correcta' })
            return    
        }
    })
})

router.post('/updateuser', async (req, res, next) => {
    const { _id, adminPermissions } = req.body

    try {
        const newData = adminPermissions ? 
            await Admin.findByIdAndUpdate(_id, req.body, { new: true }) :
            await Client.findByIdAndUpdate(_id, req.body, { new: true }).populate('orders')
        res.status(200).json(newData)
    } catch (err) {
        return res.status(500).json({ message: 'Error al actualizar el usuario'})
    }

    
})

module.exports = router