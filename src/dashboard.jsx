import "./dashboard.css";
import JsPDF from "jspdf";
import { useState, useEffect } from "react";
import api from "./api";
import { useCallback } from "react";
export default function Dashboard({ notify }) {
  let [resvs, setResvs] = useState([]);
  useEffect(() => {
    api
      .get("/reservations")
      .then((res) => {
        setResvs(res.data.resvs);
      })
      .catch(() => {
        notify("error", "NETWORK ERROR, Failed to fetch reservations");
      });
  }, []);

  const downloadInvoiceTable = useCallback(async () => {
    const report = new JsPDF("portrait", "pt", "a1");
    await report.html(document.querySelector(".Displaytable")).then(() => {
      report.save("attendance.pdf");
      notify("success", "Downloading PDF");
    });
  });
  return (
    <div>
      <button className="dwn" onClick={downloadInvoiceTable}>
        Download PDF
      </button>
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
              <tr user={user} key={user.phoneNum1}>
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
    </div>
  );
}
