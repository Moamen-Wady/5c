import { useState, useEffect, useCallback, memo, useRef } from "react";
import "./dashboard.css";
import api, { isCancel } from "./api";
import { FormEvent } from "react";

type Resv = {
  userName: string;
  phoneNum1: string;
  year: string;
  sid: string;
};

type InvoiceTableProps = {
  downloadInvoiceTable: () => Promise<void>;
  buttonState: (string | boolean)[];
  getResvs: (controller: AbortController) => Promise<void>;
  resvs: Resv[];
};

const InvoiceTable = memo(
  ({
    downloadInvoiceTable,
    buttonState,
    getResvs,
    resvs,
  }: InvoiceTableProps) => {
    let controller = new AbortController();
    return (
      <>
        <div className="btnCont">
          <button
            className="dwn"
            onClick={downloadInvoiceTable}
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
            Download PDF
          </button>
          <button
            className="dwn"
            onClick={() => getResvs(controller)}
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
              <tr key={` ${resv.sid}${resv.year}`}>
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
    );
  }
);

type LoginFormProps = {
  submitAdmin: (e: FormEvent, email: string, pw: string) => Promise<void>;
  buttonState: (string | boolean)[];
};

const LoginForm = memo(({ submitAdmin, buttonState }: LoginFormProps) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);

  return (
    <form
      id="login"
      onSubmit={(e) => {
        if (emailRef.current && pwRef.current) {
          submitAdmin(e, emailRef.current.value, pwRef.current.value);
        }
      }}
      method="POST"
    >
      <input type="email" name="email" id="email" ref={emailRef} required />
      <input type="password" name="pw" id="pw" ref={pwRef} required />
      <input
        type="submit"
        value="Login"
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
      />
    </form>
  );
});

type dashboardProps = {
  notify: (type: "warn" | "error" | "success" | "info", msg: string) => void;
  Authorized: string | null;
  setAuthorized: React.Dispatch<React.SetStateAction<string | null>>;
  buttonState: (string | boolean)[];
  setButtonState: React.Dispatch<React.SetStateAction<(string | boolean)[]>>;
};

export default memo(function Dashboard({
  notify,
  Authorized,
  setAuthorized,
  buttonState,
  setButtonState,
}: dashboardProps) {
  const [resvs, setResvs] = useState<Resv[]>([]);

  const getResvs = useCallback(
    async (controller: AbortController) => {
      try {
        const response = await api.get("/reservations", {
          signal: controller.signal,
        });
        setResvs(response.data.resvs);
      } catch (err) {
        if (!isCancel(err)) {
          notify("error", "NETWORK ERROR, Failed to update reservations");
        }
      } finally {
        controller.abort();
      }
    },
    [notify]
  );

  useEffect(() => {
    const controller = new AbortController();
    getResvs(controller);
    return () => {
      controller.abort();
    };
  }, [getResvs]);

  const downloadInvoiceTable = useCallback(async () => {
    try {
      const { default: JsPDF } = await import("jspdf");
      const report = new JsPDF("portrait", "pt", "a1");
      const tableElement = document.querySelector(
        ".Displaytable"
      ) as HTMLElement;

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
    async (e: FormEvent, email: string, pw: string) => {
      e.preventDefault();
      setButtonState([true, "none", "grey", "black"]);
      notify("info", "Please Wait...");

      const res = await api
        .post(`/admin/hat`, { email, pw })
        .then((res) => {
          notify("success", "Logged in Successfully!");
          setAuthorized(email);
          localStorage.setItem("admin", email);
        })
        .catch((err) => {
          if (err.status === 401) {
            notify("error", "Password Is Incorrect");
          } else if (err.status === 404) {
            notify("error", "Admin Not Found.");
          } else {
            notify("error", "Network Error, Please Try Again.");
          }
        })
        .finally(() => setButtonState([false, "all", "white", "black"]));
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
