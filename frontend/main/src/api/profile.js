
import axios from './axios';
class Profile {

    async getProfileByUID(uid) {
        const response = await axios.get(`/api/profile/${uid}`);
        return response.data;
    }
}

export default new Profile();