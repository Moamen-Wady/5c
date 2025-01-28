import { lazy, Suspense, useEffect, useCallback, memo } from "react";
const Home = lazy(() => import("./Home"));
const Dashboard = lazy(() => import("./dashboard"));
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { Slide, ToastContainer, toast } from "react-toastify";
import Loading from "./Loading";

const HomePage = memo(Home);
const LoadingPage = memo(Loading);
const DashboardPage = memo(Dashboard);

export default function App() {
  useEffect(() => {
    if (navigator.userAgent.match(/samsung/i)) {
      alert(
        "Your browser (Samsung Internet) may not show this website's colors correctly in Dark Mode" +
          " with setting: 'use dark mode: always/when phone dark mode is on'" +
          "or when option: 'dark theme sites' is checked." +
          "Please choose 'light theme websites' or consider using a standards-compliant browser instead. \n\n" +
          "We recommend Google Chrome, Microsoft Edge, or Firefox."
      );
    }
  }, []);
  const notify = useCallback((e, msg) => {
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
  }, []);
  return (
    <Router>
      <ToastContainer />
      <Suspense fallback={<LoadingPage />}>
        <header>
          <Link to="/dbrd">Admin</Link>
          <Link to="/">Home</Link>
        </header>
        <Routes>
          <Route path="/" element={<HomePage notify={notify} />} />
          <Route path="/dbrd" element={<DashboardPage notify={notify} />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
