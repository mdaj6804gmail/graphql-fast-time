let io;
module.exports = {
  init: (server) => {
    io = require("socket.io")(server, {
      // path: "/posts",
      cors: {
        origin: "http://localhost:3000",
      },
    });
    console.log(`socket connected`);
    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error("Socket Not connect");
    }
    return io;
  },
};
