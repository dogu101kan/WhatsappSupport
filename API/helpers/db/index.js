/** @format */

const { uid } = require("uid");
const asyncErrorWrapper = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const customError = require("../error/CustomError");
const { phoneNumber } = require("../phoneNumber");
const { saveBase64ToFile, readBase64FromFile } = require("../base64");
const wpClient = require("../client");

const prisma = new PrismaClient();

const findUser = asyncErrorWrapper(async (id) => {
    let user = await prisma.user.findUnique({
        where: {
            id: +id,
        },
    });

    if (!user) return false;
    return user;
});

const userStatus = asyncErrorWrapper(async (status, username) => {
    let user = await prisma.user.update({
        where: {
            username,
        },
        data: {
            status: status == "false" ? false : true,
        },
    });
    return true;
});

const saveMessage = asyncErrorWrapper(async (message, client) => {
    let data;
    let media;
    let file;

    const phoneNumb = phoneNumber(message._data.from);
    const messageContact = await message.getContact();

    let customer = await findCustomer(phoneNumb);

    if (!customer) {
        const customerData = {
            username: messageContact.name || null,
            phoneNumber: phoneNumb,
            pushname: messageContact.pushname,
        };
        customer = await prisma.customer.create({ data: customerData });
    } else {
        let updatedData = {
            username: messageContact.name || null,
            pushname: messageContact.pushname,
        };

        const pp = await client.getProfilePicUrl(messageContact.id._serialized);
        if (customer.profilePic != pp) updatedData.profilePic = pp;

        await prisma.customer.update({
            where: {
                id: customer.id,
            },
            data: {
                ...updatedData,
            },
        });
    }
    let chats = await findChat(phoneNumb, (limit = 0), (offset = 0));

    if (!chats) {
        const chat = {
            notification: true,
            customerId: customer.id,
        };
        chats = await prisma.chat.create({ data: chat });
    } else {
        await chatUpdate(chats.id);
    }

    if (message.hasMedia) {
        media = await message.downloadMedia();

        data = {
            hasMedia: true,
            message: message.body,
            userId: null,
            chatId: chats.id,
            customerId: customer.id,
        };
    } else {
        data = {
            hasMedia: false,
            message: message.body,
            userId: null,
            chatId: chats.id,
            customerId: customer.id,
        };
    }

    const newMessage = await prisma.message.create({ data });

    if (message.hasMedia) {
        const path = await saveBase64ToFile(
            media.data,
            `${newMessage.id}_${uid(16)}.txt`,
            "files_and_medias"
        );
        file = await prisma.file.create({
            data: {
                messageId: newMessage.id,
                media: path,
                mediaType: media.mimetype,
                filename: message._data.filename,
            },
        });

        file.media = await readBase64FromFile(file.media);
    }

    return { ...newMessage, file };
});

const saveMessageForAPI = asyncErrorWrapper(async (data) => {
    let message;
    let file;
    let customer = await findCustomer(data.selectedPhone);

    if (!customer) {
        const customerData = {
            phoneNumber: data.selectedPhone,
        };
        customer = await prisma.customer.create({ data: customerData });
    }

    let chats = await findChat(data.selectedPhone, (limit = 0), (offset = 0));

    if (!chats) {
        const chat = {
            notification: true,
            customerId: customer.id,
        };
        chats = await prisma.chat.create({ data: chat });
    } else {
        await chatUpdate(chats.id);
    }

    message = {
        hasMedia:
            data.file !== undefined && data.file.media !== null ? true : false,
        hasFixed: true,
        message: data.message,
        userId: data.userId,
        chatId: chats.id,
        customerId: null,
    };
    const newMessage = await prisma.message.create({ data: message });
    if (data.file !== undefined && data.file.media !== null) {
        const path = await saveBase64ToFile(
            data.file.media,
            `${newMessage.id}_${uid(16)}.txt`,
            "files_and_medias"
        );
        file = await prisma.file.create({
            data: {
                messageId: newMessage.id,
                media: path,
                mediaType: data.file.mediaType,
                filename: data.file.filename,
            },
        });
    }

    return { ...newMessage, file };
});

