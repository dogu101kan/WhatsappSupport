const asyncErrorWrapper = require("express-async-handler");
const { hasFixedSetter, allFixedSetter, editMessageDetails, getMessageDetails, hasMarkedSetter, editTopics, getTopics, getSubTopics } = require("../helpers/db");
const { saveMessageForAPI } = require("../helpers/db");
const { base64Split } = require("../helpers/base64");
const { checkDataSize } = require("../helpers/file");
////////////////////////////////
const CustomError = require("../helpers/error/CustomError");
const { MessageMedia } = require('whatsapp-web.js');
///////////////////////////////

const sendMessage = asyncErrorWrapper(async(req, res) => {

  const data = req.body
  let message;
  let client = req.app.get("client1");

  try {
    if(data.file!==undefined && data.file.media!==null){
      const mediadata= await base64Split(data.file.media, data.file.filename);
      if(!checkDataSize(mediadata.data)) throw new CustomError("Dosya boyutu 10mb'tan fazla.", 400);
      const media = new MessageMedia(mediadata.mimetype, mediadata.data, data.file.filename);
      client.sendMessage(`${data.selectedPhone}@c.us`, media);
      data.file.mediaType = mediadata.mimetype;
      data.file.media = mediadata.data;
    }
    client.sendMessage(`${data.selectedPhone}@c.us`, data.message)

    message = await saveMessageForAPI(data);

  } catch (err) {
    throw new CustomError(err, 500)
  }
  res.status(200).json({
    success:true,
    data:message
  })
});

const messageHasFixed = asyncErrorWrapper(async(req, res) => {
  const {id} = req.params;

  
  const message = await hasFixedSetter(id);

  res.status(200).json({
    success:true,
    data:message
  })
})

const messagehasMarked = asyncErrorWrapper(async(req, res) => {
  const {id} = req.params;

  
  const message = await hasMarkedSetter(id);

  res.status(200).json({
    success:true,
    data:message
  })
})

const allMessageHasFixed = asyncErrorWrapper(async(req, res) => {
  const {id} = req.params;
  console.log(id)

  const message = await allFixedSetter(id);

  res.status(200).json({
    success:true,
    data:message
  })
})

// const editMessageDetails = asyncErrorWrapper(async(req, res)=>{
  
//   const messageDetails = messageDetails 

// })

const editMessageDetailsController = asyncErrorWrapper(async(req, res)=>{

  const chat = await editMessageDetails(req)

  res.status(200).json({
    success:true,
    data:chat
  });

})

const getMessageDetailsController = asyncErrorWrapper(async(req, res)=>{

  let messageDetails;

  messageDetails = await getMessageDetails(req)

  res.status(200).json({
    success:true,
    data:messageDetails
  });

})

const editMessageTopics = asyncErrorWrapper(async(req, res)=>{

  let messageDetails;

  messageDetails = await editTopics(req)

  res.status(200).json({
    success:true,
    data:messageDetails
  });

})


const getTopicsController = asyncErrorWrapper(async(req, res)=>{

 
  let topic = await getTopics();

  res.status(200).json({
    success:true,
    data:topic 

  });

})

const getSubTopicsController = asyncErrorWrapper(async(req, res)=>{

 
  let subtopic = await getSubTopics();

  res.status(200).json({
    success:true,
    data:subtopic 

  });

})

const test = asyncErrorWrapper(async(req, res)=>{

 
  let topic = await getSubTopics();

  res.status(200).json({
    success:true,
    data:topic 

  });

})




module.exports = {
    sendMessage,
    messageHasFixed,
    messagehasMarked,
    allMessageHasFixed,
    editMessageDetailsController,
    getMessageDetailsController,
    editMessageTopics,
    getTopicsController,
    getSubTopicsController,
    test
}