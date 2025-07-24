import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { Slide, ToastContainer, toast } from "react-toastify";
import Loading from "./Loading";
import Errorp from "./Errorp";
import RouteChangeHandler from "./RouteChangeHandler";

const Home = lazy(() => import("./Home"));
const Dashboard = lazy(() => import("./dashboard"));

export default function App() {
  const [Authorized, setAuthorized] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState([
    false,
    "all",
    "white",
    "black",
  ]);

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (admin) setAuthorized(admin);
  }, []);

  const notify = useCallback(
    (type: "error" | "warn" | "success" | "info", msg: string) => {
      toast[type](msg, {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("admin");
    setAuthorized(null);
  }, []);

  return (
    <Router>
      <ToastContainer />
      <RouteChangeHandler setLoading={setLoading} />
      {loading ? (
        <Loading />
      ) : (
        <Suspense fallback={<Loading />}>
          <header>
            <div>
              <div>
                <Link to="/dbrd">Admin</Link>
                <Link to="/">Home</Link>
              </div>
              {Authorized ? <a onClick={logout}>Log Out</a> : <></>}
            </div>
          </header>

          <Routes>
            <Route
              path="/"
              element={
                <Home
                  notify={notify}
                  buttonState={buttonState}
                  setButtonState={setButtonState}
                />
              }
            />
            <Route
              path="/dbrd"
              element={
                <Dashboard
                  notify={notify}
                  Authorized={Authorized}
                  setAuthorized={setAuthorized}
                  buttonState={buttonState}
                  setButtonState={setButtonState}
                />
              }
            />
            <Route path="*" element={<Errorp />} />
          </Routes>
        </Suspense>
      )}
    </Router>
  );
}
