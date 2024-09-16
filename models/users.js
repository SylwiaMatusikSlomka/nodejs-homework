const { Error } = require("mongoose");
const User = require("../service/schema/user.js");
const bcrypt = require("bcrypt");
const gravatar = require('gravatar');
const { Jimp } = require("jimp");
const { nanoid } = require("nanoid");
require("dotenv").config();
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const userList = async() => {
    try {
        return await User.find();
    } catch (err) {
        throw err;
    }
};

const getUserById = async(id) => {
    try {
        return await User.findById(id);
    } catch (err) {
        throw err;
    }
};

const addUser = async(body) => {
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
        const verificationToken = nanoid();
        const user = {...body, password: hashedPassword, avatarURL: userAvatar, verificationToken };
        await User.create(user);
        await sgMail.send(verificationMgs(email, verificationToken));
        return user;
    } catch (err) {
        throw err;
    }
};

const loginUser = async(body) => {
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

const pathAvatar = async(id, file) => {
    try {
        const localAvatar = `public\\avatars\\avatar_${id}.jpg`;
        console.log(file.path);
        console.log(localAvatar);
        const image = await Jimp.read(file.path);
        image.resize({ w: 250, h: 250 });
        await image.write(localAvatar);

        const user = await User.findByIdAndUpdate({ _id: id }, { $set: { avatarURL: localAvatar } }, { new: true });
        return user;
    } catch (err) {
        throw err;
    }
};

const verificationMgs = (email, verificationToken) => {
    return {
        to: email,
        from: "sylwia.matusik.1994@gmail.com",
        subject: "Verify your email",
        text: "Verify your email in link bellow",
        html: `<strong><a href="http://localhost:3000/api/users/verify/${verificationToken}">Verify email</a></strong>`,
    };
};

const verificationEmail = async(email) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error({ message: `User not found` });
        }
        const { verificationToken, verify } = user;
        if (verify) {
            throw new Error({ message: `Verification has already been passed` });
        }
        await sgMail.send(verificationMgs(email, verificationToken));
    } catch (err) {
        throw err;
    }
};

const verificationUser = async(verificationToken) => {
    try {
        const user = await User.findOne({ verificationToken });
        if (!user) {
            throw new Error();
        }
        user.verify = true;
        await user.save();
        user.verificationToken = null;
        return user;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

module.exports = {
    userList,
    getUserById,
    addUser,
    loginUser,
    pathAvatar,
    verificationEmail,
    verificationUser
}