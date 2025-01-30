import "./dashboard.css";
import JsPDF from "jspdf";
import { useState, useEffect, useCallback, memo } from "react";
import api, { isCancel } from "./api";

const InvoiceTable = memo(
  ({ downloadInvoiceTable, dissub, getResvs, resvs }) => {
    return (
      <>
        <div className="btnCont">
          <button
            className="dwn"
            onClick={downloadInvoiceTable}
            disabled={dissub[0]}
            style={{
              pointerEvents: dissub[1],
              backgroundColor: dissub[2],
              color: dissub[3],
            }}
          >
            Download PDF
          </button>
          <button
            className="dwn"
            onClick={getResvs}
            disabled={dissub[0]}
            style={{
              pointerEvents: dissub[1],
              backgroundColor: dissub[2],
              color: dissub[3],
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
            {resvs.map((user, index) => {
              return (
                <tr user={user} key={user.id + user.year}>
                  <td>{index + 1}</td>
                  <td>{user.userName}</td>
                  <td>{user.phoneNum1}</td>
                  <td>{user.year}</td>
                  <td>{user.sid}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    );
  }
);

const LoginForm = memo(({ submitAdmin, dissub }) => {
  return (
    <form id="login" onSubmit={(e) => submitAdmin(e)} method="POST">
      <input type="email" name="email" id="email" />
      <input type="password" name="pw" id="pw" />
      <input
        type="submit"
        value="Login"
        disabled={dissub[0]}
        style={{
          pointerEvents: dissub[1],
          backgroundColor: dissub[2],
          color: dissub[3],
        }}
      />
    </form>
  );
});

export default function Dashboard({ notify, Authorized, setAuthorized }) {
  let [resvs, setResvs] = useState([]);
  let [dissub, setDissub] = useState([false, "all", "white", "black"]);

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
    setDissub([true, "none", "grey", "black"]);
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
          setDissub([false, "all", "white", "black"]);
        } else {
          notify("error", data.data.message);
          setDissub([false, "all", "white", "black"]);
        }
      })
      .catch(() => {
        notify("error", "Network Error, Please Try Again.");
        setDissub([false, "all", "white", "black"]);
      });
  }, []);

  return (
    <div>
      {Authorized ? (
        <>
          <InvoiceTable
            downloadInvoiceTable={downloadInvoiceTable}
            dissub={dissub}
            getResvs={getResvs}
            resvs={resvs}
          />
        </>
      ) : (
        <>
          <LoginForm submitAdmin={submitAdmin} dissub={dissub} />
        </>
      )}
    </div>
  );
}
