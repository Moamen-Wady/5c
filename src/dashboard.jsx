import { useState, useEffect, useCallback, memo, lazy } from "react";
import "./dashboard.css";
const JsPDF = lazy(() => import("jspdf"));
import api, { isCancel } from "./api";

const InvoiceTable = memo(function InvoiceTableComponent({
  downloadInvoiceTable,
  buttonState,
  getResvs,
  resvs,
}) {
  return (
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
        <tbody>
          <tr>
            <th>Number</th>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Year</th>
            <th>Student ID</th>
          </tr>
          {resvs.map((resv, index) => {
            return (
              <tr resv={resv} key={resv.id + resv.year}>
                <td>{index + 1}</td>
                <td>{resv.userName}</td>
                <td>{resv.phoneNum1}</td>
                <td>{resv.year}</td>
                <td>{resv.sid}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
});

const LoginForm = memo(function LoginFormComponent({
  submitAdmin,
  buttonState,
}) {
  return (
    <form id="login" onSubmit={(e) => submitAdmin(e)} method="POST">
      <input type="email" name="email" id="email" />
      <input type="password" name="pw" id="pw" />
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
  }, []);

  useEffect(() => {
    const abortFetch = getResvs();
    return () => abortFetch();
  }, [getResvs]);

  const downloadInvoiceTable = useCallback(async () => {
    const report = new JsPDF("portrait", "pt", "a1");
    await report.html(document.querySelector(".Displaytable")).then(() => {
      report.save("attendance.pdf");
      notify("success", "Downloading PDF");
    });
  }, []);

  const submitAdmin = useCallback(async (e) => {
    e.preventDefault();
    setButtonState([true, "none", "grey", "black"]);
    notify("info", "Please Wait...");
    let newAdmin = {
      email: document.getElementById("email").value,
      pw: document.getElementById("pw").value,
    };
    await api
      .post(`/admin/hat`, {
        email: newAdmin.email,
        pw: newAdmin.pw,
      })
      .then((data) => {
        if (data.data.sts === "ok") {
          notify("success", "Logged in Successfully!");
          setAuthorized(newAdmin.email);
          localStorage.setItem("admin", newAdmin.email);
        } else {
          notify("error", data.data.message);
        }
      })
      .catch(() => {
        notify("error", "Network Error, Please Try Again.");
      })
      .finally(() => {
        setButtonState([false, "all", "white", "black"]);
      });
  }, []);

  return (
    <div>
      {Authorized ? (
        <>
          <InvoiceTable
            downloadInvoiceTable={downloadInvoiceTable}
            buttonState={buttonState}
            getResvs={getResvs}
            resvs={resvs}
          />
        </>
      ) : (
        <>
          <LoginForm submitAdmin={submitAdmin} buttonState={buttonState} />
        </>
      )}
    </div>
  );
});
