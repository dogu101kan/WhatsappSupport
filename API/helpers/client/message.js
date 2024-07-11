const client = require("./index");

const sendMessagee = async(number, message)=>{
  let msg;
    try {
        msg = await client.sendMessage(`${number}@c.us`, message);
    } catch (error) {
        console.log(error)
    }
    return msg;
}

  module.exports = {
    sendMessagee
  }