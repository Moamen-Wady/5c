import "./Home.css";
import { useState } from "react";
import api from "./api";
import JsPDF from "jspdf";

const RELOAD = () => {
  return new Promise(() => {
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  });
};

export default function Home({ notify }) {
  let [dissub, setDissub] = useState([false, "all", "white", "black"]);

  const throwInvoice = () => {
    setInvoice(false);
    setinpf("none");
  };
  function invoicer(i) {
    switch (i) {
      case true:
        return "none";
      case false:
        return "block";
      default:
        return "";
    }
  }

  //functions of frontend
  let [Sidhash, setSidhash] = useState("");
  let [invoice, setInvoice] = useState(true);
  let [inpf, setinpf] = useState("block");

  let [invoiceData, setInvoiceData] = useState({
    userName: "",
    phoneNum1: "",
    year: "",
    sid: "",
  });

  const tableUpdater = async (e) => {
    e.preventDefault();
    setDissub([true, "none", "grey", "black"]);
    notify("info", "Please Wait...");
    let newInvoiceData = {
      userName: document.getElementById("userName").value,
      phoneNum1: document.getElementById("phoneNum1").value,
      year: document.getElementById("year").value,
      sid: document.getElementById("sid").value,
    };
    const phoneRegex = /^[0-9]\d{10,14}$/;
    const englishRegex = /^[A-Za-z0-9 ]+$/;
    const sidRegex = /^[0-9mM]+$/;
    if (!englishRegex.test(newInvoiceData.userName)) {
      notify("error", "Name is invalid!");
      return setDissub([false, "all", "white", "black"]);
    }
    if (!sidRegex.test(newInvoiceData.sid)) {
      notify("error", "Id is invalid!");
      return setDissub([false, "all", "white", "black"]);
    }
    if (!phoneRegex.test(newInvoiceData.phoneNum1)) {
      notify("error", "Phone number is invalid!");
      return setDissub([false, "all", "white", "black"]);
    }
    setInvoiceData(newInvoiceData);

    await api
      .post(`/reservations/`, {
        userName: invoiceData.userName,
        phoneNum1: invoiceData.phoneNum1,
        year: invoiceData.year,
        sid: invoiceData.sid,
      })
      .then((data) => {
        if (data.data.sts === "ok") {
          notify("success", "Success!");
          setSidhash(data.data.code);
          throwInvoice();
        } else {
          notify("error", data.data.message);
          setDissub([false, "all", "white", "black"]);
        }
      })
      .catch(() => {
        notify("error", "Network Error, Please Try Again");
        setDissub([false, "all", "white", "black"]);
      });
  };
  const downloadInvoiceTable = async () => {
    const report = new JsPDF("p", "pt", "a2");
    report.setFontSize(30);
    report.addImage(document.querySelector("#imin"), "webp", 0, 0, 1200, 1200);
    report.text(invoiceData.userName.toUpperCase(), 575, 600);
    report.text(invoiceData.phoneNum1, 575, 653);
    report.text(invoiceData.year, 575, 705);
    report.text(invoiceData.sid, 575, 757);
    report.text(Sidhash, 575, 809);
    return new Promise(() => {
      report.save("invoice.pdf");
    }).then(RELOAD());
  };

  return (
    <div>
      <picture>
        <source srcSet="/TICKETi.webp" />
        <img
          src="/TICKETi.jpg"
          alt=""
          id="imin"
          style={{ display: "none" }}
          loading="lazy"
        />
      </picture>
      <form
        className="inputForm"
        onSubmit={tableUpdater}
        method="POST"
        id="form"
        style={{ display: inpf }}
      >
        <div>
          <div>
            <input
              required
              type="text"
              id="userName"
              name="userName"
              pattern="^[A-Za-z ]+$"
            />
          </div>
          <div>
            <input
              required
              id="phoneNum1"
              name="phoneNum1"
              type="text"
              pattern="^[0-9]\d{10,14}$"
            />
          </div>
          <div>
            <select id="year" name="year">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="intern">intern</option>
            </select>
          </div>
          <div>
            <input
              required
              type="text"
              id="sid"
              name="sid"
              pattern="^[0-9mM ]+$"
            />
          </div>
        </div>
        <button
          type="submit"
          className="slctbtn"
          disabled={dissub[0]}
          style={{
            pointerEvents: dissub[1],
            backgroundColor: dissub[2],
            color: dissub[3],
          }}
        >
          Register
        </button>
      </form>

      <div
        className="invoice"
        style={{ display: invoicer(invoice), zIndex: 9998 }}
      >
        <div className="invoiceForm">
          <div>
            <div>
              <input type="text" disabled value={invoiceData.userName} />
            </div>
            <div>
              <input type="text" disabled value={invoiceData.phoneNum1} />
            </div>
            <div>
              <input type="text" disabled value={invoiceData.year} />
            </div>
            <div>
              <input type="text" disabled value={invoiceData.sid} />
            </div>
            <div>
              <input type="text" disabled value="######" />
            </div>
          </div>
        </div>
        <button onClick={downloadInvoiceTable} className="dwnbtn">
          Download Ticket To View Code
        </button>
      </div>
      <div className="copyRights">
        <p>
          Copyright &#169;{new Date().getFullYear()}{" "}
          <a href="https://wa.me/+201014943278">Moamen Wady</a>
        </p>
      </div>
    </div>
  );
}
