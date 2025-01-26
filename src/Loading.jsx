import React from "react";

export default function Loading() {
  return (
    <div
      style={{
        backgroundColor: "rgb(255, 255, 255, 0.25)",
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
      }}
    >
      <img
        src="loading.gif"
        alt="loading"
        style={{ width: "20vw", height: "20vw" }}
      />
    </div>
  );
}
