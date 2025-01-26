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
  var [dissub, setDissub] = useState([false, "all", "white", "black"]);

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
  var [userName, setUserName] = useState("");
  var [Year, setYear] = useState("1");
  var [Sid, setSid] = useState("");
  var [Sidhash, setSidhash] = useState("");
  var [phoneNumber1, setPhoneNumber1] = useState("");
  var [invoice, setInvoice] = useState(true);
  var [inpf, setinpf] = useState("block");

  const handleChangeName = (event) => {
    var namevalue = event.target.value;
    setUserName(namevalue);
  };
  const handleChangeYear = (event) => {
    var numvalue = event.target.value;
    setYear(numvalue);
  };
  const handleChangeSid = (event) => {
    var numvalue = event.target.value;
    setSid(numvalue);
  };
  const handleChangePhone1 = (event) => {
    var phonevalue = event.target.value;
    setPhoneNumber1(phonevalue);
  };

  function taker() {
    setDissub([true, "none", "grey", "black"]);
    if (userName === "" || phoneNumber1 === "" || Year === "" || Sid === "") {
      notify("error", "PLEASE FILL ALL FIELDS IN THE FORM ");
      setDissub([false, "all", "white", "black"]);
    } else {
      tableUpdater();
      // notify("success", "Success!");
      // setSidhash("");
      // throwInvoice();
    }
  }
  const tableUpdater = async () => {
    setDissub([true, "none", "grey", "black"]);
    notify("info", "Please Wait...");
    await api
      .post(`/reservations/`, {
        userName: userName,
        phoneNum1: phoneNumber1,
        sid: Sid,
        year: Year,
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
    report.text(userName.toUpperCase(), 575, 600);
    report.text(phoneNumber1, 575, 653);
    report.text(Year, 575, 705);
    report.text(Sid, 575, 757);
    report.text(Sidhash, 575, 809);
    return new Promise(() => {
      report.save("invoice.pdf");
    }).then(RELOAD());
  };

  return (
    <div className="bgr">
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
      <div className="inputForm" style={{ display: inpf }}>
        <div>
          <div>
            <input type="text" onChange={handleChangeName} />
          </div>
          <div>
            <input
              type="text"
              pattern="^\+?[0-9]\d{11}$"
              onChange={handleChangePhone1}
            />
          </div>
          <div>
            <select onChange={handleChangeYear}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="intern">intern</option>
            </select>
          </div>
          <div>
            <input type="text" onChange={handleChangeSid} />
          </div>
        </div>
        <button
          onClick={taker}
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
      </div>

      <div
        className="invoice"
        style={{ display: invoicer(invoice), zIndex: 9998 }}
      >
        <div className="invoiceForm">
          <div>
            <div>
              <input type="text" disabled value={userName} />
            </div>
            <div>
              <input type="text" disabled value={phoneNumber1} />
            </div>
            <div>
              <input type="text" disabled value={Year} />
            </div>
            <div>
              <input type="text" disabled value={Sid} />
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
