import React, { useEffect, useState } from "react";
import { useData } from "../../context/DataContext";
import "./index.scss";

const DrawPage = () => {
  const { getSettingsById, getResultByDateTime } = useData();
  const [ticketName1, setTicketName1] = useState("");
  const [ticketName2, setTicketName2] = useState("");
  const [ticketName3, setTicketName3] = useState("");
  const [ticketName4, setTicketName4] = useState("");
  const [ticketName5, setTicketName5] = useState("");
  const [ticketName6, setTicketName6] = useState("");
  const [lastDrawn, setLastDrawn] = useState(null);

  const [rnd1, setRnd1] = useState(0);
  const [rnd2, setRnd2] = useState(0);

  useEffect(() => {
    const randInterval = setInterval(() => {
      setRnd1(Math.floor(Math.random() * 10));
      setRnd2(Math.floor(Math.random() * 10));
    }, 75);

    return () => clearInterval(randInterval);
  }, []);

  useEffect(() => {
    let fetchTimer;
    let redirectTimer;

    (async () => {
      // 1) Wait 15s before fetching
      fetchTimer = setTimeout(async () => {
        try {
          const settingsId = "masterSettings";
          const settings = await getSettingsById(settingsId);
          const data = settings?.data || {};

          setTicketName1(data.ticketName1 ?? "");
          setTicketName2(data.ticketName2 ?? "");
          setTicketName3(data.ticketName3 ?? "");
          setTicketName4(data.ticketName4 ?? "");
          setTicketName5(data.ticketName5 ?? "");
          setTicketName6(data.ticketName6 ?? "");

          // Fetch lastDrawn
          if (data.lastDrawnDate && data.lastDrawnId) {
            const result = await getResultByDateTime(
              data.lastDrawnDate,
              data.lastDrawnId
            );
            setLastDrawn(result?.data ?? result);
          }

          // 2) Wait another 15s → redirect
          redirectTimer = setTimeout(() => {
            window.location.href = "/";
          }, 15000);
        } catch (err) {
          console.error("Error fetching:", err);
        }
      }, 15000);
    })();

    return () => {
      clearTimeout(fetchTimer);
      clearTimeout(redirectTimer);
    };
  }, []);

  return (
    <div className="draw-page">
    <div className="live-text">Live</div>
      <div className="draws">
        <div className="draw-container">
          <div className="draw-title">{ticketName1 || "SANGAM"}</div>
          <div className="draw-nums">
            <div className="draw-num">
              {lastDrawn && lastDrawn["1_"] ? lastDrawn["1_"][0] : rnd1}
            </div>
            <div className="draw-num">
              {lastDrawn && lastDrawn["1_"] ? lastDrawn["1_"][1] : rnd2}
            </div>
          </div>
        </div>
        <div className="draw-container">
          <div className="draw-title">{ticketName2 || "DELUXE"}</div>
          <div className="draw-nums">
            <div className="draw-num">
              {lastDrawn && lastDrawn["1_"] ? lastDrawn["2_"][0] : rnd1}
            </div>
            <div className="draw-num">
              {lastDrawn && lastDrawn["1_"] ? lastDrawn["2_"][1] : rnd2}
            </div>
          </div>
        </div>
        <div className="draw-container">
          <div className="draw-title">{ticketName3 || "SUPER"}</div>
          <div className="draw-nums">
            <div className="draw-num">
              {lastDrawn && lastDrawn["1_"] ? lastDrawn["3_"][0] : rnd1}
            </div>
            <div className="draw-num">
              {lastDrawn && lastDrawn["1_"] ? lastDrawn["3_"][1] : rnd2}
            </div>
          </div>
        </div>
        <div className="draw-container">
          <div className="draw-title">{ticketName4 || "MP DELUXE"}</div>
          <div className="draw-nums">
            <div className="draw-num">
              {lastDrawn && lastDrawn["1_"] ? lastDrawn["4_"][0] : rnd1}
            </div>
            <div className="draw-num">
              {lastDrawn && lastDrawn["1_"] ? lastDrawn["4_"][1] : rnd2}
            </div>
          </div>
        </div>
        <div className="draw-container">
          <div className="draw-title">{ticketName5 || "BHAGYA RE"}</div>
          <div className="draw-nums">
            <div className="draw-num">
              {lastDrawn && lastDrawn["1_"] ? lastDrawn["5_"][0] : rnd1}
            </div>
            <div className="draw-num">
              {lastDrawn && lastDrawn["1_"] ? lastDrawn["5_"][1] : rnd2}
            </div>
          </div>
        </div>
        <div className="draw-container">
          <div className="draw-title">{ticketName6 || "DIAMOND"}</div>
          <div className="draw-nums">
            <div className="draw-num">
              {lastDrawn && lastDrawn["1_"] ? lastDrawn["6_"][0] : rnd1}
            </div>
            <div className="draw-num">
              {lastDrawn && lastDrawn["1_"] ? lastDrawn["6_"][1] : rnd2}
            </div>
          </div>
        </div>
      </div>
      <div className="draw-time">
        <span>
          DRAW TIME:{" "}
          <font color="red">{lastDrawn ? lastDrawn["time"] : "Time Out"}</font>
        </span>
      </div>
    </div>
  );
};

export default DrawPage;
