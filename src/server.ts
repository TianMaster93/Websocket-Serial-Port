import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { Socket } from 'net';
import { SerialRequest } from './serial-request';
import * as SerialPort from 'serialport';
import { ResultDTO } from './result-dto';

const PORT   = 12345;
const app    = express();
const server = http.createServer(app);
const wss    = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request: http.IncomingMessage, socket: Socket, head: Buffer) => {
    wss.handleUpgrade(request, socket, head, async (wsInput) => {
        try {
            const serialPort = await SerialRequest.Open(request);
            wss.emit('connection', wsInput, serialPort);
        } catch (error) {
            wsInput.send(ResultDTO.ToJson(false, error.message));
            wsInput.close();
        }
    });
});

wss.on('connection', (wsInput: WebSocket, serialPort: SerialPort) => {
    
    serialPort.on('data', (data: Buffer) => {
        wsInput.send(ResultDTO.ToJson(true, data));
    })

    serialPort.on('error', (error: TypeError) => {
        wsInput.send(ResultDTO.ToJson(false, Buffer.from(error.message)));
    });

    serialPort.on('close', () => {
        wsInput.send(ResultDTO.ToJson(false, Buffer.from('SERIAL PORT IS DISCONNECTED')));
        wsInput.close();
    })

    wsInput.send(ResultDTO.ToJson(true, Buffer.from(serialPort.path)));

    wsInput.onmessage = (event) => {
        const bytes = JSON.parse(<string> event.data);
        serialPort.write(bytes);
    };

    wsInput.onclose = () => {
        if (serialPort.isOpen) {
            serialPort.close();
        }
    };
});

server.listen(PORT, () => {
    console.log(`SERVER STARTED. PORT ${PORT}`);
});