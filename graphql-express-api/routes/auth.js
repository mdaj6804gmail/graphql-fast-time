const router = require("express").Router();
const auth = require("../controllers/auth");
const checkAuth = require("../utils/postinputcheck");

router.post("/signup", checkAuth.signup_check, auth.signup);

router.post("/login", checkAuth.login_check, auth.login);

module.exports = router;
