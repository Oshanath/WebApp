let print = console.log;
let threads;
let threadId = null;
let pageNumber = 1;
let threadsPerPage = 4;
let numberOfPages = 0;

let filter = {
    string: '',
    status: 'all',
    type: 'all'
};

let msgGroup = document.querySelector('.msg-group');

let initNav = () => {

    let numberOfPagesElement = document.querySelector('#numOfPages');
    numberOfPagesElement.textContent = numberOfPages != 0 ? numberOfPages : 1;

    let currentPageElement = document.querySelector('#pageSelector');
    currentPageElement.value = pageNumber;

    //add an event listener for the currentPage element
    currentPageElement.addEventListener("keydown", event => {
        if (event.isComposing || event.keyCode === 13) {
            if(pageNumber != currentPageElement.value){
                pageNumber = currentPageElement.value;
                getThreads();
            }
        }
    }); 

};

let leftRightInit = () => {
//add eventListeners for the left and right buttons
    let leftButton = document.querySelector('#leftButton');
    let rightButton = document.querySelector('#rightButton');

    leftButton.addEventListener('click', event => {
        if(pageNumber > 1){
            pageNumber -= 1;
            getThreads();
        }

    });

    rightButton.addEventListener('click', event => {
        if(pageNumber < numberOfPages){
            pageNumber += 1;
            getThreads();
        }

    });
};

let getThreads = () => {


    msgGroup.innerHTML = '';

    let btnGroup = document.getElementsByClassName('btn-group')[0];
    btnGroup.innerHTML = '';

    fetch('/getThreadData', {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({filter, pageNumber}),
      })
      .then(response => response.json())
      .then(data => {
        threads = data.array;
        numberOfPages = data.numberOfPages;
        initNav();
        initialize(threads);
      })
      .catch((error) => {
        console.log(err);
        window.location.href = '/login';
      });
      
};

let createThreadElement = (thread) => {

    //create and set attributes to the elements
    let msgButton = document.createElement('button');
    msgButton.setAttribute('id', thread._id);

    let msgDiv = document.createElement('div');
    msgDiv.setAttribute('class', 'msg-div');

    //basic display data of the request
    let divSender = document.createElement('div');
    divSender.setAttribute('class', 'item sender');

    let b = document.createElement('b');
    b.innerText = thread.name;

    let divDate = document.createElement('div');
    divDate.setAttribute('class', 'item date');
    
    let smallDate = document.createElement('small');
    let dateAndTime = thread.createdAt.split('T');
    let time = dateAndTime[1].split(':');
    smallDate.innerText = (dateAndTime[0] + ' at ' + time[0] + ':' + time[1]);

    let divType = document.createElement('div');
    divType.setAttribute('class', 'type');

    let smallType = document.createElement('small');
    smallType.innerText = thread.type;

    //append items in order and create the button group
    msgButton.appendChild(msgDiv);
    msgDiv.appendChild(divSender);
    divSender.appendChild(b);
    msgDiv.appendChild(divDate);
    divDate.appendChild(smallDate);
    msgDiv.appendChild(divType);
    divType.appendChild(smallType);

    //add an event listener
    msgButton.addEventListener('click', (event) => {

        //get the selected button and deselect it
        //and select the selected button

        let selectedButton = document.querySelector('.selected.threads');
        if(selectedButton)
            selectedButton.setAttribute('class', '');

        threadId = event.currentTarget.id;
        event.currentTarget.setAttribute('class', 'selected threads');
        
        for(let i = 0; i < threads.length; i++){
            if(threads[i]._id === threadId){
                
                fetch('/getMessages', {
                method: 'POST', // or 'PUT'
                headers: {
                    'Content-Type': 'application/json',
                },
                    body: JSON.stringify({threadId})
                })
                .then(response => response.json())
                .then(data => {

                    //set the reply and accept, decline buttons according to user type
                    //after that displat the message and the buttons together
                    fetch('/getUserType')
                    .then(response => response.json())
                    .then(typeData => { 
                        //display the buttons and messages together to dispose of the delay
                        displayBtn(typeData.type, data.status);
                        displayMessages(data.messages, threadId);
                    }).catch(err => {
                        console.log(err);
                    });     

                })
                .catch((error) => {
                console.error('Error:', error);
                });

                break;
            }
        }
     
    });

    return msgButton;

};

