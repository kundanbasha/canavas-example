import React, { useEffect, useState } from "react";
import { fabric } from "fabric";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import "./App.css";

export default function App() {
  const { editor, onReady } = useFabricJSEditor();

  const history = [];
  const [color, setColor] = useState("#35363a");

  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }

    if (!editor.canvas.__eventListeners["mouse:wheel"]) {
      editor.canvas.on("mouse:wheel", function (opt) {
        var delta = opt.e.deltaY;
        var zoom = editor.canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        editor.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });
    }

    if (!editor.canvas.__eventListeners["mouse:down"]) {
      editor.canvas.on("mouse:down", function (opt) {
        var evt = opt.e;
        if (evt.ctrlKey === true) {
          this.isDragging = true;
          this.selection = false;
          this.lastPosX = evt.clientX;
          this.lastPosY = evt.clientY;
        }
      });
    }

    if (!editor.canvas.__eventListeners["mouse:move"]) {
      editor.canvas.on("mouse:move", function (opt) {
        if (this.isDragging) {
          var e = opt.e;
          var vpt = this.viewportTransform;
          vpt[4] += e.clientX - this.lastPosX;
          vpt[5] += e.clientY - this.lastPosY;
          this.requestRenderAll();
          this.lastPosX = e.clientX;
          this.lastPosY = e.clientY;
        }
      });
    }

    if (!editor.canvas.__eventListeners["mouse:up"]) {
      editor.canvas.on("mouse:up", function (opt) {
        // on mouse up we want to recalculate new interaction
        // for all objects, so we call setViewportTransform
        this.setViewportTransform(this.viewportTransform);
        this.isDragging = false;
        this.selection = true;
      });
    }

    editor.canvas.renderAll();
  }, [editor]);

  const addBackground = () => {
    if (!editor || !fabric) {
      return;
    }

    fabric.Image.fromURL(
      "https://dev-assignments.s3.ap-south-1.amazonaws.com/student/ECK2301/8137/1710847770952_1",
      (image) => {
        image.scaleToHeight(500);
        image.scaleToWidth(500);
        image.crossOrigin = "anonymous";
        editor.canvas.isDrawingMode = true;
        editor.canvas.setBackgroundImage(
          image,
          editor.canvas.renderAll.bind(editor.canvas)
        );
      }
    );
  };

  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    editor.canvas.setHeight(500);
    editor.canvas.setWidth(500);
    addBackground();
    editor.canvas.renderAll();
  }, [editor?.canvas.backgroundImage]);

  const toggleSize = () => {
    editor.canvas.freeDrawingBrush.width === 12
      ? (editor.canvas.freeDrawingBrush.width = 5)
      : (editor.canvas.freeDrawingBrush.width = 12);
  };

  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    editor.canvas.freeDrawingBrush.color = color;
    editor.setStrokeColor(color);
  }, [color]);

  const undo = () => {
    if (editor.canvas._objects.length > 0) {
      history.push(editor.canvas._objects.pop());
    }
    editor.canvas.renderAll();
  };
  const redo = () => {
    if (history.length > 0) {
      editor.canvas.add(history.pop());
    }
  };

  const clear = () => {
    editor.canvas._objects.splice(0, editor.canvas._objects.length);
    history.splice(0, history.length);
    editor.canvas.renderAll();
  };

  const addText = () => {
    editor.addText("inset text");
  };

  function svgToPng(svg, callback) {
    const url = getSvgUrl(svg);
    svgUrlToPng(url, (imgData) => {
      callback(imgData);
      URL.revokeObjectURL(url);
    });
  }
  function getSvgUrl(svg) {
    return URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  }
  function svgUrlToPng(svgUrl, callback) {
    const svgImage = document.createElement("img");
    svgImage.style.position = "absolute";
    svgImage.style.top = "-9999px";
    document.body.appendChild(svgImage);
    svgImage.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = svgImage.clientWidth;
      canvas.height = svgImage.clientHeight;
      const canvasCtx = canvas.getContext("2d");
      canvasCtx.drawImage(svgImage, 0, 0);
      const imgData = canvas.toDataURL("image/png");
      callback(imgData);
      document.body.removeChild(svgImage);
    };
    svgImage.src = svgUrl;
  }

  const getSrcUrl = (svg) => {
    const srcUrlMatch = svg.match(/xlink:href="([^"]+)"/);

    if (srcUrlMatch && srcUrlMatch.length > 1) {
      const srcUrl = srcUrlMatch[1];
      return srcUrl;
    } else {
      console.log("No src URL found.");
      return null;
    }
  };

  const imageUrlToBase64 = async (url) => {
    const data = await fetch(url);
    const blob = await data.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        resolve(base64data);
      };
      reader.onerror = reject;
    });
  };

  const exportSVG = async () => {
    const svg = editor.canvas.toSVG();
  };

  const exportPNG = async () => {
    console.log("check");
    const svg = editor.canvas.toSVG();
    const svgTrim = svg.split("<svg xmlns")[1];
    const bgLink = await getSrcUrl(svgTrim);
    const bgBase64 = await imageUrlToBase64(bgLink);
    const replacedString = await svgTrim.replace(bgLink, bgBase64);
    svgToPng(`<svg xmlns${replacedString}`, (imgData) => {
      const pngImage = document.createElement("img");
      document.body.appendChild(pngImage);
      pngImage.src = imgData;
    });
  };

  return (
    <div>
      <div className="App">
        <h1>FabricJS React Sample</h1>
        <button onClick={addText}>Add Text</button>
        <button onClick={clear}>Clear</button>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
        <button onClick={toggleSize}>ToggleSize</button>
        <label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
        <button onClick={exportSVG}> ToSVG</button>
        <button onClick={exportPNG}> ToPNG</button>

        <div
          style={{
            width: "500px",
            height: "500px",
          }}
        >
          <FabricJSCanvas className="sample-canvas" onReady={onReady} />
        </div>
      </div>
    </div>
  );
}
