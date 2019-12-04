const inputSendData   = document.getElementById('send-data');
const preReceivedData = document.getElementById('received-data');
const WS_URL = 'ws://localhost:12345';
let SOCKET;

function connection(event) {
    event.preventDefault();
    const form   = document.forms[0];
    const inputs = form.querySelectorAll('input');
    const btnCon = form.querySelector('#btn-conecction');
    let query    = WS_URL + '?';

    inputs.forEach( input => {
        if (input.value) {
            query += input.name + '=' + encodeURI(input.value) + '&';
        }
    });

    console.log(query);
    SOCKET = new WebSocket(query);
    btnCon.disabled = true;

    SOCKET.onopen = (event) => {
        console.log('onopen', event);
    };

    SOCKET.onmessage = (event) => {
        const resultDTO = JSON.parse(event.data);
        const buffer    = resultDTO.result;
        const u8Array   = Uint8Array.from(buffer.data);
        const utf8Value = new TextDecoder().decode(u8Array);
        preReceivedData.innerText += event.data + '\r\n';
        preReceivedData.innerText += 'UTF-8 DECODE: ' + utf8Value + '\r\n';
    };

    SOCKET.onclose = (event) => {
        btnCon.disabled = false;
        console.log(event);
    };

    SOCKET.onerror = (error) => {
        console.error(error);
    };
}

function sendMessage() {
    if (!SOCKET || SOCKET.readyState !== WebSocket.OPEN) {
        console.error('SOCKET IS CLOSED');
        return;
    }
    SOCKET.send(JSON.stringify(inputSendData.value));
}

function disconnect() {
    if (!SOCKET || SOCKET.readyState !== WebSocket.OPEN) {
        console.error('SOCKET IS CLOSED');
        return;
    }
    SOCKET.close();
}