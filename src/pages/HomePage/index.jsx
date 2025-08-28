/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import { BoxFooter, DataTable } from "../../components";
import "./index.scss";
import { DatePicker } from "antd";
import moment from "moment";
import dayjs from "dayjs";
import { DataContext } from "../../context/DataContext";
import { toast } from "react-toastify";
import { useLoading } from "../../context/LoadingContext";
import { Helmet } from "react-helmet-async";

const getTodayDate = () => {
  return moment().format("DD-MM-YYYY");
};

const HomePage = () => {
  const [phNumber, setPhNumber] = useState("XXXXXXXXXX");
  const [ticketName1, setTicketName1] = useState("");
  const [ticketName2, setTicketName2] = useState("");
  const [ticketName3, setTicketName3] = useState("");
  const [ticketName4, setTicketName4] = useState("");
  const [ticketName5, setTicketName5] = useState("");
  const [ticketName6, setTicketName6] = useState("");
  const [date, setDate] = useState(getTodayDate());
  const { getResultsByDate, getSettingsById } = useContext(DataContext);
  const { showLoading, hideLoading } = useLoading();
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        showLoading();
        const data = await getResultsByDate(date);
        const settings = await getSettingsById("masterSettings");
        setPhNumber(settings?.data?.phoneNumber);
        setTicketName1(settings.data.ticketName1);
        setTicketName2(settings.data.ticketName2);
        setTicketName3(settings.data.ticketName3);
        setTicketName4(settings.data.ticketName4);
        setTicketName5(settings.data.ticketName5);
        setTicketName6(settings.data.ticketName6);

        if (data?.data) {
          setResults(data?.data);
        } else if (data?.error === "Not Found!") {
          setResults([]);
        } else {
          toast.error("Something Went Wrong!");
        }
      } catch (error) {
        console.error("Error fetching Data: ", error);
      } finally {
        hideLoading();
      }
    };
    fetchResults();
  }, []);

  const handleDateChange = (_, dateString) => {
    setDate(() => dateString);
  };

  const submitSearch = async () => {
    try {
      showLoading();
      const data = await getResultsByDate(date);
      if (data?.data) {
        setResults(data?.data);
      } else if (data?.error === "Not Found!") {
        setResults([]);
      } else {
        toast.error("Something Went Wrong!");
      }
    } catch (error) {
      console.error("Error fetching results: ", error);
    } finally {
      hideLoading();
    }
  };
  return (
    <div className="home-page">
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
      <div className="box-container">
        <div className="top-panel">
          <h1 className="main-heading">North East India Lottery</h1>
          <p className="sub-heading">Daily Result Chart</p>
          <p className="info">
            CONTACT FOR RESULT SMS & CUSTOMER CARE: {phNumber}
          </p>
          <label>
            Select Date
            <DatePicker
              className="date-input"
              onChange={handleDateChange}
              format={"DD-MM-YYYY"}
              defaultValue={dayjs(date, "DD-MM-YYYY")}
              size="small"
            />
            <button
              type="button"
              className="search-btn"
              onClick={submitSearch}
            >
              Search
            </button>
          </label>
        </div>
        <DataTable
          results={results}
          ticketName1={ticketName1}
          ticketName2={ticketName2}
          ticketName3={ticketName3}
          ticketName4={ticketName4}
          ticketName5={ticketName5}
          ticketName6={ticketName6}
        />
        <BoxFooter />
      </div>
    </div>
  );
};

export default HomePage;
