const { Error } = require("mongoose");
const User = require("../service/schema/user.js");
const bcrypt = require("bcrypt");
const gravatar = require('gravatar');
const { Jimp } = require("jimp");

const userList = async () => {
  try {
    return await User.find();
  } catch (err) {
    throw err;
  }
};

const getUserById = async (id) => {
  try {
    return await User.findById(id);
  } catch (err) {
    throw err;
  }
};

const addUser = async (body) => {
  const { email, password } = body;
  const users = await User.find();
  const findUser = users.find((user) => user.email === email);
  console.log(findUser);
  if (findUser) {
    return -1;
  }
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const userAvatar = gravatar.url(email, { s: "250" });
    const user = { ...body, password: hashedPassword, avatarURL: userAvatar };
    await User.create(user);
    return user;
  } catch (err) {
    throw err;
  }
};

const loginUser = async (body) => {
  const { email, password } = body;
  const users = await User.find();
  const singleUser = users.find((user) => user.email === email);
  if (!singleUser) {
    return console.log("Cannot find user");
  }
  try {
    if (await bcrypt.compare(password, singleUser.password)) {
      console.log("success");
      return singleUser;
    } else {
      console.log("Not Allowed");
    }
  } catch (err) {
    throw new Error();
  }
};

const pathAvatar = async (id, file) => {
  try {
    const localAvatar = `public\\avatars\\avatar_${id}.jpg`;
    console.log(file.path);
    console.log(localAvatar);
    const image = await Jimp.read(file.path);
    image.resize({w: 250, h: 250});
    await image.write(localAvatar);

    const user = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { avatarURL: localAvatar } },
      { new: true }
    );
    return user;
  } catch (err) {
    throw err;
  }
};

module.exports = {
    userList,
    getUserById,
    addUser,
    loginUser,
    pathAvatar
  }
  