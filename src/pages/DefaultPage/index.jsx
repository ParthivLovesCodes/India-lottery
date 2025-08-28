/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useData } from "../../context/DataContext";
import { useLoading } from "../../context/LoadingContext";
import "./index.scss";
import playIcon from "../../assets/images/play.png";
import lotteryHeader from "../../assets/images/lotteryHeader.png";
import { Helmet } from "react-helmet-async";

const DefaultPage = () => {
  const { getSettingsById, getResultByDateTime } = useData();
  const { showLoading, hideLoading } = useLoading();
  const [phNumber, setPhNumber] = useState("");
  const [ticketName1, setTicketName1] = useState("");
  const [ticketName2, setTicketName2] = useState("");
  const [ticketName3, setTicketName3] = useState("");
  const [ticketName4, setTicketName4] = useState("");
  const [ticketName5, setTicketName5] = useState("");
  const [ticketName6, setTicketName6] = useState("");

  // Time states
  const [currentTime, setCurrentTime] = useState(new Date(Date.now() - 60000));
  const [nextDrawTime, setNextDrawTime] = useState("99:99 PM");
  const [timeToDraw, setTimeToDraw] = useState("00:00:00");
  const [lastDrawn, setLastDrawn] = useState(null);

  useEffect(() => {
    const checkVisibility = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      // Define draw windows: [1-2), [16-17), [31-32), [46-47)
      // Accept only within the first 30 seconds of the draw minute
      const drawWindows = [1, 16, 31, 46];
      for (let i = 0; i < drawWindows.length; i++) {
        if (minutes === drawWindows[i] && seconds <= 30) {
          // Only redirect if not already on /draw
          if (window.location.pathname !== "/draw") {
            window.location.href = "/draw";
          }
          return;
        }
      }
    };

    // Run immediately
    checkVisibility();

    // Recheck every second to respect the 30-second acceptance window
    const interval = setInterval(checkVisibility, 1000);

    return () => clearInterval(interval);
  }, []);

  const [rnd1, setRnd1] = useState(0);
  const [rnd2, setRnd2] = useState(0);

  useEffect(() => {
    const randInterval = setInterval(() => {
      setRnd1(Math.floor(Math.random() * 10));
      setRnd2(Math.floor(Math.random() * 10));
    }, 100); // 0.3 seconds

    return () => clearInterval(randInterval);
  }, []);

  // Real-time clock update
  const calculateNextDraw = (now) => {
    const startHour = 9; // 9 AM
    const endHour = 21; // 9 PM
    const intervalMins = 15;

    let next = new Date(now);
    let last = new Date(now);

    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Case 1: Before 9 AM → next = today 9:00 AM, last = yesterday 9:00 PM
    if (hours < startHour) {
      next.setHours(startHour, 0, 0, 0);

      last.setDate(last.getDate() - 1);
      last.setHours(endHour, 0, 0, 0);
    }
    // Case 2: After 9 PM → next = tomorrow 9:00 AM, last = today 9:00 PM
    else if (hours >= endHour) {
      next.setDate(next.getDate() + 1);
      next.setHours(startHour, 0, 0, 0);

      last.setHours(endHour, 0, 0, 0);
    }
    // Case 3: Within 9 AM - 9 PM → snap to next 15-min mark
    else {
      next.setSeconds(0, 0);
      let nextMinutes = Math.ceil(minutes / intervalMins) * intervalMins;
      let nextHour = hours;

      if (nextMinutes === 60) {
        nextMinutes = 0;
        nextHour++;
      }

      next.setHours(nextHour, nextMinutes, 0, 0);

      // If snapped past 9 PM, push to tomorrow 9 AM
      if (nextHour >= endHour) {
        next.setDate(next.getDate() + 1);
        next.setHours(startHour, 0, 0, 0);
        last.setHours(endHour, 0, 0, 0);
      } else {
        // last draw = previous 15-min slot
        let lastMinutes = Math.floor(minutes / intervalMins) * intervalMins;
        let lastHour = hours;

        last.setSeconds(0, 0);
        last.setHours(lastHour, lastMinutes, 0, 0);
      }
    }

    return [next, last];
  };

  useEffect(() => {
    let interval;

    const init = async () => {
      try {
        showLoading();

        // 1. Fetch Settings
        const settingsId = "masterSettings";
        const result = await getSettingsById(settingsId);
        // 2. Setup real-time clock
        const [timeNext, lastTime] = calculateNextDraw(
          new Date(Date.now() - 60000)
        );
        setNextDrawTime(formatTime(timeNext, false));

        if (result.success) {
          setPhNumber(result.data.phoneNumber);
          setTicketName1(result.data.ticketName1);
          setTicketName2(result.data.ticketName2);
          setTicketName3(result.data.ticketName3);
          setTicketName4(result.data.ticketName4);
          setTicketName5(result.data.ticketName5);
          setTicketName6(result.data.ticketName6);

          // fetch last drawn ticket
          const ticketRes = await getResultByDateTime(
            result.data.lastDrawnDate,
            result.data.lastDrawnId
          );
          if (ticketRes.data && nextDrawTime !== "09:00 AM") {
            setLastDrawn(ticketRes.data);
          }
        } else {
          toast.error("Something Went Wrong !");
          console.error(result.error);
        }

        interval = setInterval(() => {
          const now = new Date(Date.now() - 60000);
          setCurrentTime(now);

          if (timeNext > now) {
            const diff = timeNext - now;
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            if (h || m >= 15) {
              setTimeToDraw("Time Out");
            } else {
              setTimeToDraw(
                `${h.toString().padStart(2, "0")}:${m
                  .toString()
                  .padStart(2, "0")}:${s.toString().padStart(2, "0")}`
              );
            }
          }
        }, 1000);
      } catch (error) {
        console.error("Error initializing:", error);
        toast.error("Failed to load data!");
      } finally {
        hideLoading();
      }
    };

    init();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Format current time
  const formatTime = (date, isSecondReq = true) => {
    return isSecondReq
      ? date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      : date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
  };

  // Format current date
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="default-page">
      <Helmet>
        <title>
          North East India Lottery | Best Online Lottery in North East India
        </title>
        <meta
          name="description"
          content="Play North East India Lottery and win big with the best online lottery platform in North East India. Join now for exciting draws and results!"
        />
        <meta
          name="keywords"
          content="North East India Lottery, online lottery, North East lottery, win big, lottery results, Assam, Meghalaya, Nagaland, Sikkim, Arunachal, Manipur, Mizoram, Tripura"
        />
      </Helmet>
      <div className="content-container">
        <img
          src={lotteryHeader}
          alt="Lottery Header"
          className="lottery-header"
        />
        <div className="time-container">
          {/* News Ticker Banner */}
          <div className="news-ticker">
            <div className="ticker-content">
              CHETAK KA RESULT KE LIYE CONT. KARE- {phNumber || "01140451770"}
            </div>
          </div>

          {/* Time Panels */}
          <div className="time-panels">
            <div className="time-panel yellow">
              <div className="panel-label">Next Draw Time</div>
              <div className="panel-value">{nextDrawTime}</div>
            </div>

            <div className="time-panel green">
              <div className="panel-label">Today Date</div>
              <div className="panel-value">{formatDate(currentTime)}</div>
            </div>

            <div className="time-panel pink">
              <div className="panel-label">Now Time</div>
              <div className="panel-value">{formatTime(currentTime)}</div>
            </div>

            <div className="time-panel red">
              <div className="panel-label">Time To Draw</div>
              <div className="panel-value">{timeToDraw}</div>
            </div>
          </div>
        </div>
        <div className="ticket-table">
          <div className="table-header">
            <span>Name</span>
            <span className="left-b">Sr.</span>
            <span className="left-b">Win</span>
            <span className="left-b">0</span>
            <span className="left-b">1</span>
            <span className="left-b">2</span>
            <span className="left-b">3</span>
            <span className="left-b">4</span>
            <span className="left-b">5</span>
            <span className="left-b">6</span>
            <span className="left-b">7</span>
            <span className="left-b">8</span>
            <span className="left-b">9</span>
            <span className="left-b">Qty.</span>
            <span className="left-b">Amt.</span>
            <span className="left-b">
              {lastDrawn ? lastDrawn["time"] : "Time Out"}
            </span>
          </div>
          <div className="table-row">
            <div className="name">
              <span className="topp">{ticketName1}</span>
              <span className="bottom">SAPNA</span>
            </div>
            <span className="left-b">A</span>
            <span className="left-b">100</span>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input
                type="text"
                className="large-input"
                value="0"
              />
            </div>
            <div className="left-b">
              <input
                type="text"
                className="large-input"
                value="0"
              />
            </div>
            <span className="left-b res">
              {lastDrawn ? lastDrawn["1_"] : "-"}
            </span>
          </div>
          <div className="table-row green">
            <div className="name">
              <span className="topp">{ticketName2}</span>
              <span className="bottom">SAPNA</span>
            </div>
            <span className="left-b">B</span>
            <span className="left-b">100</span>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input
                type="text"
                className="large-input"
                value="0"
              />
            </div>
            <div className="left-b">
              <input
                type="text"
                className="large-input"
                value="0"
              />
            </div>
            <span className="left-b res">
              {lastDrawn ? lastDrawn["2_"] : "-"}
            </span>
          </div>
          <div className="table-row blue">
            <div className="name">
              <span className="topp">{ticketName3}</span>
              <span className="bottom">SAPNA</span>
            </div>
            <span className="left-b">C</span>
            <span className="left-b">100</span>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input
                type="text"
                className="large-input"
                value="0"
              />
            </div>
            <div className="left-b">
              <input
                type="text"
                className="large-input"
                value="0"
              />
            </div>
            <span className="left-b res">
              {lastDrawn ? lastDrawn["3_"] : "-"}
            </span>
          </div>
          <div className="table-row orange">
            <div className="name">
              <span className="topp">{ticketName4}</span>
              <span className="bottom">SAPNA</span>
            </div>
            <span className="left-b">D</span>
            <span className="left-b">100</span>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input
                type="text"
                className="large-input"
                value="0"
              />
            </div>
            <div className="left-b">
              <input
                type="text"
                className="large-input"
                value="0"
              />
            </div>
            <span className="left-b res">
              {lastDrawn ? lastDrawn["4_"] : "-"}
            </span>
          </div>
          <div className="table-row brown">
            <div className="name">
              <span className="topp">{ticketName5}</span>
              <span className="bottom">SAPNA</span>
            </div>
            <span className="left-b">E</span>
            <span className="left-b">100</span>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input
                type="text"
                className="large-input"
                value="0"
              />
            </div>
            <div className="left-b">
              <input
                type="text"
                className="large-input"
                value="0"
              />
            </div>
            <span className="left-b res">
              {lastDrawn ? lastDrawn["5_"] : "-"}
            </span>
          </div>
          <div className="table-row pink">
            <div className="name">
              <span className="topp">{ticketName6}</span>
              <span className="bottom">SAPNA</span>
            </div>
            <span className="left-b">F</span>
            <span className="left-b">100</span>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input type="text" />
            </div>
            <div className="left-b">
              <input
                type="text"
                className="large-input"
                value="0"
              />
            </div>
            <div className="left-b">
              <input
                type="text"
                className="large-input"
                value="0"
              />
            </div>
            <span className="left-b res">
              {lastDrawn ? lastDrawn["6_"] : "-"}
            </span>
          </div>
          <div className="login-row">
            <div className="loginn">
              <span>LOGINID:</span>
              <input
                type="text"
                className="login-input"
              />
            </div>
            <div className="loginn">
              <span>PASSWORD:</span>
              <input
                type="password"
                className="login-input"
              />
            </div>
            <div className="button">
              <input
                type="button"
                value="Login"
              />
            </div>
            <div className="loginn total">
              <span>Total:</span>
              <input
                type="text"
                value="0"
                className="total"
              />
              <input
                type="text"
                value="0"
                className="total"
              />
            </div>
          </div>
          <div className="button-row">
            <a href="/result">
              <div className="big-button">
                <input
                  type="button"
                  value="RESULT CHART"
                />
              </div>
            </a>
            <div className="big-button">
              <input
                type="button"
                value="FREE ACCOUNT"
              />
            </div>
            <div className="big-button">
              <input
                type="button"
                value="USER LOGIN"
              />
            </div>
            <div className="big-button">
              <input
                type="button"
                value="HOW TO PLAY"
              />
            </div>
            <div className="img-container">
              <img
                src={playIcon}
                alt="play"
              />
            </div>
          </div>
        </div>
        <div className="imp-text">
          <span>
            Purchase of lottery using this website is strictly prohibited in the
            states where lotteries are banned. You must be above 18 years to
            play Online Lottery.{" "}
            <a
              href="https://www.northeastindialottery.com"
              target="_blank"
            >
              ©northeastindialottery.com
            </a>{" "}
            all rights reserved.
          </span>
        </div>
      </div>
    </div>
  );
};

export default DefaultPage;
