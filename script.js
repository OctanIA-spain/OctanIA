// Configura tu URL del backend de Cloud Run y tu client_id de Google
const API_URL = "https://gpt-chat-701854763837.europe-west1.run.app/chat";
const GOOGLE_CLIENT_ID = "TU_GOOGLE_CLIENT_ID"; // <-- reemplázalo por el real

let idToken = null;
let messages = [];

function handleCredentialResponse(response) {
  idToken = response.credential;

  // Probar si el usuario tiene acceso
  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`
    },
    body: JSON.stringify({ mensajes: [{ role: "user", content: "Hola" }] })
  })
  .then(res => {
    if (res.status === 403) {
      alert("No estás autorizado para usar este asistente.");
    } else {
      document.getElementById("login-container").style.display = "none";
      document.getElementById("chat-container").style.display = "block";
    }
  })
  .catch(err => {
    alert("Error al verificar acceso: " + err.message);
  });
}

window.onload = function () {
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse
  });

  google.accounts.id.renderButton(
    document.getElementById("g_id_signin"),
    { theme: "outline", size: "large" }
  );
};

// Chat handler
const chatForm = document.getElementById("chat-form");
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

function addMessage(role, content) {
  const msgDiv = document.createElement("div");
  msgDiv.className = "message " + (role === "user" ? "user" : "bot");
  msgDiv.innerText = content;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = userInput.value.trim();
  if (!userMessage || !idToken) return;

  addMessage("user", userMessage);
  userInput.value = "";
  messages.push({ role: "user", content: userMessage });

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`
    },
    body: JSON.stringify({ mensajes: messages }),
  });

  const data = await res.json();
  const botMessage = data.respuesta;
  addMessage("bot", botMessage);
  messages.push({ role: "assistant", content: botMessage });
});