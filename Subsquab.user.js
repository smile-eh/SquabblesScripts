// ==UserScript==
// @name         Squabbles Subsquab
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Petition to change the subscribe button to a subsquab button.
// @author       github.com/smile-eh
// @match        *://*.squabbles.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=squabbles.io
// @grant        none
// ==/UserScript==

const observeDOM = (fn, e = document.documentElement, config = { attributes: 1, childList: 1, subtree: 1 }) => {
  /*
  https://old.reddit.com/r/GreaseMonkey/comments/undlw2/need_to_monitor_changes_to_a_specific_element_on/i89bftz/
  */
  const observer = new MutationObserver(fn);
  observer.observe(e, config);
  return () => observer.disconnect();
};

observeDOM(() => {
    //Get the parent div that has either the nav on desktop or pill button on mobile
    const elements = document.querySelectorAll(".btn");
     for(let e of elements){
         if (e.innerHTML === "Subscribe"){
             e.innerHTML = "Subsquab";
         }
    }
});
