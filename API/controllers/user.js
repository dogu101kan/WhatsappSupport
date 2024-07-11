const asyncErrorWrapper = require("express-async-handler");
const CustomError = require("../helpers/error/CustomError");

const { userStatus } = require("../helpers/db/index");

const userAccess = asyncErrorWrapper(async (req, res) => {
    const { status, username } = req.query;
    const resp = await userStatus(status, username);

    res.status(200).json({
        success: resp
    });
});

module.exports = {
    userAccess,
}