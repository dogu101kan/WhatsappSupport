
const sortMessages = (messages)=>{
    const sortedMessages = messages.sort((a, b) => {
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        return aDate - bDate;
      });
    
      return sortedMessages
}

module.exports = {
    sortMessages
}