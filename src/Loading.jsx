import { memo } from "react";
import { useEffect, useState, startTransition } from "react";
import { useLocation } from "react-router-dom";

export default memo(function Loading({ isPage }) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(location.pathname);
    setLoading(true);

    startTransition(() => {
      console.log(location.pathname + 'c');
      setLoading(false);
    });
  }, [location.pathname]);
  return (
    <>
      {isPage && loading ? (
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
      ) : !isPage ? (
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
      ) : null}
    </>
  );
});
