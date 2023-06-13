// ==UserScript==
// @name         Squabbles Community Preview
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Preview Squabble communities when you mouse over their links.
// @author       github.com/smile-eh
// @match        *://*.squabbles.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=squabbles.io
// @grant        none
// ==/UserScript==

let loadingFlag = false;

const makePreviewInternals = (values) => {
    let name = document.createElement("strong");
    name.innerHTML = values.name;

    let desc = document.createElement("div");
    desc.innerHTML = values.description;

    let wrapper = document.createElement("div");
    wrapper.appendChild(name);
    wrapper.appendChild(desc);

    return wrapper;
}

const makePreviewDiv = (values, parent) => {
    // Before we make a new preview pane
    //To be safe, remove any old ones
    for(let e of document.getElementsByClassName("communityPreviewPane")) e.remove();

    let preview = document.createElement("div");
    //Add the internal divss
    preview.appendChild(makePreviewInternals(values));
    //Add styling
    preview.style.position = "floating";
    preview.style.background = "white";
    preview.style.border = "inherit solid black";
    // Styling classes
    preview.classList.add("card");
    preview.classList.add("shadow-sm");
    preview.classList.add("px-3");
    preview.classList.add("py-2");
    // Functional classes - for removing if leftover
    preview.classList.add("communityPreviewPane");

    return preview;
}

const observeDOM = (fn, e = document.documentElement, config = { attributes: 1, childList: 1, subtree: 1 }) => {
  /*
  https://old.reddit.com/r/GreaseMonkey/comments/undlw2/need_to_monitor_changes_to_a_specific_element_on/i89bftz/
  */
  const observer = new MutationObserver(fn);
  observer.observe(e, config);
  return () => observer.disconnect();
};

const requestCommunityInfo = async (communityPath) => {
    //Set the loading flag so that handleMouseOver cannot create two preview panes
    loadingFlag = true;
    //Api route
    const rootUri = "https://squabbles.io/api"
    const request = new Request(rootUri + communityPath, {
        method:"GET"
    });
    //Get the ifor from the api
    const res = await fetch(request);
    //Unset the loading flag so a preview pane can be made
    loadingFlag = false;
    return await res.json();
}

const handleMouseOver = async (e) => {
    //Get the info from the community
    const returnValues = await requestCommunityInfo(e.pathname);

    // If not waiting for the API to load - create a preview pane
    if(loadingFlag == false){
        const previewDiv = makePreviewDiv(returnValues, e);
        //When the user's mouse leaves the anchor tag, delete the preview
        e.onmouseleave= () => {
            previewDiv.remove();
        };
        e.parentNode.appendChild(previewDiv);
    }
}

observeDOM(() => {
    // Add a class to the divs, they do not have one
    const posts = document.querySelectorAll("div.card-header:not(.post_header)");
    for(let p of posts){
        p.classList.add("post_header");
    }
    //Easier to wrk with now
    //Select them all then either swap them or revert them
    let postContent = document.querySelectorAll(".post_header:not(.onMouseAdded)");
    for(let p of postContent){
        p.classList.add("onMouseAdded");
        let anchor = p.nextSibling.querySelector("a")
        anchor.onmouseover=handleMouseOver.bind(this, anchor);
    }
});
