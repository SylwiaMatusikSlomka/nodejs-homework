const { Error } = require("mongoose");
const User = require("../service/schema/user.js");
const bcrypt = require("bcrypt");

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
        const user = {...body, password: hashedPassword };
        await User.create(user);
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

module.exports = {
    userList,
    getUserById,
    addUser,
    loginUser
}