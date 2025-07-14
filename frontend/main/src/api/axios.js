import axios from 'axios';

const instance = axios.create({
    baseURL: "http://localhost:3001",
    withCredentials: true, // Важно для отправки кук с каждым запросом
});

export default instance;