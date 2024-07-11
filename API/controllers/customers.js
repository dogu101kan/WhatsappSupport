/** @format */

const asyncErrorWrapper = require("express-async-handler");
const {
    getAllCustomers,
    findChat,
    filteredCustomer,
    notification,
} = require("../helpers/db");
const { sortMessages } = require("../helpers/message/sorting");
const CustomError = require("../helpers/error/CustomError");
const { PrismaClient } = require("@prisma/client");

const getCustomers = asyncErrorWrapper(async (req, res) => {
    const customers = await getAllCustomers();

    res.status(200).json({
        success: true,
        data: customers,
    });
});
const prisma = new PrismaClient();

const getChat = asyncErrorWrapper(async (req, res) => {
    const { phoneNumber } = req.params;
    const { limit, offset } = req.query;

    const chat = await findChat(phoneNumber, limit, offset);

    if (!chat) return new CustomError("Chat doesn't exist.", 404);

    const sortedMessages = sortMessages(chat.messages);

    const sortedChat = { ...chat, messages: sortedMessages };
    res.status(200).json({
        success: true,
        data: sortedChat,
    });
});

const notificationSetter = asyncErrorWrapper(async (req, res) => {
    const { phoneNumber } = req.params;

    const chat = await notification(phoneNumber);

    if (!chat) return new CustomError("Chat doesn't exist.", 404);

    res.status(200).json({
        success: true,
    });
});

const getFilteredCustomers = asyncErrorWrapper(async (req, res) => {
    try {
        const filteredCustomers = await filteredCustomer(req);
        let data = [];
        const filteredCustomersForMessages = filteredCustomers;

        const uniqueCustomers = filteredCustomers.reduce((unique, item) => {
            if (
                item.chat.customer &&
                !unique.some(
                    (uniqueItem) => uniqueItem.id === item.chat.customer.id
                )
            ) {
                item.chat.customer.notification = item.chat.notification;
                unique.push(item.chat.customer);
            }
            return unique;
        }, []);

        console.log(req.query.searchedMessage);
        const messagesList = [];
        for await (const item of filteredCustomersForMessages) {
            const totalMessagesAtChat = await prisma.message.findMany({
                where: { chatId: item.chatId },
            });
            const totalIndex = totalMessagesAtChat.length - 1;
            const index = totalMessagesAtChat.findIndex(
                (message) => message.id === item.id
            );

            item.index = totalIndex - index;
            item.customer = item.chat?.customer;
            delete item.chat;

            messagesList.push(item);
        }

        res.status(200).json({
            success: true,
            data: uniqueCustomers,
            messages: req.query.searchedMessage
                ? messagesList.sort((a, b) => {
                      return b.createdAt - a.createdAt;
                  })
                : undefined,
        });
    } catch (error) {
        console.log(error);
    }
});
const test = asyncErrorWrapper(async (req, res) => {
    const filteredCustomers = await filteredCustomer(req);

    res.status(200).json({
        success: true,
        data: filteredCustomers,
    });
});

// const test = asyncErrorWrapper(async(req, res)=>{

//   const chat = messageDetails()

//   res.status(200).json({
//     data:chat
//   });

// })

module.exports = {
    getCustomers,
    getChat,
    getFilteredCustomers,
    notificationSetter,
    test,
};
