const axios = require("axios");
const { getBaseURL, getToken, setToken } = require("../testconfig");

let baseUrl = getBaseURL();
let token;

describe("Auth Controller", () => {
    describe('signUp route', () => {

      it('should create a new user and return success response', async () => {
        let req = {
            username: 'test',
            password: 'test',
          };

        await axios.post(baseUrl+"auth/register", req)
            .then(res=> {
                expect(res.status).toBe(201);
                expect(res.data.success).toBe(true);
                expect(res.data.data).toHaveProperty('id');
                expect(res.data.data).toHaveProperty('username');
            })
            .catch()

        });

        it('should try create a existing user and return false response', async () => {
            let req = {
                username: 'test',
                password: 'test',
              };

              await axios.post(baseUrl+"auth/register", req)
              .then()
              .catch( err=> {
                  expect(err.response.status).toBe(500);
                  expect(err.response.data.success).toBe(false);
              })
            });
        // expect(response.status).toBe(201);
        // expect(response.body.success).toBe(true);
        // expect(response.body.data).toHaveProperty('id'); // veya başka bir özellik kontrolü
        // expect(response.body.data.username).toBe('test');
    });

    describe("login route", () => {
        it("should try to login with wrong credential and return false response", async () => {
            let req = {
                username: "doesn't exist",
                password: "doesn't exist",
            };

            await axios
                .post(baseUrl + "auth/login", req)
                .then()
                .catch((err) => {
                    expect(err.response.status).toBe(400);
                    expect(err.response.data.success).toBe(false);
                });
        });

        it("should login and return success response", async () => {
            let req = {
                username: "test",
                password: "test",
            };

            await axios
                .post(baseUrl + "auth/login", req)
                .then((res) => {
                    expect(res.status).toBe(200);
                    expect(res.data.success).toBe(true);
                    expect(res.data.data).toHaveProperty("id");
                    expect(res.data.data).toHaveProperty("username");
                    expect(res.data).toHaveProperty("access_token");
                    token = res.data.access_token;
                    setToken(token);
                })
                .catch(err => console.log(err));
        });
    });

    // describe("logout route", ()=>{
    //     it("should logout return success response", async () => {
    //         let req = {
    //             username: "test",
    //             password: "test",
    //         };

    //         await axios
    //             .post(baseUrl + "auth/login", req)
    //             .then((res) => {
    //                 expect(res.status).toBe(200);
    //                 expect(res.data.success).toBe(true);
    //                 expect(res.data.data).toHaveProperty("id");
    //                 expect(res.data.data).toHaveProperty("username");
    //                 expect(res.data).toHaveProperty("access_token");
    //                 token = res.data.access_token;
    //             })
    //             .catch();
    //     });
    // })

    describe("status", () => {
        it("should check the whatsapp session", async () => {
            let config = {
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json",
                },
            };

            await axios
                .get(baseUrl + "auth/status", config)
                .then((res) => {
                    expect(res.status).toBe(200);
                    expect(res.data).toHaveProperty("success");
                    expect(res.data).toHaveProperty("message");
                })
                .catch();
        });
    });
});

describe("Customer Controller", () => {
    describe("get all customers", () => {
        it("should get all chats by filters and return true response", async () => {
            let config = {
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json",
                },
            };

            // if topicId and subTopic values are 0 response will be include all topics and subtopics.
            await axios
                .get(
                    baseUrl +
                        "customer/getfilteredchats?topicId=0&subTopicId=0&hasFixed=false",
                    config
                )
                .then((res) => {
                    expect(res.status).toBe(200);
                    expect(res.data.success).toBe(true);
                    expect(res.data).toHaveProperty("data");
                })
                .catch();
        });
    });

    describe("get chat", ()=>{
        it("should get chat by phone number if exist", async()=>{
            let config = {
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json",
                },
            }

            // after "/" you should enter the number that you want to see chat. limit could be something different and when you change the offset other messages will be loaded.  
            await axios
                .get(
                    baseUrl +
                        "customer/905427857477?limit=20&offset=0",
                    config
                )
                .then((res) => {
                    expect(res.status).toBe(200);
                    expect(res.data.success).toBe(true);
                    expect(res.data).toHaveProperty("data");
                    expect(res.data.data).toHaveProperty("messages");
                })
                .catch();

        })
    })
});

