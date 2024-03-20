import React, { useEffect, useState } from "react";
import { fabric } from "fabric";
import "./App.css";

function Index() {
  // const []
  useEffect(() => {
    const canvas = document.getElementById("drawing-board");
    const toolbar = document.getElementById("toolbar");
    var ctx = canvas.getContext("2d");

    const banner = new Image();
    banner.setAttribute("crossOrigin", "anonymous");
    banner.style.objectFit = "cover";
    banner.style.width = 400;
    banner.style.height = 400;
    banner.onload = () => {
      ctx.drawImage(banner, 0, 0);
    };
    banner.src = "https://local-spaces.fra1.digitaloceanspaces.com/test.jpg";

    const canvasOffsetX = canvas.offsetLeft;
    const canvasOffsetY = canvas.offsetTop;

    // canvas.width = window.innerWidth - canvasOffsetX;
    // canvas.height = window.innerHeight - canvasOffsetY;
    canvas.width = 400;
    canvas.height = 400;

    let isPainting = false;
    let lineWidth = 5;
    let startX;
    let startY;

    toolbar.addEventListener("click", (e) => {
      if (e.target.id === "clear") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (e.target.id === "convert") {
        console.log("conv");
        const res = canvas.toDataURL();
        const convertedEl = document.getElementById("converted");
        const bannerEl = document.getElementById("banner");
        console.log("aa", bannerEl);
        if (bannerEl === null) {
          const img = new Image();
          img.setAttribute("id", "banner");
          img.src = res;
          img.width = 400;
          convertedEl.appendChild(img);
        } else {
          bannerEl.src = res;
          bannerEl.width = 400;
        }
      }
    });

    toolbar.addEventListener("change", (e) => {
      if (e.target.id === "stroke") {
        ctx.strokeStyle = e.target.value;
      }

      if (e.target.id === "lineWidth") {
        lineWidth = e.target.value;
      }
    });

    const draw = (e) => {
      if (!isPainting) {
        return;
      }

      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";

      ctx.lineTo(e.clientX - canvasOffsetX + 70, e.clientY);
      ctx.stroke();
    };

    canvas.addEventListener("mousedown", (e) => {
      isPainting = true;
      startX = e.clientX;
      startY = e.clientY;
    });

    canvas.addEventListener("mouseup", (e) => {
      isPainting = false;
      ctx.stroke();
      ctx.beginPath();
    });

    canvas.addEventListener("mousemove", draw);
  }, []);

  return (
    <>
      <section className="container">
        <div id="toolbar">
          <h1>Draw.</h1>
          <label htmlFor="stroke">Stroke</label>
          <input id="stroke" name="stroke" type="color" />
          <label htmlFor="lineWidth">Line Width</label>
          <input
            id="lineWidth"
            name="lineWidth"
            type="number"
            defaultValue="5"
          />
          <button id="clear">Clear</button>
          <button id="convert">convert</button>
        </div>
        <div className="drawing-board">
          <canvas
            id="drawing-board"
            style={{
              border: "1px solid red",
              // width: "400px",
              // background: `url(https://i.pinimg.com/564x/00/e6/a9/00e6a91548be9d6e79fd3c1d9dd84369.jpg)`,
            }}
          ></canvas>
        </div>
        <div id="converted"></div>
      </section>
    </>
  );
}

export default Index;
