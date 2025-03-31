import { useState, useEffect, useCallback, memo, useRef } from "react";
import "./dashboard.css";
import api, { isCancel } from "./api";

const InvoiceTable = memo(
  ({ downloadInvoiceTable, buttonState, getResvs, resvs }) => (
    <>
      <div className="btnCont">
        <button
          className="dwn"
          onClick={downloadInvoiceTable}
          disabled={buttonState[0]}
          style={{
            pointerEvents: buttonState[1],
            backgroundColor: buttonState[2],
            color: buttonState[3],
          }}
        >
          Download PDF
        </button>
        <button
          className="dwn"
          onClick={getResvs}
          disabled={buttonState[0]}
          style={{
            pointerEvents: buttonState[1],
            backgroundColor: buttonState[2],
            color: buttonState[3],
          }}
        >
          Refresh List
        </button>
      </div>
      <table className="Displaytable">
        <thead>
          <tr>
            <th>Number</th>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Year</th>
            <th>Student ID</th>
          </tr>
        </thead>
        <tbody>
          {resvs.map((resv, index) => (
            <tr key={resv.sid + resv.year}>
              <td>{index + 1}</td>
              <td>{resv.userName}</td>
              <td>{resv.phoneNum1}</td>
              <td>{resv.year}</td>
              <td>{resv.sid}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
);

const LoginForm = memo(({ submitAdmin, buttonState }) => {
  const emailRef = useRef(null);
  const pwRef = useRef(null);

  return (
    <form
      id="login"
      onSubmit={(e) =>
        submitAdmin(e, emailRef.current.value, pwRef.current.value)
      }
      method="POST"
    >
      <input type="email" name="email" id="email" ref={emailRef} required />
      <input type="password" name="pw" id="pw" ref={pwRef} required />
      <input
        type="submit"
        value="Login"
        disabled={buttonState[0]}
        style={{
          pointerEvents: buttonState[1],
          backgroundColor: buttonState[2],
          color: buttonState[3],
        }}
      />
    </form>
  );
});

export default memo(function Dashboard({
  notify,
  Authorized,
  setAuthorized,
  buttonState,
  setButtonState,
}) {
  const [resvs, setResvs] = useState([]);

  const getResvs = useCallback(() => {
    const controller = new AbortController();
    api
      .get("/reservations", { signal: controller.signal })
      .then((res) => {
        setResvs(res.data.resvs);
      })
      .catch((err) => {
        if (!isCancel(err)) {
          notify("error", "NETWORK ERROR, Failed to fetch reservations");
        }
      });

    return () => controller.abort();
  }, [notify]);

  useEffect(() => {
    getResvs();
  }, [getResvs]);

  const downloadInvoiceTable = useCallback(async () => {
    try {
      const { default: JsPDF } = await import("jspdf");
      const report = new JsPDF("portrait", "pt", "a1");
      const tableElement = document.querySelector(".Displaytable");

      if (tableElement) {
        await report.html(tableElement);
        report.save("attendance.pdf");
        notify("success", "Downloading PDF");
      } else {
        notify("error", "Table not found");
      }
    } catch (error) {
      notify("error", "Failed to generate PDF");
    }
  }, [notify]);

  const submitAdmin = useCallback(
    async (e, email, pw) => {
      e.preventDefault();
      setButtonState([true, "none", "grey", "black"]);
      notify("info", "Please Wait...");

      try {
        const { data } = await api.post(`/admin/hat`, { email, pw });

        if (data.sts === "ok") {
          notify("success", "Logged in Successfully!");
          setAuthorized(email);
          localStorage.setItem("admin", email);
        } else {
          notify("error", data.message);
        }
      } catch {
        notify("error", "Network Error, Please Try Again.");
      } finally {
        setButtonState([false, "all", "white", "black"]);
      }
    },
    [notify, setAuthorized, setButtonState]
  );

  return (
    <div>
      {Authorized ? (
        <InvoiceTable
          downloadInvoiceTable={downloadInvoiceTable}
          buttonState={buttonState}
          getResvs={getResvs}
          resvs={resvs}
        />
      ) : (
        <LoginForm submitAdmin={submitAdmin} buttonState={buttonState} />
      )}
    </div>
  );
});
