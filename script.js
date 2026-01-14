// ------ Set Theme Based on User Preference ------
(function setTheme() {
  const lockScreen = document.getElementById("lock-screen");
  const selectedTheme = localStorage.getItem("selected-theme") || "light";
  lockScreen.classList.add(selectedTheme === "dark" ? "dark" : "light");
})();
// ------ Pattern Canvas Initialization with Dynamic Sizing ------
function initPatternCanvas(canvas, callback) {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  // Dynamically calculate grid positions (3x3) so the dots are centered.
  const marginX = width * 0.1666;         // roughly 50px for a 300px canvas
  const marginY = height * 0.1666;
  const gapX = (width - 2 * marginX) / 2;
  const gapY = (height - 2 * marginY) / 2;
  const tolerance = 30; // touch tolerance
  const nodes = [
    { id: 1, x: marginX, y: marginY, r: 4.5 },
    { id: 2, x: marginX + gapX, y: marginY, r: 4.5 },
    { id: 3, x: marginX + gapX * 2, y: marginY, r: 4.5 },
    { id: 4, x: marginX, y: marginY + gapY, r: 4.5 },
    { id: 5, x: marginX + gapX, y: marginY + gapY, r: 4.5 },
    { id: 6, x: marginX + gapX * 2, y: marginY + gapY, r: 4.5 },
    { id: 7, x: marginX, y: marginY + gapY * 2, r: 4.5 },
    { id: 8, x: marginX + gapX, y: marginY + gapY * 2, r: 4.5 },
    { id: 9, x: marginX + gapX * 2, y: marginY + gapY * 2, r: 4.5 }
  ];
  let pattern = [];
  let drawing = false;
  let currentPos = null;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      if (pattern.includes(node.id)) {
        ctx.fillStyle = "white";
        ctx.fill();
      } else {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }
    });
    if (pattern.length > 0) {
      ctx.beginPath();
      const firstNode = nodes.find(n => n.id === pattern[0]);
      ctx.moveTo(firstNode.x, firstNode.y);
      pattern.slice(1).forEach(id => {
        const node = nodes.find(n => n.id === id);
        ctx.lineTo(node.x, node.y);
      });
      if (currentPos) {
        ctx.lineTo(currentPos.x, currentPos.y);
      }
      ctx.strokeStyle = "white";
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  }
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  }
  function pointerDown(e) {
    drawing = true;
    pattern = [];
    currentPos = getPos(e);
    nodes.forEach(node => {
      if (Math.hypot(currentPos.x - node.x, currentPos.y - node.y) < (node.r + tolerance)) {
        if (!pattern.includes(node.id)) {
          pattern.push(node.id);
          if (navigator.vibrate) navigator.vibrate(50);
        }
      }
    });
    draw();
  }
  function pointerMove(e) {
    if (!drawing) return;
    currentPos = getPos(e);
    nodes.forEach(node => {
      if (!pattern.includes(node.id) && Math.hypot(currentPos.x - node.x, currentPos.y - node.y) < (node.r + tolerance)) {
        pattern.push(node.id);
        if (navigator.vibrate) navigator.vibrate(50);
      }
    });
    draw();
  }
  function pointerUp(e) {
    drawing = false;
    currentPos = null;
    draw();
    if (callback) callback(pattern);
  }
  canvas.addEventListener("mousedown", pointerDown);
  canvas.addEventListener("mousemove", pointerMove);
  canvas.addEventListener("mouseup", pointerUp);
  canvas.addEventListener("touchstart", pointerDown);
  canvas.addEventListener("touchmove", pointerMove);
  canvas.addEventListener("touchend", pointerUp);
  draw();
}
// Utility: update the PIN display element based on entered value and visibility.
function updateDisplay(displayEl, pinValue, isVisible) {
  let html = "";
  const maxDigits = 4;
  for (let i = 0; i < maxDigits; i++) {
    if (i < pinValue.length) {
      html += isVisible 
        ? `<span class="digit visible-digit">${pinValue[i]}</span>`
        : `<span class="digit hidden-digit" style="background-color:#00cfe8;"></span>`;
    } else {
      html += `<span class="digit hidden-digit"></span>`;
    }
  }
  displayEl.innerHTML = html;
}
// SVG icons for the eye toggle button.
const eyeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <path d="M12.015 7c4.751 0 8.063 3.012 9.504 4.636-1.401 1.837-4.713 5.364-9.504 5.364-4.42 0-7.93-3.536-9.478-5.407 1.493-1.647 4.817-4.593 9.478-4.593zm0-2c-7.569 0-12.015 6.551-12.015 6.551s4.835 7.449 12.015 7.449c7.733 0 11.985-7.449 11.985-7.449s-4.291-6.551-11.985-6.551zm-.015 5c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2zm0-2c-2.209 0-4 1.792-4 4 0 2.209 1.791 4 4 4s4-1.791 4-4c0-2.208-1.791-4-4-4z"/>
</svg>`;
const eyeOffIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <path d="M19.604 2.562l-3.346 3.137c-1.27-.428-2.686-.699-4.243-.699-7.569 0-12.015 6.551-12.015 6.551s1.928 2.951 5.146 5.138l-2.911 2.909 1.414 1.414 17.37-17.035-1.415-1.415zm-6.016 5.779c-3.288-1.453-6.681 1.908-5.265 5.206l-1.726 1.707c-1.814-1.16-3.225-2.65-4.06-3.66 1.493-1.648 4.817-4.594 9.478-4.594.927 0 1.796.119 2.61.315l-1.037 1.026zm-2.883 7.431l5.09-4.993c1.017 3.111-2.003 6.067-5.09 4.993zm13.295-4.221s-4.252 7.449-11.985 7.449c-1.379 0-2.662-.291-3.851-.737l1.614-1.583c.715.193 1.458.32 2.237.32 4.791 0 8.104-3.527 9.504-5.364-.729-.822-1.956-1.99-3.587-2.952l1.489-1.46c2.982 1.9 4.579 4.327 4.579 4.327z"/>
</svg>`;
document.addEventListener("DOMContentLoaded", () => {
  // Retrieve screens and UI elements.
  const lockScreen = document.getElementById("lock-screen")
  const setupScreen = document.getElementById("setup-screen");
  const pinSetupScreen = document.getElementById("pin-setup-screen");
  const patternSetupScreen = document.getElementById("pattern-setup-screen");
  const pinLoginScreen = document.getElementById("pin-login-screen");
  const patternLoginScreen = document.getElementById("pattern-login-screen");
  const choosePinBtn = document.getElementById("choose-pin");
  const choosePatternBtn = document.getElementById("choose-pattern");
  const pinSetupInput = document.getElementById("pin-setup-input");
  const savePinBtn = document.getElementById("save-pin-btn");
  const pinLoginInput = document.getElementById("pin-login-input");
  const pinLoginBtn = document.getElementById("pin-login-btn");
  const savePatternBtn = document.getElementById("save-pattern-btn");
  const patternSetupCanvas = document.getElementById("pattern-setup-canvas");
  const patternLoginCanvas = document.getElementById("pattern-login-canvas");
  const successMessage = document.getElementById("success-message");
  const homePage = document.querySelector(".homepage");
  
  const errorMessage = document.getElementById("error-message");
  let setupPattern = null;
  let enteredPattern = [];
  let pinSetupVisible = false;
  let pinLoginVisible = false;
  const storedPin = localStorage.getItem("userPin");
  const storedPattern = localStorage.getItem("userPattern");
  // If a lock is already set, show the corresponding login screen.
  if (storedPin || storedPattern) {
    setupScreen.classList.add("hidden");
    if (storedPin) {
      pinLoginScreen.classList.remove("hidden");
      updateDisplay(document.getElementById("pin-login-display"), "", pinLoginVisible);
    } else {
      patternLoginScreen.classList.remove("hidden");
      initPatternCanvas(patternLoginCanvas, (pattern) => {
        const saved = JSON.parse(localStorage.getItem("userPattern"));
        if (JSON.stringify(pattern) === JSON.stringify(saved)) {
          handleSuccess();
        } else {
          enteredPattern = pattern;
        }
      });}}
  choosePinBtn.addEventListener("click", () => {
    setupScreen.classList.add("hidden");
    pinSetupScreen.classList.remove("hidden");
    updateDisplay(document.getElementById("pin-display"), "", pinSetupVisible);
  });
  choosePatternBtn.addEventListener("click", () => {
    setupScreen.classList.add("hidden");
    patternSetupScreen.classList.remove("hidden");
    initPatternCanvas(patternSetupCanvas, (pattern) => {
      setupPattern = pattern;
    });
  });
  // Back buttons for PIN and Pattern setup screens.
  const backBtnPin = document.getElementById("back-btn-pin");
  if (backBtnPin) {
    backBtnPin.addEventListener("click", () => {
      pinSetupInput.value = "";
      updateDisplay(document.getElementById("pin-display"), "", pinSetupVisible);
      pinSetupScreen.classList.add("hidden");
      setupScreen.classList.remove("hidden");
    });
  }
  const backBtnPattern = document.getElementById("back-btn-pattern");
  if (backBtnPattern) {
    backBtnPattern.addEventListener("click", () => {
      setupPattern = null;
      patternSetupScreen.classList.add("hidden");
      setupScreen.classList.remove("hidden");
    });
  }
  savePinBtn.addEventListener("click", () => {
    const pin = pinSetupInput.value;
    if (pin.length === 4) {
      localStorage.setItem("userPin", pin);
      pinSetupScreen.classList.add("hidden");
      pinLoginScreen.classList.remove("hidden");
      pinLoginInput.value = "";
      updateDisplay(document.getElementById("pin-login-display"), "", pinLoginVisible);
    } else {
      showError("Please enter a valid 4-digit pin.");
    }
  });
  savePatternBtn.addEventListener("click", () => {
    if (!setupPattern || setupPattern.length < 4) {
      showError("Pattern too short. Connect atleast 4 dots");
    } else {
      localStorage.setItem("userPattern", JSON.stringify(setupPattern));
      patternSetupScreen.classList.add("hidden");
      patternLoginScreen.classList.remove("hidden");
      initPatternCanvas(patternLoginCanvas, (pattern) => {
        const saved = JSON.parse(localStorage.getItem("userPattern"));
        if (JSON.stringify(pattern) === JSON.stringify(saved)) {
          handleSuccess();
        } else {
          enteredPattern = pattern;
        }
      });
    }
  });
  // PIN login: via input or keypad.
  pinLoginInput.addEventListener("input", () => {
    if (pinLoginInput.value.length === 4 && pinLoginInput.value === localStorage.getItem("userPin")) {
      handleSuccess();
    }
  });
  pinLoginBtn.addEventListener("click", () => {
    if (pinLoginInput.value === localStorage.getItem("userPin")) {
      handleSuccess();
    } else {
      showError("Incorrect pin. Please try again.");
    }
  });
  // Pattern login fallback.
  const patternLoginBtn = document.getElementById("pattern-login-btn");
  patternLoginBtn.addEventListener("click", () => {
    const saved = JSON.parse(localStorage.getItem("userPattern"));
    if (JSON.stringify(enteredPattern) === JSON.stringify(saved)) {
      handleSuccess();
    } else {
      showError("Incorrect pattern. Please try again.");
      enteredPattern = [];
      initPatternCanvas(patternLoginCanvas, (pattern) => {
        const saved = JSON.parse(localStorage.getItem("userPattern"));
        if (JSON.stringify(pattern) === JSON.stringify(saved)) {
          handleSuccess();
        } else {
          enteredPattern = pattern;
        }
      });
    }
  });
  function handleSuccess() {
    successMessage.style.opacity = "1";
    document.getElementById("lock-screen").classList.add("fade-out");
    setTimeout(() => {
      homePage.style.display = "flex"
      lockScreen.style.display = "none"
    }, 1700);
  }
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.opacity = "1";
    setTimeout(() => {
      errorMessage.style.opacity = "0";
    }, 2000);
  }
  // Keypad handling for PIN setup.
  const pinSetupContainer = document.querySelector("#pin-setup-screen .container");
  if (pinSetupContainer) {
    const keypadKeys = pinSetupContainer.querySelectorAll(".key");
    const pinDisplayEl = document.getElementById("pin-display");
    keypadKeys.forEach(key => {
      key.addEventListener("click", () => {
        if (pinSetupInput.value.length < 4) {
          pinSetupInput.value += key.getAttribute("data-value");
          updateDisplay(pinDisplayEl, pinSetupInput.value, pinSetupVisible);
        }
      });
    });
    const backspacePinSetup = document.getElementById("backspace-pin-setup");
    const clearPinSetup = document.getElementById("clear-pin-setup");
    backspacePinSetup.addEventListener("click", () => {
      pinSetupInput.value = pinSetupInput.value.slice(0, -1);
      updateDisplay(pinDisplayEl, pinSetupInput.value, pinSetupVisible);
    });
    clearPinSetup.addEventListener("click", () => {
      pinSetupInput.value = "";
      updateDisplay(pinDisplayEl, "", pinSetupVisible);
    });
    const toggleSetup = document.getElementById("toggle-pin-setup-vis");
    toggleSetup.innerHTML = eyeIcon;
    toggleSetup.addEventListener("click", () => {
      pinSetupVisible = !pinSetupVisible;
      toggleSetup.innerHTML = pinSetupVisible ? eyeOffIcon : eyeIcon;
      updateDisplay(pinDisplayEl, pinSetupInput.value, pinSetupVisible);
    });}
  // Keypad handling for PIN login.
  const pinLoginContainer = document.querySelector("#pin-login-screen .container");
  if (pinLoginContainer) {
    const loginKeys = pinLoginContainer.querySelectorAll(".key");
    const pinLoginDisplayEl = document.getElementById("pin-login-display");
    loginKeys.forEach(key => {
      key.addEventListener("click", () => {
        if (pinLoginInput.value.length < 4) {
          pinLoginInput.value += key.getAttribute("data-value");
          updateDisplay(pinLoginDisplayEl, pinLoginInput.value, pinLoginVisible);
          if (pinLoginInput.value.length === 4 && pinLoginInput.value === localStorage.getItem("userPin")) {
            handleSuccess();
          }
        }
      });
    });
    const backspacePinLogin = document.getElementById("backspace-pin-login");
    const clearPinLogin = document.getElementById("clear-pin-login");
    backspacePinLogin.addEventListener("click", () => {
      pinLoginInput.value = pinLoginInput.value.slice(0, -1);
      updateDisplay(pinLoginDisplayEl, pinLoginInput.value, pinLoginVisible);
    });
    clearPinLogin.addEventListener("click", () => {
      pinLoginInput.value = "";
      updateDisplay(pinLoginDisplayEl, "", pinLoginVisible);
    });
    const toggleLogin = document.getElementById("toggle-pin-login");
    toggleLogin.innerHTML = eyeIcon;
    toggleLogin.addEventListener("click", () => {
      pinLoginVisible = !pinLoginVisible;
      toggleLogin.innerHTML = pinLoginVisible ? eyeOffIcon : eyeIcon;
      updateDisplay(pinLoginDisplayEl, pinLoginInput.value, pinLoginVisible);
    });
  }
});
// --- Ripple Effect Global Listener ---
document.addEventListener("click", function (e) {
  const target = e.target.closest(".ripple");
  if (target) {
    const rect = target.getBoundingClientRect();
    const circle = document.createElement("span");
    circle.classList.add("circle");
    const xInside = e.clientX - rect.left;
    const yInside = e.clientY - rect.top;
    circle.style.left = `${xInside}px`;
    circle.style.top = `${yInside}px`;
    target.appendChild(circle);
    setTimeout(() => {
      circle.remove();
    }, 500);
  }
});