//Gerçek whatsapp ta benim tarafımdan gönderilen mesajları görmek için
const saveMessageSendingWhatsapp = asyncErrorWrapper(async (data) => {
    let message;
    let file;

    if (data._data.self == "in" && data._data.id.fromMe) {
        let customer = await findCustomer(data.to.split("@")[0]);
        if (!customer) {
            const customerData = {
                phoneNumber: data.to.split("@")[0],
            };
            customer = await prisma.customer.create({ data: customerData });
        }

        let chats = await findChat(
            data.to.split("@")[0],
            (limit = 0),
            (offset = 0)
        );

        if (!chats) {
            const chat = {
                notification: true,
                customerId: customer.id,
            };
            chats = await prisma.chat.create({ data: chat });
        } else {
            await chatUpdate(chats.id);
        }

        message = {
            hasMedia: data.hasMedia,
            message: data.body,
            userId: 1,
            hasFixed: true,
            chatId: chats.id,
            customerId: null,
        };
        const newMessage = await prisma.message.create({ data: message });
        if (data.hasMedia) {
            media = await data.downloadMedia();
            const path = await saveBase64ToFile(
                media.data,
                `${newMessage.id}_${uid(16)}.txt`,
                "files_and_medias"
            );
            file = await prisma.file.create({
                data: {
                    messageId: newMessage.id,
                    media: path,
                    mediaType: media.mimetype,
                    filename: data._data.filename,
                },
            });

            file.media = await readBase64FromFile(file.media);
        }

        return { ...newMessage, file };
    }
});

