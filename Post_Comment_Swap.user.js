// ==UserScript==
// @name         Squabbles Post Comment Swap
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Swap the position of the comments and the main post on desktop.
// @author       github.com/smile-eh
// @match        *://*.squabbles.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=squabbles.io
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

let swapEnabled = await GM.getValue("swapFlag", false);

const observeDOM = (fn, e = document.documentElement, config = { attributes: 1, childList: 1, subtree: 1 }) => {
  /*
  https://old.reddit.com/r/GreaseMonkey/comments/undlw2/need_to_monitor_changes_to_a_specific_element_on/i89bftz/
  */
  const observer = new MutationObserver(fn);
  observer.observe(e, config);
  return () => observer.disconnect();
};

const clickSwapButton = async () => {
    swapEnabled = !swapEnabled;
    await GM.setValue("swapFlag", swapEnabled);
    let parentNode = document.getElementById("leftRightSwitch");
    if(swapEnabled){
        let toggleIcon = parentNode.querySelector(".fa-solid, .fa-toggle-off");
        toggleIcon.classList.remove("fa-toggle-off");
        toggleIcon.classList.add("fa-toggle-on");
    }
    else{
        let toggleIcon = parentNode.querySelector(".fa-solid, .fa-toggle-on");
        toggleIcon.classList.remove("fa-toggle-on");
        toggleIcon.classList.add("fa-toggle-off");
    }
}

const createToggleButton = (hamburgerMenu) => {
    let toggleIcon = document.createElement("i");
    toggleIcon.classList.add("fa-solid");
    toggleIcon.classList.add(swapEnabled ? "fa-toggle-on" : "fa-toggle-off");

    let toggleText = document.createElement("div");
    toggleText.classList.add("me-1");
    toggleText.innerHTML = "Swap Positions"

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
    toggleButton.style = "cursor:pointer;";

    let toggleSwap = document.createElement('li');
    toggleSwap.id = "leftRightSwitch";
    toggleSwap.classList.add("nav-item");
    toggleSwap.onclick = () => {clickSwapButton()};
    toggleSwap.appendChild(toggleButton);

    return toggleSwap
}


observeDOM(() => {
    // Add a class to the divs, they do not have one
    const container = document.querySelectorAll("#content-wrapper .page .container");
    let posts = container[0].querySelectorAll(":scope > div:not([class])");
    for(let p of posts){
        p.classList.add("swap_post_loaded");
    }
    //Easier to wrk with now
    //Select them all then either swap them or revert them
    if(!swapEnabled){
        let brap = document.querySelectorAll(".swap_post_loaded:not(.normal)");
        for(let p of brap){
            p.classList.add("normal");
            p.classList.remove("swapped");
            let pc=p.children[0];
            pc.children[1].after(pc.children[0]);
        }
    } else {
        let brap = document.querySelectorAll(".swap_post_loaded:not(.swapped)");
        for(let p of brap){
            p.classList.add("swapped");
            p.classList.remove("normal");
            let pc=p.children[0];
            pc.children[1].after(pc.children[0]);
        }
    }
});

observeDOM(() => {
    //Get the parent div that has either the nav on desktop or pill button on mobile
    const container = document.querySelectorAll(".navbar .container:not(.swap_loaded)");
     for(let c of container){
         c.classList.add("swap_loaded");
         // Check if there is the nav component - meaning wide screen
         if(c.querySelector(".nav").offsetParent != null) {
             c.querySelector(".nav").appendChild(createToggleButton(false));
         }
    }
});

window.addEventListener("resize", (event) => {
    const parentNodes = document.querySelectorAll(".navbar .container");
    const toggleSwap = document.getElementById("leftRightSwitch");
    if(toggleSwap) toggleSwap.remove();
    for(let c of parentNodes){
        c.classList.remove("swap_loaded");
    }
});