//loading animation overlay
let loadingOverlay = document.querySelector('.overlay');

//initialize button group
let initialize = (arr) => {
    //button group
    let btnGroup = document.getElementsByClassName('btn-group')[0];
    btnGroup.innerHTML = '';

    for (let item = arr.length-1; item >= 0; item--){
        
        btnGroup.appendChild(createThreadElement(arr[item]));

    };

    //remove loading animation after all the threads are loaded
    loadingOverlay.style.display = 'none';

};

//reply button group (reply, accept and decline)
let replyButtons = document.querySelector('.reply-btn-group');

// function to display the messages of the selected thread
let displayMessages = async (arr, msgId) => {

    msgGroup.innerHTML = '';

    let response = await fetch('/getUserId');

    let userId = await response.json();
    
    for (let i=0; i < arr.length; i++){
        let person = arr[i].from;

        let msgContainer = document.createElement('div');
        let msg = document.createElement('p');
        msg.innerText = arr[i].text;
        msgContainer.appendChild(msg);

        //evidence
        let documents = document.createElement('a');
        documents.innerHTML = 'Download documents';
        documents.href = '/downloadDocuments/' + arr[i]._id;
        msgContainer.appendChild(documents);

        if (userId.id === person){
            msgContainer.setAttribute('class', 'reciever');
        }
        else{
            msgContainer.setAttribute('class', 'sender');
        }

        msgGroup.appendChild(msgContainer);
    }

    
};

let closePopup = () => {
    //remove the error msg when canceled
    document.querySelector('.form-control').className = 'form-control';
    popup_reply = document.querySelector('.popup-request-window');
    popup_reply.className = 'popup-request-window';
}

let displayBtn = (type, status) => {

    if(status == 'accepted' || status == 'declined'){
        replyButtons.className = 'reply-btn-group';
    }

    else if (type === 'staff'){
        replyButtons.className = 'reply-btn-group visible';
    }
    else if (type === 'student'){
        replyButtons.className = 'reply-btn-group';
        replyButton.className = 'replyBtn visible';
    }
};


let initTablinkButtons = () => {
    //add eventlisteners to tablink buttons
    let tablinks = document.querySelectorAll('.tablinks');

    tablinks.forEach(tablinkButton => {
        
        tablinkButton.addEventListener('click', event => {
            replyButtons.className = 'reply-btn-group';
            pageNumber = 1;
            filter.status = event.currentTarget.getAttribute('id');
            getThreads();
        });

    });

};


let initializePage = () => {

    getThreads();
    leftRightInit();
    initTablinkButtons();

    //setting the event listener for the reply button
    let replyButton = document.querySelector('.replyBtn');
    replyButton.addEventListener('click', (event) => {
        popup_reply = document.querySelector('.popup-request-window');
        popup_reply.className = 'popup-request-window visible';
    });

    //setting up the event listener for the reply cancel button
    let replyCancelButton = document.querySelector('.close-button-request');
    replyCancelButton.addEventListener('click', (event) => {
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

    //setting the event listener for the decline button
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

    //  setting the keypress event listener for the search bar and a click listener
    // for the search icon button
    let searchButton = document.querySelector('.searchButton');
    let searchText = document.querySelector('.searchText');
    searchButton.addEventListener('click', (event) => {
        
        filter.string = searchText.value;
        getThreads();
        
        
    });

    searchText.addEventListener("keyup", event => {
        // if (event.isComposing || event.keyCode === 13) {
          searchButton.click();
        // }
        // do something
      });   

};

//page loading animation
// let loadingOverlay = document.querySelector('.overlay');
// let displayLoadingScreen = () => {
//     loadingOverlay.style.display = 'none';
// };
// window.addEventListener('load', displayLoadingScreen);

initializePage();