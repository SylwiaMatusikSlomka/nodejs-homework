const express = require("express");
const { addUser, getUserById, loginUser, userList } = require("../../models/users.js");
const passport = require("../../config/config-passport.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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

userRouter.get("/", async (req, res, next) => {
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

userRouter.get("/:id", async (req, res, next) => {
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

userRouter.post("/logout", auth, async (req, res, next) => {
  const { id } = req.user;
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
    return res.status(204).json({ message: `logout` });
  } catch (err) {
    return res.status(500).json({ message: "Not authorized" });
  }
});

module.exports = { userRouter, auth }