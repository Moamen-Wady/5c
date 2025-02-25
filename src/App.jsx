import { lazy, Suspense, useState } from "react";
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
  let [Authorized, setAuthorized] = useState("");
  const [loading, setLoading] = useState(false);
  const notify = (e, msg) => {
    toast[e](msg, {
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
  };

  const logout = () => {
    localStorage.removeItem("admin");
    setAuthorized("");
  };

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
            <Route path="/" element={<Home notify={notify} />} />
            <Route
              path="/dbrd"
              element={
                <Dashboard
                  notify={notify}
                  Authorized={Authorized}
                  setAuthorized={setAuthorized}
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
