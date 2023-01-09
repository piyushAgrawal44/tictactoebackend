const http=require("http");
const express =require("express");
const cors = require("cors");
const socketIO = require("socket.io");


const app=express();
const port= 8000 || process.env.PORT;
// const port= 8000;
app.get('/', (req, res) => {
  res.sendStatus(200)
})
app.use(cors());
app.get("/",(req, res)=>{
    res.sendStatus(200);
    res.send("<h1>Server is working with perfection</h1>");
})
const server=http.createServer(app);
const io=socketIO(server, {
    cors: {
      origin: "http://localhost:3000",
    }
  });
let users=[],onlineUsers=[],count=0;

io.on("connection",(socket)=>{
    // user joined
    socket.on('user-joined', ({myUsername,opponentUsername })=>{

      socket.broadcast.emit('newuser', {username: myUsername});
      let opponentLive=false;
      for (let i = 0; i < onlineUsers.length; i++) {
        const element = onlineUsers[i];
        
        if(element !==myUsername){
          users[socket.id]=myUsername;
          onlineUsers[count]=myUsername; 
        }
      
        if(element===opponentUsername){
          opponentLive=true;
        }
      }

      if(onlineUsers.length===0){
          users[socket.id]=myUsername;
          onlineUsers[count]=myUsername;
      }

      if (opponentLive) {
        socket.emit('welcome', {user: 'admin', message:`${opponentUsername} is live`,opponentActive:true});
      } else {
        socket.emit('welcome', {user: 'admin', message:`${opponentUsername} is not live`,opponentActive:false});
      }


      count++; 
    }); 
    
    
    // user playing
    socket.on('processing-turn', ({boxId , userName,matchId})=>{
      io.sockets.emit('current-turn', {boxId:boxId,opponentUsername: userName, matchId:matchId});
    });
    // user leaving
    socket.on('disconnect', ()=>{
        count --;
        let leavingUsername=users[socket.id];
       
        onlineUsers=onlineUsers.filter((userName)=>{
          return userName !==leavingUsername;
        });
        
        delete users[socket.id];
      
        if (count<0) {
            count=0;
        } 

        io.sockets.emit('leave', {opponentUsername: leavingUsername});
    });

});

server.listen(port,(e)=>{
    // http://localhost:8000
    console.log("server is working with perfection");
})