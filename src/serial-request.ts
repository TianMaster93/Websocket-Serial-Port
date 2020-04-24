import * as http from 'http';
import * as url from 'url';
import * as SerialPort from 'serialport';

export class SerialRequest {

    static Open(request: http.IncomingMessage) {
        const queryParams = url.parse(request.url).query.split('&');
        const option = <SerialPort.OpenOptions> {};
        let port;
    
        queryParams.forEach( queryPairs => {
            if (queryPairs.startsWith('port=')) {
                port = queryPairs.replace('port=', '');
                return;
            }
            this.CopyOptionTag(queryPairs, option);
        });

        return this.GetSerialPort(port, option);
    }

    private static CopyOptionTag(queryPairs: string, output: any) {
        if (!queryPairs) {
            return;
        }
        const parts  = queryPairs.split('=');
        const name   = decodeURI(parts[0]);
        const sValue = decodeURI(parts[1]);
        const nValue = parseInt(sValue);
        const value  = isNaN(nValue) ? sValue : nValue;

        if (name && value) {
            output[name] = value;
        }
    }

    private static GetSerialPort(port: string, options: SerialPort.OpenOptions) {
        options.autoOpen = false;

        return new Promise<SerialPort>((resolve, reject) => {
            const serialPort = new SerialPort(port, options);
            
            serialPort.open((err?) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(serialPort);
                }
            });
        });
    }
}