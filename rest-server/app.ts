import express from 'express';
import bodyParser from 'body-parser';
import {
    Request,
    Response,
} from "express";

const app = express();
app.use(bodyParser.json())

app.post('/', (req: Request, res: Response) => {
    const body = req.body
    console.log(body);
    res.send(body);
});

app.listen(3000);

