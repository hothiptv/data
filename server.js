const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Phục vụ file tĩnh từ thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// Định tuyến các trang
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/view', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view.html'));
});

// Xử lý kết nối Socket.io real-time
io.on('connection', (socket) => {
    console.log('Có thiết bị kết nối:', socket.id);

    // Khi máy hiển thị tham gia vào một phòng (Room)
    socket.on('join-room', (roomName) => {
        socket.join(roomName);
        console.log(`Thiết bị vào phòng hiển thị: ${roomName}`);
    });

    // Khi máy mobile ấn "Run" gửi code lên
    socket.on('send-code', (data) => {
        const { roomName, htmlCode } = data;
        // Gửi code này tới tất cả các máy trong phòng đó
        io.to(roomName).emit('update-code', htmlCode);
        console.log(`Đã cập nhật code cho phòng: ${roomName}`);
    });

    socket.on('disconnect', () => {
        console.log('Thiết bị ngắt kết nối:', socket.id);
    });
});

// Chạy server ở cổng môi trường (Render yêu cầu) hoặc 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server đang chạy tại port: ${PORT}`);
});
