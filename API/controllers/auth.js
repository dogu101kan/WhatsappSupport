/** @format */

const {
    validateUserInput,
    comparePassword,
} = require("../helpers/input/inputHelper");
const customError = require("../helpers/error/CustomError");
const { sendJwtToClient } = require("../helpers/authorization/tokenHelper");
const asyncErrorWrapper = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
// const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const signUp = asyncErrorWrapper(async (req, res) => {
    const { username, password } = req.body;

    const data = {
        username,
        password,
    };
    const isExist = await prisma.user.findFirst({ where: { username } });
    if (isExist) {
        return res
            .status(401)
            .json({ success: false, message: "Bu kullanıcı sistemde mevcut." });
    }
    const user = await prisma.user.create({ data });
    const { password: passw, ...rest } = user;
    res.status(201).json({
        success: true,
        data: rest,
    });
});

const login = asyncErrorWrapper(async (req, res, next) => {
    const { username, password } = req.body;

    if (!validateUserInput(username, password))
        return next(new customError("Please check your input", 400));

    const user = await prisma.user.findUnique({
        where: {
            username: username,
        },
    });

    if (!user || !(password === user.password))
        return next(
            new customError("Lütfen bilgilerinizi kontrol ediniz", 400)
        );

    sendJwtToClient(user, res);
});

const logout = asyncErrorWrapper(async (req, res, next) => {
    const { NODE_ENV } = process.env;

    return res
        .cookie({
            httpOnly: true,
            expires: new Date(Date.now()),
            secure: NODE_ENV === "development" ? false : true,
        })
        .status(200)
        .json({
            succes: true,
            message: "User has been logout.",
        });
});

const clientStatus = asyncErrorWrapper(async (req, res) => {
    let client = req.app.get("client1");
    let status = await client.getState();

    res.status(200).json({
        success: status === "CONNECTED" ? true : false,
        message: status === null ? "SESSION DOESN'T EXIST" : status,
    });
});

module.exports = {
    signUp,
    login,
    logout,
    clientStatus,
};
