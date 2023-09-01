import { memphis } from 'memphis-dev';

const password: string = 'handsOnMemphis1!';
async function bootstrap() {
    const connection = await memphis.connect({
        host: 'memphis',
        username: 'producer',
        password,
    });
    try {
        const producer = await connection.producer({
            stationName: 'scaleout',
            producerName: 'fixed-producer-name',
        });
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        for (let i = 0; i <= 10; i++) {
            await producer.produce({
                message: Buffer.from(`${i}`),
            });
            await delay(1_000);
        }
    } catch (e) {
        if (connection) {
            await connection.close();
        }
    }
}

bootstrap();