const resultEl = document.getElementById("result");
const lengthEl = document.getElementById("length");
const uppercaseEl = document.getElementById("uppercase");
const lowercaseEl = document.getElementById("lowercase");
const numbersEl = document.getElementById("numbers");
const symbolsEl = document.getElementById("symbols");
const generateEl = document.getElementById("generate");
const clipboardEl = document.getElementById("clipboard");
const randomFun = {
  lower: getRandomLower,
  upper: getRandomUpper,
  number: getRandomNumber,
  symbol: getRandomSymbol,
};
document.addEventListener("contextmenu", (e) => e.preventDefault()); // Disable right-click
document.addEventListener("keydown", (e) => { 
    if (e.ctrlKey && (e.key === "u" || e.key === "s" || e.key === "i")) {
        e.preventDefault();
    }
}); // Disable CTRL+U (View Source) and CTRL+S (Save)
// Disable right-click for specific elements
const elementsToProtect = document.querySelectorAll('.company-name, label, h1, .saved-password, password-value, password-name');
elementsToProtect.forEach(el => {
  el.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
});
// Load saved passwords on page load
document.addEventListener("DOMContentLoaded", loadPasswordsFromLocalStorage);
// Copy to clipboard functionality
clipboardEl.addEventListener("click", () => {
  const textarea = document.createElement("textarea");
  const password = resultEl.innerText;
  if (!password) {
    return;
  }
  textarea.value = password;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
  showNotification('Copied to clipboard');
  setTimeout(() => {
    const savePassword = confirm("Do you want to save this password?");
    if (savePassword) {
      const passwordName = prompt("Enter a name for this password:");
      if (passwordName) {
        savePasswordToLocalStorage(passwordName, password);
      }
    }
  }, 900);
});
// Show notification function
function showNotification(message) {
  const notification = document.createElement('div');
  notification.classList.add('notification');
  notification.innerText = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.classList.add('hide');
  }, 1500);
  setTimeout(() => {
    notification.remove();
  }, 2500);
}
// Copy password from saved list
document.addEventListener('DOMContentLoaded', () => {
  const savedPasswordsList = document.getElementById('savedPasswordsList');
  savedPasswordsList.addEventListener('click', (event) => {
    if (event.target.classList.contains('password-value')) {
      const textToCopy = event.target.getAttribute('title'); // Get full password
      navigator.clipboard.writeText(textToCopy).then(() => {
        showNotification('Copied to clipboard');
      });
    }
  });
});
// Save password to local storage
function savePasswordToLocalStorage(name, password) {
  const id = Date.now();  // Unique ID based on current timestamp
  const passwords = JSON.parse(localStorage.getItem("savedPasswords")) || [];
  passwords.push({ id, name, password });
  localStorage.setItem("savedPasswords", JSON.stringify(passwords));
  addPasswordToSidebar(id, name, password);
}
// Load passwords from local storage
function loadPasswordsFromLocalStorage() {
  const passwords = JSON.parse(localStorage.getItem("savedPasswords")) || [];
  passwords.forEach(({ id, name, password }) => {
    addPasswordToSidebar(id, name, password);
  });
}
// Add password to sidebar with truncation and tooltip
function addPasswordToSidebar(id, name, password) {
  const sidebarList = document.getElementById("savedPasswordsList");
  const listItem = document.createElement("li");
  listItem.setAttribute("data-id", id);
  // Truncate password if it's too long and add a tooltip for the full password
  const truncatedPassword = password.length > 13 ? password.slice(0, 13) + "..." : password;
        // Check if the name is a link
  const linkRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i;

  const isLink = linkRegex.test(name);
  const displayedName = isLink
    ? `<a class="pn_link" href="https://${name}" target="_blank" class="password-link">${name}</a>`
    : name;
  listItem.innerHTML = `
      <div class="password-item">
      <strong class="password-name" style="font-size: ${Math.max(12, 18 - name.length / 6)}px; word-break: break-word;">${displayedName}</strong>: 
      <span class="password-value" title="${password}">${truncatedPassword}</span>
    </div>
    <div class="buttons-container">
      <button class="edit-btn"><svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 -960 960 960" width="15px"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button>
      <button class="delete-btn style="background-color: var(--secondary-color-close);
        fill: var(--svg-BW);
        border: none;
        padding: 8px 10px;
        border-radius: 50px;
        cursor: grab;
        cursor: -moz-grab;
        cursor: -webkit-grab;
        margin-left: 5px;
        transition: background-color 0.3s;"><svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 -960 960 960" width="15px"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
    </div>
  `;
  // Edit button functionality
  listItem.querySelector(".edit-btn").addEventListener("click", () => {
    const newName = prompt("Edit password name:", name);
    const newPassword = prompt("Edit password:", password);
    if (newName !== null && newPassword !== null) {
      const truncatedNewPassword = newPassword.length > 13 ? newPassword.slice(0, 13) + "..." : newPassword;
      listItem.querySelector(".password-name").innerText = newName;
      listItem.querySelector(".password-value").innerText = truncatedNewPassword;
      listItem.querySelector(".password-value").setAttribute("title", newPassword); // Update tooltip
      updatePasswordInLocalStorage(id, newName, newPassword);
    }
  });
  // Delete button functionality
  listItem.querySelector(".delete-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this password?")) {
      listItem.remove();
      deletePasswordFromLocalStorage(id);
    }
  });
  sidebarList.appendChild(listItem);
}
// Update password in local storage
function updatePasswordInLocalStorage(id, newName, newPassword) {
  const passwords = JSON.parse(localStorage.getItem("savedPasswords")) || [];
  const updatedPasswords = passwords.map(passwordObj => {
    if (passwordObj.id === id) {
      return { id, name: newName, password: newPassword };
    }
    return passwordObj;
  });
  localStorage.setItem("savedPasswords", JSON.stringify(updatedPasswords));
}// Delete password from local storage
function deletePasswordFromLocalStorage(id) {
  const passwords = JSON.parse(localStorage.getItem("savedPasswords")) || [];
  const updatedPasswords = passwords.filter(passwordObj => passwordObj.id !== id);
  localStorage.setItem("savedPasswords", JSON.stringify(updatedPasswords));
}
generateEl.addEventListener("click", () => {
  const length = +lengthEl.value;
  const hasLower = lowercaseEl.checked;
  const hasUpper = uppercaseEl.checked;
  const hasNumber = numbersEl.checked;
  const hasSymbol = symbolsEl.checked;
  resultEl.innerText = generatePassword(length, hasLower, hasUpper, hasNumber, hasSymbol);
});
function generatePassword(length, lower, upper, number, symbol) {
  let generatedPassword = "";
  const typesCount = lower + upper + number + symbol;
  const typesArr = [{ lower }, { upper }, { number }, { symbol }].filter(item => Object.values(item)[0]);
  if (typesCount === 0) {
    return "";
  }
  for (let i = 0; i < length; i += typesCount) {
    typesArr.forEach(type => {
      const funName = Object.keys(type)[0];
      generatedPassword += randomFun[funName]();
    });
  }
  return generatedPassword.slice(0, length);
}
function getRandomLower() {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
}
function getRandomUpper() {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
}
function getRandomNumber() {
  return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
}
function getRandomSymbol() {
  const symbols = "!@#$%&*(){}[]=<>/,.:/";
  return symbols[Math.floor(Math.random() * symbols.length)];
}
// SIDEBAR
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const openBtn = document.getElementById("openBtn");
const closeBtn = document.getElementById("closeBtn");
 // Function to open sidebar
 function openSidebar() {
     sidebar.style.right = "0";
     overlay.style.display = "block";
 }
 // Function to close sidebar
 function closeSidebar() {
     if (window.innerWidth > 768) {
         sidebar.style.right = "-260px";
     } else {
         sidebar.style.right = "-100%";
     }
     overlay.style.display = "none";
 }
 // Open sidebar on button click
 openBtn.addEventListener("click", openSidebar);
 // Close sidebar on close button click or overlay click
 closeBtn.addEventListener("click", closeSidebar);
 overlay.addEventListener("click", closeSidebar);
 // Touch event for opening sidebar with swipe
 let startX = 0;
 document.addEventListener("touchstart", (e) => {
     startX = e.touches[0].clientX;
 });
 document.addEventListener("touchend", (e) => {
     let endX = e.changedTouches[0].clientX;
     if (startX > window.innerWidth - 10 && endX < startX) {
         openSidebar();
     }
 });
 const buttons = document.querySelectorAll('.ripple')
