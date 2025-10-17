const {createAuthCookie, logout} = require("../controllers/index")

const router = require('express').Router()

router.post('/jwt',createAuthCookie)
router.post('/logout',logout)

module.exports = router