const findChat = asyncErrorWrapper(async (phoneNumber, limit, offset) => {
    const customer = await prisma.customer.findFirst({
        where: {
            phoneNumber,
        },
        include: {
            chat: {
                include: {
                    messages: {
                        skip: parseInt(offset),
                        take: parseInt(limit),
                        include: {
                            file: true,
                            messageDetail: {
                                include: {
                                    topic: true,
                                    subTopic: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: "desc",
                        },
                    },
                },
            },
        },
    });

    if (customer === null || customer.chat.length < 1) return false;

    customer.chat[0].messages.forEach((message) => {
        if (message.file && message.file.media) {
            message.file.media = readBase64FromFile(message.file.media);
        }
    });

    return customer.chat[0];
});

// const findChatTest = asyncErrorWrapper(async(phoneNumber, limit, offset) => {
//     const customer = await prisma.customer.findFirst({
//         where:{
//             phoneNumber
//         },
//         include:{
//             chat:{
//                 include:{
//                     messages: {
//                         skip: +offset,
//                         take: +limit,
//                         orderBy: {
//                             createdAt: 'desc',
//                           },
//                     }
//                 }
//             }
//         },
//     });

//     if(customer===null || customer.chat.length < 1) return false;

//     return customer.chat
// });
const findCustomer = asyncErrorWrapper(async (phoneNumber) => {
    const customer = await prisma.customer.findFirst({
        where: {
            phoneNumber,
        },
    });

    if (!customer) return false;

    return customer;
});

const getAllCustomers = asyncErrorWrapper(async () => {
    let data = [];

    const customers = await prisma.chat.findMany({
        include: {
            customer: true,
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    customers.forEach((e) => {
        data.push(e.customer);
    });
    return data;
});

const chatUpdate = asyncErrorWrapper(async (chatId) => {
    const chat = await prisma.chat.update({
        where: {
            id: chatId,
        },
        data: {
            updatedAt: new Date(),
            notification: true,
        },
    });

    return chat;
});

const hasFixedSetter = asyncErrorWrapper(async (id) => {
    const message = await prisma.message.findUnique({
        where: {
            id: parseInt(id),
        },
    });

    const updated_message = await prisma.message.update({
        where: {
            id: parseInt(id),
        },
        data: {
            hasFixed: !message.hasFixed,
        },
    });

    return updated_message;
});

const hasMarkedSetter = asyncErrorWrapper(async (id) => {
    const message = await prisma.message.findUnique({
        where: {
            id: parseInt(id),
        },
    });

    const updated_message = await prisma.message.update({
        where: {
            id: parseInt(id),
        },
        data: {
            hasMarked: !message.hasMarked,
        },
    });

    return updated_message;
});

const allFixedSetter = asyncErrorWrapper(async (chatId) => {
    const updated_message = await prisma.message.updateMany({
        where: {
            customerId: parseInt(chatId),
        },
        data: {
            hasFixed: true,
        },
    });

    return updated_message;
});

const filteredCustomer = asyncErrorWrapper(async (req) => {
    let selectedTopic = req.query.topicId;
    let selectedSubTopic = req.query.subTopicId;
    let hasFixed = req.query.hasFixed;
    let searchedMessage = req.query.searchedMessage;
    let { firstDate, secondDate } = req.query;
    let result;
    if (selectedTopic)
        selectedTopic = +selectedTopic !== 0 ? +selectedTopic : undefined;
    if (selectedSubTopic)
        selectedSubTopic =
            +selectedSubTopic !== 0 ? +selectedSubTopic : undefined;

    let messageDetail = {
        topicId: selectedTopic,
        subTopicId: selectedSubTopic,
    };

    if (secondDate !== "null") {
        messageDetail = {
            ...messageDetail,
            endDate: {
                lt: new Date(secondDate),
                gt: new Date("1970-01-01T00:00:00.000Z"),
            },
        };
    }
    if (firstDate !== "null") {
        if (secondDate !== "null") {
            messageDetail = {
                ...messageDetail,
                endDate: {
                    lt: new Date(secondDate),
                    gt: new Date(firstDate),
                },
            };
        } else {
            messageDetail = {
                ...messageDetail,
                endDate: {
                    lt: new Date("2100-01-01T00:00:00.000Z"),
                    gt: new Date(firstDate),
                },
            };
        }
    }
    try {
        result = await prisma.message.findMany({
            where: {
                hasFixed: JSON.parse(hasFixed) === true ? false : undefined,
                AND: [
                    {
                        OR: [
                            {
                                message: searchedMessage
                                    ? {
                                          contains: searchedMessage,
                                          mode: "insensitive",
                                      }
                                    : undefined,
                            },
                            {
                                customer: {
                                    OR: [
                                        {
                                            pushname: {
                                                contains: searchedMessage,
                                                mode: "insensitive",
                                            },
                                        },
                                        {
                                            username: {
                                                contains: searchedMessage,
                                                mode: "insensitive",
                                            },
                                        },
                                        {
                                            phoneNumber: {
                                                contains: searchedMessage,
                                                mode: "insensitive",
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            },
            include: {
                chat: {
                    select: { notification: true, id: true, customer: true },
                },
            },
            orderBy: {
                chat: {
                    updatedAt: "desc",
                },
            },
        });
        return result;
    } catch (error) {
        console.error("Error getting filtered chats:", error);
        throw error;
    }
});

const editMessageDetails = asyncErrorWrapper(async (req) => {
    let { date, details } = req.body;
    const { messageId } = req.params;

    date =
        date === "1970-01-01T00:00:00.000Z"
            ? null
            : new Date(date).toISOString();

    let messageDetails;

    const message = await prisma.message.findFirst({
        where: {
            id: +messageId,
        },
    });

    messageDetails = await prisma.messageDetails.findFirst({
        where: {
            messageId: message.id,
        },
    });

    if (messageDetails === null) {
        messageDetails = await prisma.messageDetails.create({
            data: {
                messageId: message.id,
                endDate: date,
                detail: details !== undefined ? details : null,
            },
        });
    } else {
        messageDetails = await prisma.messageDetails.update({
            where: {
                id: messageDetails.id,
            },
            data: {
                endDate: date,
                detail: details !== undefined ? details : null,
            },
        });
    }

    return messageDetails;
});
const getMessageDetails = asyncErrorWrapper(async (req) => {
    const { messageId } = req.params;

    let messageDetails;

    messageDetails = await prisma.messageDetails.findFirst({
        where: {
            messageId: +messageId,
        },
        include: {
            topic: true,
            subTopic: true,
        },
    });

    return messageDetails;
});

const editTopics = asyncErrorWrapper(async (req) => {
    const { topic, subTopic } = req.body;
    const { messageId } = req.params;

    let messageDetails;

    messageDetails = await prisma.messageDetails.findFirst({
        where: {
            messageId: +messageId,
        },
    });

    if (messageDetails === null) {
        messageDetails = await prisma.messageDetails.create({
            data: {
                messageId: +messageId,
                subTopicId: subTopic,
                topicId: topic,
            },
        });
        return messageDetails;
    } else {
        messageDetails = await prisma.messageDetails.update({
            where: {
                messageId: +messageId,
            },
            data: {
                subTopicId: subTopic,
                topicId: topic,
            },
            include: {
                topic: true,
                subTopic: true,
            },
        });

        return messageDetails;
    }
});

const notification = asyncErrorWrapper(async (phoneNumber) => {
    let chat;

    const chatt = await prisma.chat.findFirst({
        where: {
            customer: {
                phoneNumber: phoneNumber,
            },
        },
    });

    if (chatt) {
        chat = await prisma.chat.updateMany({
            where: {
                customer: {
                    phoneNumber: phoneNumber,
                },
            },
            data: {
                notification: false,
                updatedAt: chatt.updatedAt,
            },
        });
    }

    if (!chat) return false;

    return true;
});

const getTopics = asyncErrorWrapper(async () => {
    return await prisma.topic.findMany({
        include: {
            subTopic: true,
        },
    });
});

const getSubTopics = asyncErrorWrapper(async () => {
    return await prisma.subTopic.findMany();
});

module.exports = {
    findUser,
    userStatus,
    saveMessage,
    getAllCustomers,
    findChat,
    saveMessageForAPI,
    hasFixedSetter,
    hasMarkedSetter,
    filteredCustomer,
    chatUpdate,
    allFixedSetter,
    editMessageDetails,
    getMessageDetails,
    notification,
    editTopics,
    getTopics,
    getSubTopics,
    saveMessageSendingWhatsapp,
    // findChatTest
};