buttons.forEach(button => {
        button.addEventListener('click', function(e) {
                const x = e.pageX
                const y = e.pageY
                const buttonTop = e.target.offsetTop
                const buttonLeft = e.target.offsetLeft
                const xInside = x - buttonLeft
                const yInside = y - buttonTop
                const circle = document.createElement('span')
                circle.classList.add('circle')
                circle.style.top = yInside + 'px'
                circle.style.left = xInside + 'px'
                this.appendChild(circle)
                setTimeout(() => circle.remove(), 500)
        })});
/*================ DARK LIGHT THEME ==================*/ 
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'
const iconTheme = 'bx-sun'
// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')
// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'bx-moon' : 'bx-sun'
// We validate if the user previously chose a topic
if (selectedTheme) {
  // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
  themeButton.classList[selectedIcon === 'bx-moon' ? 'add' : 'remove'](iconTheme)
}
// Activate / deactivate the theme manually with the button
themeButton.addEventListener('click', () => {
    // Add or remove the dark / icon theme
    document.body.classList.toggle(darkTheme)
    themeButton.classList.toggle(iconTheme)
    // We save the theme and the current icon that the user chose
    localStorage.setItem('selected-theme', getCurrentTheme())
    localStorage.setItem('selected-icon', getCurrentIcon())
});
/*==================== SHOW MENU ====================*/
const showMenu = (toggleId, navId) =>{
    const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId)
    // Validate that variables exist
    if(toggle && nav){
        toggle.addEventListener('click', ()=>{
            // We add the show-menu class to the div tag with the nav__menu class
            nav.classList.toggle('show-menu')
        })
    }
}
showMenu('nav-toggle','nav-menu')
/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll('.nav__link')
function linkAction(){
    const navMenu = document.getElementById('nav-menu')
    // When we click on each nav__link, we remove the show-menu class this to whoever is reading this
    navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction)
)