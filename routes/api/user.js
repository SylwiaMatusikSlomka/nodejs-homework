const express = require("express");
const { addUser, getUserById, loginUser, userList, pathAvatar, verificationEmail, verificationUser } = require("../../models/users.js");
const passport = require("../../config/config-passport.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const upload = require("../../config/multer.js");

const userRouter = express.Router();
const secret = process.env.SECRET;

const auth = async (req, res, next) => {
  try {
    await passport.authenticate(
      "jwt",
      { session: false },
      async (err, user) => {
        if (!user || err) {
          return res.status(401).json({
            status: "error",
            code: 401,
            message: "Unauthorized",
            data: "Unauthorized",
          });
        }

        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        const allUsers = await userList();
        const isToken = allUsers.some((user) => user.token === token);
        if (!isToken) {
          return res.status(401).json({
            status: "error",
            code: 401,
            data: "No Authorization",
          });
        }

        req.user = user;
        next();
      }
    )(req, res, next);
  } catch (error) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "An error occurred during authentication.",
    });
  }
};

userRouter.get("/verify/:verificationToken", async (req, res, next) => {
  const { verificationToken } = req.params;
  try {
    const user = await verificationUser(verificationToken);
    if (!user) {
      return res.json({
        message: `User not found`,
      });
    }

    return res.status(200).json({
      message: `Verification success`,
      code: 200,
      data: { user },
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

userRouter.post("/verify/", async (req, res, next) => {
  const { email, verificationToken } = req.body;
  if (!email) {
    res.status(400).json({ message: "missing require field" });
  }
  try {
    const user = await verificationEmail(email, verificationToken);
    return res.status(200).json({
      status: "success",
      message: `Verification email sent`,
      code: 200,
      data: { user },
    });
  } catch (err) {
    res.status(400).json({ message: `Verification has already been passed` });
  }
});

userRouter.get("/current", auth, async (req, res, next) => {
  const { id } = req.user;
  try {
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json(`User not found!!!`);
    }
    const { email, subscription } = user;

    return res.status(200).json({
      status: "success",
      code: 200,
      data: { email, subscription },
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      code: 500,
      message: `${err}`,
    });
  }
});

userRouter.get("/logout", auth, async (req, res, next) => {
  const { id } = req.user;
  console.log(id);
  console.log(req.user);
  try {
    const user = await getUserById(id);
    if (!user) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: `Not authorized`,
      });
    }
    user.token = null;
    await user.save();
    console.log(user);
    return res.status(204).json({ message: `logout` });
  } catch (err) {
    return res.status(500).json({ message: "Not authorized" });
  }
});

userRouter.post("/signup", async (req, res, next) => {
  const { body } = req;
  try {
    const user = await addUser(body);

    if(user === -1){
      return res.status(409).json({
        status: "conflict",
        code: 409,
        data: { message: 'Email in use' },
      });
    }else{
      return res.status(201).json({
        status: "success",
        code: 201,
        data: { user },
      });
    }
  } catch (err) {
    return res.status(400).json({ message: "Bad request" });
  }
});

userRouter.post("/login", async (req, res, next) => {
  const { body } = req;
  try {
    const user = await loginUser(body);
    if (!user) {
      return res.status(400).json({
        status: "unauthorized",
        code: 201,
        data: { message: "Email or password is wrong" },
      });
    }
    if (!user.verify) {
      return res.status(400).json(`Verification is essential`);
    }
    const payload = {
      id: user.id,
      username: user.email,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    user.token = token;
    await user.save();

    res.status(200).json({
      status: "success",
      code: 200,
      token: token,
    });
  } catch (err) {
    return res.status(500).json(err);
  }
});

userRouter.get("/:id", async (req, res, next) => {
  console.log("id");
  const { id } = req.params;
  try {
    const user = await getUserById(id);
    return res.status(200).json({
      status: "success",
      code: 200,
      data: { user },
    });
  } catch (err) {
    res.status(404).json(err.message);
  }
});

userRouter.get("/", auth, async (req, res, next) => {
  try {
    const users = await userList();
    return res.status(200).json({
      status: "success",
      code: 200,
      data: { users },
    });
  } catch (err) {
    throw err;
  }
});

userRouter.patch("/avatars", auth, upload.single("avatar"), async (req, res, next) => {
  const { id } = req.user;
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      status: "missing file",
      code: 400,
      data: { message: "Missing file!" },
    });
  }
  try {
    const avatar = await pathAvatar(id, file);
    return res.status(200).json({
      status: 'success',
      code: 200,
      data:{avatar}
    });
  } catch (err) {
    throw err;
  }
});

module.exports = { userRouter, auth }