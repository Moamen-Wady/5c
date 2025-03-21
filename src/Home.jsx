import { useCallback, memo, useState, lazy } from "react";
const JsPDF = lazy(() => import("jspdf"));
import "./Home.css";
import api from "./api";

const FormComp = memo(function FormComponent({ tableUpdater, buttonState }) {
  return (
    <form className="inputForm" onSubmit={tableUpdater} method="POST" id="form">
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
        disabled={buttonState[0]}
        style={{
          pointerEvents: buttonState[1],
          backgroundColor: buttonState[2],
          color: buttonState[3],
        }}
      >
        Register
      </button>
    </form>
  );
});

const InvoiceComp = memo(function InvoiceComponent({
  downloadInvoiceTable,
  invoiceData,
  buttonState,
}) {
  return (
    <div className="invoice">
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
      <button
        onClick={downloadInvoiceTable}
        className="dwnbtn"
        disabled={buttonState[0]}
        style={{
          pointerEvents: buttonState[1],
          backgroundColor: buttonState[2],
          color: buttonState[3],
        }}
      >
        Download Ticket To View Code
      </button>
    </div>
  );
});

export default memo(function Home({ notify, buttonState, setButtonState }) {
  const [Sidhash, setSidhash] = useState("");
  const [invoice, setInvoice] = useState("none");
  const [invoiceData, setInvoiceData] = useState({
    userName: "",
    phoneNum1: "",
    year: "",
    sid: "",
  });
  const RELOAD = useCallback(() => {
    return new Promise(() => {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    });
  }, []);
  const tableUpdater = useCallback(async (e) => {
    e.preventDefault();
    setButtonState([true, "none", "grey", "black"]);
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
      return setButtonState([false, "all", "white", "black"]);
    }
    if (!sidRegex.test(newInvoiceData.sid)) {
      notify("error", "Id is invalid!");
      return setButtonState([false, "all", "white", "black"]);
    }
    if (!phoneRegex.test(newInvoiceData.phoneNum1)) {
      notify("error", "Phone number is invalid!");
      return setButtonState([false, "all", "white", "black"]);
    }
    setInvoiceData(newInvoiceData);

    await api
      .post(`/reservations/`, {
        userName: newInvoiceData.userName,
        phoneNum1: newInvoiceData.phoneNum1,
        year: newInvoiceData.year,
        sid: newInvoiceData.sid,
      })
      .then((data) => {
        if (data.data.sts === "ok") {
          notify("success", "Success!");
          setSidhash(data.data.code);
          setInvoice("block");
        } else {
          notify("error", data.data.message);
        }
      })
      .catch(() => {
        notify("error", "Network Error, Please Try Again");
      })
      .finally(() => {
        setButtonState([false, "all", "white", "black"]);
      });
  }, []);

  const downloadInvoiceTable = useCallback(async () => {
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
      notify("success", "Downloading, The Page Will Reload");
    }).then(RELOAD());
  }, []);

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
      {invoice === "none" ? (
        <FormComp tableUpdater={tableUpdater} buttonState={buttonState} />
      ) : (
        <InvoiceComp
          downloadInvoiceTable={downloadInvoiceTable}
          invoiceData={invoiceData}
          buttonState={buttonState}
        />
      )}

      {/* <div className="copyRights">
        <p>
          Copyright &#169;{new Date().getFullYear()}{" "}
          <a href="https://wa.me/+201014943278">Moamen Wady</a>
        </p>
      </div> */}
    </div>
  );
});
