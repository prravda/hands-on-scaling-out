import axios from "axios";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const reqToServer = async () => {
    for (let i = 0; i < 100; i++) {
        await axios.post('http://lb-nginx:4000', {
            body: {
                message: `task no: ${i}`,
            }
        });
        await delay(1_000);
    }
};

reqToServer();