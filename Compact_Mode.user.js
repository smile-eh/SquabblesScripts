// ==UserScript==
// @name         Squabbles Compact Mode
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Compact the user comments by default, with a button to toggle this.
// @author       github.com/smile-eh
// @match        *://*.squabbles.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=squabbles.io
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

let compactEnabled = await GM.getValue("cmFlag", true);

const observeDOM = (fn, e = document.documentElement, config = { attributes: 1, childList: 1, subtree: 1 }) => {
  const observer = new MutationObserver(fn);
  observer.observe(e, config);
  return () => observer.disconnect();
};

const clickCompactButton = async () => {
    compactEnabled = !compactEnabled;
    await GM.setValue("cmFlag", compactEnabled);
    let parentNode = document.getElementById("compactModeSwitch");
    if(compactEnabled){
        let toggleIcon = parentNode.querySelector(".fa-solid, .fa-toggle-off");
        toggleIcon.classList.remove("fa-toggle-off");
        toggleIcon.classList.add("fa-toggle-on");
        const comments = document.querySelectorAll(".comment");
        for(let c of comments){
            c.querySelector(".comment-collapse-button").click();
        }
    }
    else{
        let toggleIcon = parentNode.querySelector(".fa-solid, .fa-toggle-on");
        toggleIcon.classList.remove("fa-toggle-on");
        toggleIcon.classList.add("fa-toggle-off");
        const comments = document.querySelectorAll(".comment");
        for(let c of comments){
            const anchors = c.querySelectorAll("a");
            for(let a of anchors){
                if(a.innerHTML == "Expand") a.click();
                //            a.querySelector(".comment-collapse-button").click();
            }
        }
    }
}

const createToggleButton = (hamburgerMenu) => {
    let toggleIcon = document.createElement("i");
    toggleIcon.classList.add("fa-solid");
    toggleIcon.classList.add(compactEnabled ? "fa-toggle-on" : "fa-toggle-off");

    let toggleText = document.createElement("div");
    toggleText.classList.add("me-1");
    toggleText.innerHTML = "Compact"

    let toggleDiv = document.createElement("div");
    toggleDiv.style.display = "flex";
    toggleDiv.style.alignItems = "baseline";
    toggleDiv.appendChild(toggleText);
    toggleDiv.appendChild(toggleIcon);

    let toggleButton;
    //If the button is residing in the hamburger menu, rework it
    if (hamburgerMenu){
        toggleButton = document.createElement("a");
        toggleButton.classList.add("dropdown-item");
    } else {
        //Create the button with the default settings
        toggleButton = document.createElement("button");
        toggleButton.classList.add("nav-link");
    }

    toggleButton.appendChild(toggleDiv);
    //toggleButton.onclick = clickCompactButton;
    toggleButton.style = "cursor:pointer;";

    let toggleCompact = document.createElement('li');
    toggleCompact.id = "compactModeSwitch";
    toggleCompact.classList.add("nav-item");
    toggleCompact.onclick = clickCompactButton;
    toggleCompact.appendChild(toggleButton);

    return toggleCompact
}


observeDOM(() => {
    if(compactEnabled){
        const comments = document.querySelectorAll(".comment:not(.compact_loaded)");
        for(let c of comments){
            c.classList.add("compact_loaded");
            c.querySelector(".comment-collapse-button").click();
        }
    }
});

observeDOM(() => {
    //Get the parent div that has either the nav on desktop or pill button on mobile
    const container = document.querySelectorAll(".navbar .container:not(.compact_loaded)");
     for(let c of container){
         c.classList.add("compact_loaded");

         // Check if there is the nav component - meaning wide screen
         if(c.querySelector(".nav").offsetParent != null) {
             c.querySelector(".nav").appendChild(createToggleButton(false));
         }
         else{
             c.querySelector(".text-end .d-lg-none ul").appendChild(createToggleButton(true));
         }
    }
});

window.addEventListener("resize", (event) => {
    const parentNodes = document.querySelectorAll(".navbar .container");
    const toggleCompact = document.getElementById("compactModeSwitch");
    toggleCompact.remove();
    for(let c of parentNodes){
        c.classList.remove("compact_loaded");
    }
});
