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
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: "20vw",
          height: "20vw",
        }}
      >
        <source src="/loading.webm" type="video/webm" />
      </video>
    </div>
  );
}
