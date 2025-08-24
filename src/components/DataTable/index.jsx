import React, { useContext } from "react";
import "./index.scss";
import { TableRow } from "../TableRow";

export const DataTable = ({
  results,
  ticketName1,
  ticketName2,
  ticketName3,
  ticketName4,
  ticketName5,
  ticketName6,
}) => {
  return (
    <div className="table">
      <div className="table-header-1">
        <span className="draw-time">DrawTime</span>
        <span>{ticketName1 ? ticketName1 : "Ticket 1"}</span>
        <span>{ticketName2 ? ticketName2 : "Ticket 2"}</span>
        <span>{ticketName3 ? ticketName3 : "Ticket 3"}</span>
        <span>{ticketName4 ? ticketName4 : "Ticket 4"}</span>
        <span>{ticketName5 ? ticketName5 : "Ticket 5"}</span>
        <span>{ticketName6 ? ticketName6 : "Ticket 6"}</span>
      </div>
      {results?.map((item) => {
        if (item["declared"])
          return (
            <TableRow
              key={item["time"]}
              data={item}
            />
          );
        return null;
      })}
    </div>
  );
};

export default DataTable;
