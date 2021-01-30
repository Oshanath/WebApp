let threads;
let threadId = null;

fetch('/getThreadData')
.then(response => response.json())
.then(data => {
    // console.log(data);
    threads = data;
    initialize(data);
}).catch(err => {
    console.log(err);
    window.location.href = '/login';
});


let initialize = (arr) => {
    //button group
    let btnGroup = document.getElementsByClassName('btn-group')[0];

    for (let item = arr.length-1; item >= 0; item--){
        //create and set attributes to the elements
        let msgButton = document.createElement('button');
        msgButton.setAttribute('id', arr[item]._id);

        let msgDiv = document.createElement('div');
        msgDiv.setAttribute('class', 'msg-div');

        //basic display data of the request
        let divSender = document.createElement('div');
        divSender.setAttribute('class', 'item sender');

        let b = document.createElement('b');
        b.innerText = arr[item].name;

        let divDate = document.createElement('div');
        divDate.setAttribute('class', 'item date');
        
        let smallDate = document.createElement('small');
        let dateAndTime = arr[item].createdAt.split('T');
        let time = dateAndTime[1].split(':');
        smallDate.innerText = (dateAndTime[0] + ' at ' + time[0] + ':' + time[1]);

        let divType = document.createElement('div');
        divType.setAttribute('class', 'type');

        let smallType = document.createElement('small');
        smallType.innerText = arr[item].type;

        //append items in order and create the button group
        btnGroup.appendChild(msgButton);
        msgButton.appendChild(msgDiv);
        msgDiv.appendChild(divSender);
        divSender.appendChild(b);
        msgDiv.appendChild(divDate);
        divDate.appendChild(smallDate);
        msgDiv.appendChild(divType);
        divType.appendChild(smallType);

        //add an event listener
        msgButton.addEventListener('click', (event) => {
            threadId = event.currentTarget.id;
            
            for(let i = 0; i < threads.length; i++){
                if(threads[i]._id === threadId){
                    let messageIdList = threads[i].messageID_list;
                    let messages = [];
                    
                    fetch('/getMessages', {
                    method: 'POST', // or 'PUT'
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({threadId})
                    })
                    .then(response => response.json())
                    .then(data => {
                        display(data.messages, threadId);
                    })
                    .catch((error) => {
                    console.error('Error:', error);
                    });

                    break;
                }
            }

            fetch('/getUserType')
                .then(response => response.json())
                .then(data => {
                    displayBtn(data.type);
                }).catch(err => {
                    console.log(err);
                });          
        });

    };

};

let msgGroup = document.querySelector('.msg-group');

let display = (arr, msgId) => {

    msgGroup.innerHTML = '';
    
    for (let i=0; i < arr.length; i++){
        let person = arr[i].from;

        let msgContainer = document.createElement('div');
        let msg = document.createElement('p');
        msg.innerText = arr[i].text;

        msgContainer.appendChild(msg);

        if (msgId === person){
            msgContainer.setAttribute('class', 'sender');
        }
        else{
            msgContainer.setAttribute('class', 'reciever');
        }

        msgGroup.appendChild(msgContainer);
    }

    
};

//setting the event listener for the reply button
let replyButton = document.querySelector('.replyBtn');
replyButton.addEventListener('click', (event) => {
    popup_reply = document.querySelector('.popup-request-window');
    popup_reply.className = 'popup-request-window visible';
});

let closePopup = () => {
    popup_reply = document.querySelector('.popup-request-window');
    popup_reply.className = 'popup-request-window';
}

let replyCancelButton = document.querySelector('.close-button-request');
replyCancelButton.addEventListener('click', (event) => {
    closePopup();
});

//reply submit button
let replySubmitButton = document.querySelector('#replySubmitButton');
replySubmitButton.addEventListener('click', (event) => {

    let text = document.getElementById('textarea').value;

    fetch('/reply', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({text, threadId})
        })
        .then(response => response.json())
        .then(data => {
            display(data.messages, threadId);
        })
        .catch((error) => {
        console.error('Error:', error);
        });

        closePopup();

});

//setting the event listener for the accept button
let acceptButton = document.getElementById('acceptButton');
if(acceptButton != null)
    acceptButton.addEventListener('click', (event) => {

        data = {
            'threadId': threadId,
            'status': 'accepted'
        }

        fetch('/acceptOrDeclineRequest', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            location.reload();
        })
        .catch((error) => {
        console.error('Error:', error);
        });
    });

let declineButton = document.getElementById('declineButton');
if(declineButton != null)
    declineButton.addEventListener('click', (event) => {

    data = {
        'threadId': threadId,
        'status': 'declined'
    }

    fetch('/acceptOrDeclineRequest', {
    method: 'POST', // or 'PUT'
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        location.reload();
    })
    .catch((error) => {
    console.error('Error:', error);
    });
});

//reply button group
let replyButtons = document.querySelector('.reply-btn-group');

let displayBtn = (type) => {
    if (type === 'staff'){
        replyButtons.className = 'reply-btn-group visible';
    }
    else if (type === 'student'){
        replyButtons.className = 'reply-btn-group';
        replyButton.className = 'replyBtn visible';
    }
};