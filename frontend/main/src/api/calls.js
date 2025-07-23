
import axios from './axios';
class Calls {

    async callUserByUID(uid) {
        const response = await axios.post('/api/rooms/call', { name: `call_${uid}`, typeRoom: "private", acceptUsers: [uid] });
        return response.data;
    }
}

export default new Calls();