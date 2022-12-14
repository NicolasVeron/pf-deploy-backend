const router = require("express").Router();
const { getAllUsers, getUser, deleteUser, updatedUser,updatePassword, forgotPassword, resetPassword, banUser } = require("../controllers/userController");
const { verifyTokenAndAdmin, verifyTokenAndAuthorization, verifyToken } = require("../services/JwtServices");



router.get("/",getAllUsers);
router.get("/:id",getUser);
router.post("/forgotPassword",forgotPassword)
router.delete("/find/:id", deleteUser);
router.patch("/find/:id", banUser);
router.patch("/updateUser", updatedUser);
router.patch("/password/update", updatePassword)
router.put("/resetPassword/:resetToken", resetPassword)











module.exports = router;