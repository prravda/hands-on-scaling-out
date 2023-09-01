import {
    memphis,
    Message
} from 'memphis-dev';

const password: string = 'handsOnMemphis1!';

async function bootstrap() {
    const connection = await memphis.connect({
        host: 'memphis',
        username: 'consumer',
        password
    });
    try {
        const consumer = await connection.consumer({
            stationName: 'scaleout',
            consumerName: 'fixed-comsumer-name',
            consumerGroup: 'consumers',
        });

        consumer.on("message", (message: Message) => {
            console.log(`fixed-comsumer-name got a message: ${Number(message.getData().toString())}`);
            message.ack()
        })
    } catch (e) {
        if (connection) {
            await connection.close();
        }
    }
}

bootstrap();