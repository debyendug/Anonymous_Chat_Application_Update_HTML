let username = "";
  let isModerator1 = false;
while (!username || username.trim() === "") {
  username = prompt("Enter your name:");
  if (username === null) {
    alert("You are not allowed to enter this CHAT ROOM. Please refresh the page.");
    throw new Error("User cancelled name entry");
  } else if (!username || username.trim() === "") {
    alert("You must enter a name to join the chat.");
  }
}
  
function setDefaultBackground() {
    document.body.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  document.body.style.backgroundAttachment = "fixed";
  document.body.style.backgroundSize = "cover";
}
function getTrimmedCustName(name) {
  const userName = name
    .trim()
    .split(/\s+/)              // split by one or more spaces
    .map(word => word[0])      // take first letter of each word
    .join('');                 // join them together

  return userName.toUpperCase()
}
function generateId() {
  return ''+ Math.random().toString(36).substr(2, 9);
}

  //const ws = new WebSocket("ws://localhost:8888");
// const ws = new WebSocket("wss://your-server-url");
const ws = new WebSocket("wss://secret-chat-application-we1g.onrender.com");
// const ws = new WebSocket("wss://your-server-url");

const chat = document.getElementById("chat");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("send");
const editNameInput = document.getElementById("edit-name");
const changeNameBtn = document.getElementById("change-name");
 
 const UnqID = generateId().toUpperCase();
 const fnalUserName = getTrimmedCustName(username) + "_" + UnqID;  
 //const uniqueID = generateId();

document.getElementById("user-info").innerText = `User Name: ${fnalUserName}`;

 changeNameBtn.addEventListener("click", () => {
    const newName = editNameInput.value.trim();
    if (newName) {
      username = newName; 
      const editNameValue = getTrimmedCustName(newName)  + "_" + UnqID;// update global username
      document.getElementById("user-info").innerText  = `User Name: ${editNameValue}`;

      // Show in chat area
      chat.innerHTML += `<p><em>You changed your name to ${username}</em></p>`;

      // Notify server
      ws.send(JSON.stringify({ type: "name_change", user: username }));
      editNameInput.value = "";
    } else {
      alert("Please enter a valid name before changing.");
    }
  });

ws.onopen = () => {
  ws.send(JSON.stringify({ type: "join_request", user: username }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

if (data.type === "approved") {
   chat.innerHTML += `<p><em>${username} joined the chat</em></p>`;

      }
  else if( data.type === "rejected") 
    {
        alert("Your request was rejected by the moderator.");
        throw new Error("Access denied")
    }

  else if (data.type === "message") 
    {
    const msg = document.createElement("div");
    msg.className = data.user === username ? "message-own" : "message-other";
    msg.innerText = `${data.user}: ${data.text}`;
    chat.appendChild(msg);
  }   
   else if (data.type === "join") 
    {
         const joinMsg = document.createElement("p");
    chat.innerHTML += `<p><em>${data.user} joined the chat</em></p>`;
     chat.appendChild(joinMsg);
    
  }   
  else if(data.type === "join_request")
  {
      if (isModerator1) {
          const approve = confirm(`${data.user} wants to join. Approve?`);
          if (approve) {
            ws.send(JSON.stringify({ type: "approve", user: data.user }));
          } else {
            ws.send(JSON.stringify({ type: "reject", user: data.user }));
          }
        }
  }
  else if (data.type === "name_change") 
    {
         const NameCng = document.createElement("p");
    chat.innerHTML += `<p><em>${data.user} changed name</em></p>`;
     chat.appendChild(NameCng);
  } 
  else if (data.type === "typing") 
    {
    document.getElementById("typing").innerText = `${data.user} is typing...`;
    setTimeout(() => { document.getElementById("typing").innerText = ""; }, 2000);
  }
  else if (data.type === "moderator") 
    {
      const modMsg = document.createElement("p");
    modMsg.innerHTML = `<em>You are the moderator</em>`;
    isModerator1 = true;
    chat.appendChild(modMsg);
  } 
  chat.scrollTop = chat.scrollHeight;
};

sendButton.onclick = () => {
  const message = messageInput.value;
  if (message) {
    ws.send(JSON.stringify({ type: "message", user: username, text: message }));
    messageInput.value = "";
  }
};

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendButton.click();
  }
});

messageInput.addEventListener("input", () => {
  ws.send(JSON.stringify({ type: "typing", user: username }));
});

// Profile image upload/remove
const profileUpload = document.getElementById("profile-upload");
const profileImg = document.getElementById("profile-img");
const removeProfileBtn = document.getElementById("remove-profile");

profileUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profileImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
    removeProfileBtn.classList.remove("d-none");
  }
});

removeProfileBtn.addEventListener("click", () => {
  profileImg.src = "/Image/Avtar_imag.jpg";
  removeProfileBtn.classList.add("d-none");
  profileUpload.value = "";
});

// Background upload/remove
const bgUpload = document.getElementById("bg-upload");
const removeBgBtn = document.getElementById("remove-bg");
//console.log("going to insert Image");

bgUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      // ✅ Replace full background
      document.body.style.background = `url('${e.target.result}') no-repeat center center fixed`;
      document.body.style.backgroundSize = "cover";

      removeBgBtn.classList.remove("d-none"); // show remove button
      console.log("Background updated with uploaded image");
    };
    reader.readAsDataURL(file);
  }
});

removeBgBtn.addEventListener("click", () => {
  setDefaultBackground(); // reset to gradient or default image
  removeBgBtn.style.display = "none"; // hide button again
  bgUpload.value = ""; // clear file input
});

// setDefaultBackground();
