import { useCallback, memo, useState, useRef } from "react";
import "./Home.css";
import api from "./api";
import { FormEvent } from "react";

type formCompProps = {
  tableUpdater: (e: FormEvent) => Promise<void>;
  buttonState: (string | boolean)[];
};

const FormComp = memo(({ tableUpdater, buttonState }: formCompProps) => (
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
        <input required type="text" id="sid" name="sid" pattern="^[0-9mM ]+$" />
      </div>
    </div>
    <button
      type="submit"
      className="slctbtn"
      disabled={!!buttonState[0]}
      style={{
        pointerEvents:
          typeof buttonState[1] === "string"
            ? (buttonState[1] as React.CSSProperties["pointerEvents"])
            : undefined,
        backgroundColor:
          typeof buttonState[2] === "string"
            ? (buttonState[1] as React.CSSProperties["backgroundColor"])
            : undefined,
        color:
          typeof buttonState[3] === "string"
            ? (buttonState[1] as React.CSSProperties["color"])
            : undefined,
      }}
    >
      Register
    </button>
  </form>
));

type InvoiceCompProps = {
  downloadInvoiceTable: () => Promise<void>;
  invoiceData: {
    userName: string;
    phoneNum1: string;
    year: string;
    sid: string;
  };
  buttonState: (string | boolean)[];
};

const InvoiceComp = memo(
  ({ downloadInvoiceTable, invoiceData, buttonState }: InvoiceCompProps) => (
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
        disabled={!!buttonState[0]}
        style={{
          pointerEvents:
            typeof buttonState[1] === "string"
              ? (buttonState[1] as React.CSSProperties["pointerEvents"])
              : undefined,
          backgroundColor:
            typeof buttonState[2] === "string"
              ? (buttonState[1] as React.CSSProperties["backgroundColor"])
              : undefined,
          color:
            typeof buttonState[3] === "string"
              ? (buttonState[1] as React.CSSProperties["color"])
              : undefined,
        }}
      >
        Download Ticket To View Code
      </button>
    </div>
  )
);

type HomeProps = {
  notify: (type: "error" | "warn" | "success" | "info", msg: string) => void;
  buttonState: (string | boolean)[];
  setButtonState: React.Dispatch<React.SetStateAction<(string | boolean)[]>>;
};

export default memo(function Home({
  notify,
  buttonState,
  setButtonState,
}: HomeProps) {
  const [Sidhash, setSidhash] = useState("");
  const [invoice, setInvoice] = useState<"none" | "block">("none");
  const [invoiceData, setInvoiceData] = useState({
    userName: "",
    phoneNum1: "",
    year: "",
    sid: "",
  });
  const imgRef = useRef(null);

  const tableUpdater = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setButtonState([true, "none", "grey", "black"]);
      notify("info", "Please Wait...");

      const form = e.target as HTMLFormElement;
      const newInvoiceData = {
        userName: form.userName.value.trim(),
        phoneNum1: form.phoneNum1.value.trim(),
        year: form.year.value,
        sid: form.sid.value.trim(),
      };

      const phoneRegex = /^[0-9]\d{10,14}$/;
      const sidRegex = /^[0-9mM]+$/;
      if (!/^[A-Za-z ]+$/.test(newInvoiceData.userName)) {
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

      try {
        const { data } = await api.post(`/reservations/`, newInvoiceData);
        notify("success", "Success!");
        setSidhash(data.code);
        setInvoice("block");
      } catch (err) {
        console.log(err);
        if (err.status == 409) {
          notify("error", "This User Has a Reservation");
        } else if (err.status == 410 && newInvoiceData.year == "intern") {
          notify("error", "Sorry, All Intern Seats Have Been Reserved");
        } else if (err.status == 410 && newInvoiceData.year !== "intern") {
          notify("error", "Sorry, All Students' Seats Have Been Reserved");
        } else {
          notify("error", "Network Error, Please Try Again");
        }
      } finally {
        setButtonState([false, "all", "white", "black"]);
      }
    },
    [notify, setButtonState]
  );

  const downloadInvoiceTable = useCallback(async () => {
    try {
      const { default: JsPDF } = await import("jspdf");
      const report = new JsPDF("p", "pt", "a2");
      report.setFontSize(30);

      if (imgRef.current) {
        report.addImage(imgRef.current, "webp", 0, 0, 1200, 1200);
      } else {
        notify("error", "Image not loaded");
        return;
      }

      report.text(invoiceData.userName.toUpperCase(), 575, 600);
      report.text(invoiceData.phoneNum1, 575, 653);
      report.text(invoiceData.year, 575, 705);
      report.text(invoiceData.sid, 575, 757);
      report.text(Sidhash, 575, 809);

      report.save("invoice.pdf");
      notify("success", "Downloading, The Page Will Reload");

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      notify("error", "Failed to generate PDF");
    }
  }, [invoiceData, Sidhash, notify]);

  return (
    <div>
      <picture>
        <source srcSet="/TICKETi.webp" />
        <img
          ref={imgRef}
          src="/TICKETi.jpg"
          alt="Ticket"
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
    </div>
  );
});
