const axios = require("axios");
const { getBaseURL, getToken } = require("../testconfig");
let baseUrl = getBaseURL();
let token = getToken();

describe("Message Controller", () => {
    let messageId;
    let chatId;

    describe("send message", () => {
        describe("send text message", () => {
            it("should send message and return true response", async () => {
                let config = {
                    headers: {
                        Authorization: "Bearer " + token,
                        "Content-Type": "application/json",
                    },
                    body: {
                        selectedPhone: "905427857477",
                        message: "Hello",
                    },
                };

                // if topicId and subTopic values are 0 response will be include all topics and subtopics.
                await axios
                    .post(baseUrl + "message/send", config.body, {
                        headers: config.headers,
                    })
                    .then((res) => {
                        expect(res.status).toBe(200);
                        expect(res.data.success).toBe(true);
                        expect(res.data).toHaveProperty("data");
                        messageId = res.data.data.id;
                        chatId = res.data.data.chatId;
                    })
                    .catch();
            });
        });

        describe("send message which contains file above 10mb", () => {
            it("should send message which contains base64 file and return true response", async () => {
                let config = {
                    headers: {
                        Authorization: "Bearer " + token,
                        "Content-Type": "application/json",
                    },
                    body: {
                        file: {
                            media: "base64data",
                            filename: "example.txt",
                        },
                        selectedPhone: "905427857477",
                        message: "Hello",
                    },
                };

                // after "/" you should enter the number that you want to see chat. limit could be something different and when you change the offset other messages will be loaded.
                await axios
                    .post(baseUrl + "message/send", config.body, {
                        headers: config.headers,
                    })
                    .then((res) => {
                        expect(res.status).toBe(200);
                        expect(res.data.success).toBe(true);
                        expect(res.data).toHaveProperty("data");
                        expect(res.data.data).toHaveProperty("file");
                    })
                    .catch();
            });
        });

        //     describe("send message which contains file bigger than 10mb", ()=>{
        //         it("should send message which contains base64 file and return false response", async()=>{

        //             let config = {
        //                 headers: {
        //                     Authorization: "Bearer " + token,
        //                     "Content-Type": "application/json",
        //                 },
        //                 body: {
        //                     file: {
        //                       media: "base64data > 10mb",
        //                       filename: "example.txt"
        //                     },
        //                     selectedPhone: "905427857477",
        //                     message: "Hello"
        //                   }
        //             }

        //             // after "/" you should enter the number that you want to see chat. limit could be something different and when you change the offset other messages will be loaded.
        //             await axios
        //                 .post(
        //                     baseUrl +
        //                         "message/send",
        //                     config.body, { headers: config.headers }
        //                 )
        //                 .then((res) => {
        //                     expect(res.status).toBe(200);
        //                     expect(res.data.success).toBe(false);
        //                     expect(res.data).toHaveProperty("message");
        //                 })
        //                 .catch();

        //         })
        //     })
    });
    describe("fix the message", () => {
        it("should toggle the mark of the message as fixed by message id and return true response", async () => {
            let config = {
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json",
                },
            };

            await axios
                .get(baseUrl + "message/hasFixed/" + messageId, config)
                .then((res) => {
                    expect(res.status).toBe(200);
                    expect(res.data.success).toBe(true);
                })
                .catch();
        });
    });

    describe("mark the message", () => {
        it("should toggle the mark of the message by message id and return true response", async () => {
            let config = {
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json",
                },
            };

            await axios
                .get(baseUrl + "message/hasMarked/" + messageId, config)
                .then((res) => {
                    expect(res.status).toBe(200);
                    expect(res.data.success).toBe(true);
                })
                .catch();
        });
    });

    describe("fix the all messages by chat id", () => {
        it("should fix the all messages by chat id and return true response", async () => {
            let config = {
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json",
                },
            };

            await axios
                .get(baseUrl + "message/allmessagesfixed/" + chatId, config)
                .then((res) => {
                    expect(res.status).toBe(200);
                    expect(res.data.success).toBe(true);
                })
                .catch();
        });
    });

    describe("get the message details by message id", () => {
        it("should post a message details by message id and return true response", async () => {
            let config = {
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json",
                },
                body: {
                    date: "2023-01-01T00:00:00.000Z",
                    details: "Bu bir detaydır.",
                },
            };

            await axios
                .post(
                    baseUrl + "message/messagedetails/" + messageId,
                    config.body,
                    { headers: config.headers }
                )
                .then((res) => {
                    expect(res.status).toBe(200);
                    expect(res.data.success).toBe(true);
                })
                .catch();
        });

        it("should get the message details by message id and return true response with data", async () => {
            let config = {
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json",
                },
            };

            await axios
                .get(baseUrl + "message/messagedetails/" + messageId, config)
                .then((res) => {
                    expect(res.status).toBe(200);
                    expect(res.data.success).toBe(true);
                    expect(res.data).toHaveProperty("data");
                })
                .catch();
        });
    });

    describe("edit topics", () => {
        it("should edit topics by message id and return true response with data", async () => {
            let config = {
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json",
                },
                body: {
                    file: {
                        media: "base64data > 10mb",
                        filename: "example.txt",
                    },
                    selectedPhone: "905427857477",
                    message: "Hello",
                },
            };

            await axios
                .post(
                    baseUrl + "message/edittopics/" + messageId,
                    config.body,
                    { headers: config.headers }
                )
                .then((res) => {
                    expect(res.status).toBe(200);
                    expect(res.data.success).toBe(true);
                })
                .catch();
        });
    });

    describe("get topics", () => {
        it("should get all topics", async () => {
            let config = {
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json",
                },
            };

            await axios
                .get(baseUrl + "message/topics", config)
                .then((res) => {
                    expect(res.status).toBe(200);
                    expect(res.data.success).toBe(true);
                    expect(res.data).toHaveProperty("data");
                })
                .catch();
        });
    });

    describe("get subtopics", () => {
        it("should get all subtopics", async () => {
            let config = {
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json",
                },
            };

            await axios
                .get(baseUrl + "message/subtopics", config)
                .then((res) => {
                    expect(res.status).toBe(200);
                    expect(res.data.success).toBe(true);
                    expect(res.data).toHaveProperty("data");
                })
                .catch();
        });
    });
});
