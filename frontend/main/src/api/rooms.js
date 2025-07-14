
import axios from './axios';
class Rooms {

    async getRooms() {
        const rooms = await axios.get("/api/rooms")
        return rooms;
    }
    async createRoom(name) {
        const room = await axios.post("/api/rooms", {
            name: name
        })

        /* {
  "message": "Room created successfully",
  "roomName": "room"
} */
        return room;
    }

    async getToken(roomName) {
        const token = await axios.get(`/api/rooms/${roomName}`);
        return token;
    }

    async getParticipants(roomName) {
        const users = await axios.get(`/api/rooms/${roomName}/participants`);
        return users;
    }
}

export default new Rooms();