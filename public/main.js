const socket = io();
const messageContainer = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
let myUserId;
let typing = false;
let timeout;

socket.on('clients-total', (total) => {
    document.getElementById('total').innerText = `Total Active Users: ${total}`;
});

socket.on('user-joined', (data) => {
    if (!myUserId) {
        myUserId = data.userId;
    }
    const joinMessage = document.createElement('div');
    joinMessage.innerHTML = `<div class="d-flex justify-content-start mb-4">
                                <div class="user-joined">
                                    <h6>User id ${data.userId} has Joined the Chat</h6>
                                </div>
                             </div>`;
    messageContainer.appendChild(joinMessage);
});

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
});

function sendMessage() {
    if (messageInput.value === '') return;
    const data = {
        name: `User id ${myUserId}`,
        userId: myUserId,
        message: messageInput.value,
        dateTime: new Date()
    };

    socket.emit('message', data);
    sendmessagetoUI(data);
    messageInput.value = "";
    clearTimeout(timeout);
    typing = false;
    socket.emit('feedback', { feedback: '' });
}

socket.on('chat-message', (data) => {
    receivemessagetoUI(data);
});

function sendmessagetoUI(data) {
    clearFeedback();
    const element = document.createElement('div');
    element.innerHTML = `<div class="d-flex justify-content-end mb-4">
                            <div class="msg_cotainer_send">
                                ${data.message}
                                <span class="msg_time">${data.name}, ${moment(data.dateTime).format('h:mm A')}</span>
                            </div>
                            <div class="img_cont_msg">
                                <img src="/images/logo.png" class="rounded-circle user_img_msg" alt="User Image">
                            </div>
                         </div>`;
    messageContainer.appendChild(element);
    scrollToBottom();
}

function receivemessagetoUI(data) {
    clearFeedback();
    const element = document.createElement('div');
    element.innerHTML = `<div class="d-flex justify-content-start mb-4">
                            <div class="img_cont_msg">
                                <img src="/images/logo.png" class="rounded-circle user_img_msg" alt="User Image">
                            </div>
                            <div class="msg_cotainer">
                                ${data.message}
                                <span class="msg_time">${data.name}, ${moment(data.dateTime).format('h:mm A')}</span>
                            </div>
                         </div>`;
    messageContainer.appendChild(element);
    scrollToBottom();
}

function scrollToBottom() {
    messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

function timeoutFunction() {
    typing = false;
    socket.emit('feedback', { feedback: '' });
}

messageInput.addEventListener('keypress', () => {
    if (!typing) {
        typing = true;
        socket.emit('feedback', {
            feedback: `User id ${myUserId} is typing...`
        });
        timeout = setTimeout(timeoutFunction, 3000); // Set timeout for 3 seconds
    } else {
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 3000); // Reset timeout
    }
});

messageInput.addEventListener('blur', () => {
    typing = false;
    socket.emit('feedback', {
        feedback: ''
    });
});

socket.on('feedback', (data) => {
    clearFeedback();
    if (data.feedback) {
        const feedbackMessage = document.createElement('div');
        feedbackMessage.innerHTML = `<div class="d-flex justify-content-start mb-4">
                                        <div class="message-feedback">
                                            <h6>${data.feedback}</h6>
                                        </div>
                                     </div>`;
        messageContainer.appendChild(feedbackMessage);
        scrollToBottom();
    }
});

function clearFeedback() {
    document.querySelectorAll('.message-feedback').forEach(element => {
        element.parentNode.removeChild(element);
    });
}
