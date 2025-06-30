// ==UserScript==
// @name         Media Grid Viewer (Alt+Shift+M)
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Displays all images and videos on a webpage in a large thumbnail grid with full-size preview and download support. Activate with Alt+Shift+M. Middle-click or left-click opens in background if allowed.
// @author       thehambuglar
// @match        *://*/*
// @grant        none
// @icon         https://attic.sh/8lgqbjcj29hir8nvb0gq9ic0cm95
// @downloadURL  https://raw.githubusercontent.com/kko182/media-grid-viewer/main/media-grid-viewer.user.js
// @updateURL    https://raw.githubusercontent.com/kko182/media-grid-viewer/main/media-grid-viewer.user.js
// ==/UserScript==

(function () {
  'use strict';

  document.addEventListener("keydown", function (e) {
    if (e.altKey && e.shiftKey && e.key.toLowerCase() === "m") {
      launchMediaViewer();
    }

    if (e.key === "Escape") {
      const overlay = document.getElementById("media-grid-overlay");
      if (overlay) overlay.remove();
    }
  });

  function openInBackgroundTab(url) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.style.display = "none";
    document.body.appendChild(a);

    const evt = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 1 // middle mouse button
    });

    a.dispatchEvent(evt);
    document.body.removeChild(a);
  }

  function launchMediaViewer() {
    if (document.getElementById("media-grid-overlay")) return;

    const exts = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg", ".mp4", ".webm", ".ogg"];
    const allElements = [...document.querySelectorAll("a[href], img, video")];
    const media = [];

    allElements.forEach(el => {
      const src = el.src || el.href;
      if (!src) return;
      const lower = src.toLowerCase();
      if (exts.some(ext => lower.includes(ext))) {
        media.push(src);
      }
    });

    if (!media.length) {
      alert("No images or videos found.");
      return;
    }

    const overlay = document.createElement("div");
    overlay.id = "media-grid-overlay";
    overlay.style = `
      position:fixed;
      top:0;
      left:0;
      width:100%;
      height:100%;
      overflow:auto;
      background:#f0f0f0;
      z-index:999999;
      padding:20px;
      font-family:sans-serif;
      display:flex;
      flex-direction:column;
      align-items:center;
    `;

    const header = document.createElement("div");
    header.style = `
      width:100%;
      position:sticky;
      top:0;
      background:#fff;
      padding:10px;
      border-bottom:1px solid #ccc;
      z-index:9999999;
      text-align:right;
    `;

    const close = document.createElement("button");
    close.textContent = "× Close";
    close.style = "margin-left:10px;padding:6px 12px;font-size:16px;";
    close.onclick = () => overlay.remove();

    const downloadAll = document.createElement("button");
    downloadAll.textContent = "⬇ Download All";
    downloadAll.style = "padding:6px 12px;font-size:16px;";
    downloadAll.onclick = () => {
      media.forEach(src => {
        const a = document.createElement("a");
        a.href = src;
        a.download = src.split("/").pop().split("?")[0];
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    };

    header.appendChild(downloadAll);
    header.appendChild(close);
    overlay.appendChild(header);

    const grid = document.createElement("div");
    grid.style = `
      display:grid;
      grid-template-columns:repeat(auto-fill,minmax(250px,1fr));
      gap:10px;
      width:100%;
      margin-top:20px;
      justify-items:center;
    `;

    media.forEach(src => {
      const wrapper = document.createElement("div");
      wrapper.style = "position:relative;";

      const handleClick = (e) => {
        e.preventDefault();
        openInBackgroundTab(src);
      };

      if (src.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i)) {
        const img = document.createElement("img");
        img.src = src;
        img.style = `
          width:100%;
          max-width:250px;
          cursor:pointer;
          transition:transform 0.2s ease;
          border-radius:4px;
        `;
        img.title = "Click or middle-click to open in background tab";
        img.onclick = handleClick;
        img.onmousedown = (e) => {
          if (e.button === 1) handleClick(e);
        };
        img.onmouseover = () => img.style.transform = "scale(1.25)";
        img.onmouseout = () => img.style.transform = "scale(1)";
        wrapper.appendChild(img);
      } else if (src.match(/\.(mp4|webm|ogg)$/i)) {
        const video = document.createElement("video");
        video.src = src;
        video.controls = true;
        video.style = "width:100%; max-width:250px; border-radius:4px; cursor:pointer;";
        video.title = "Click or middle-click to open in background tab";
        video.onmousedown = (e) => {
          if (e.button === 1 || e.button === 0) handleClick(e);
        };
        wrapper.appendChild(video);
      }

      grid.appendChild(wrapper);
    });

    overlay.appendChild(grid);
    document.body.appendChild(overlay);
  }
})();

