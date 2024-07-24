const User = require("../models/User");

exports.restrictToAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    // console.log("User from DB in restrictToAdmin:", user);
    if (!user.isAdmin) {
      return res
        .status(403)
        .json({ message: "You do not have permission to perform this action" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Error checking admin status", error });
  }
};
