import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "../context/ContextProvider";
import "../App.css";
import axios from "axios";
import n1 from "../assets/n1.jpg";
import VideoStarting from "./VideoStarting";

const My_spaces = () => {
  const [mySpaces, setMySpaces] = useState([]);
  const [otherSpaces, setOtherSpaces] = useState([]);
  const [activeTab, setActiveTab] = useState("my"); // 'my' or 'join'
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const { backendUrl } = useContext(UserContext);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const token = localStorage.getItem("auth-token");

        // Fetch My Spaces
        const mySpacesRes = await axios.get(
          `${backendUrl}/api/v1/space/createdByUser`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMySpaces(mySpacesRes.data.spaces);
        setUsername(mySpacesRes.data.username);

        // Fetch Other Spaces (change API path as needed)
        const otherSpacesRes = await axios.get(
          `${backendUrl}/api/v1/space/notCreatedByUser`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOtherSpaces(otherSpacesRes.data.spaces);
        setUsername(otherSpacesRes.data.username);
      } catch (error) {
        console.error("Error fetching spaces:", error);
      }
    };

    fetchSpaces();
  }, [backendUrl]);

  const currentSpaces = activeTab === "my" ? mySpaces : otherSpaces;

  return (
    <div className="space_container">
      <div className="space_videostarting" ref={videoRef}>
        <VideoStarting userId={username} roomId={roomId} />
      </div>
      {/* Toggle Tabs */}
      <div className="space_tabs">
        <button
          className={`tab_button ${activeTab === "my" ? "active" : ""}`}
          onClick={() => setActiveTab("my")}
        >
          My Spaces
        </button>
        <button
          className={`tab_button ${activeTab === "join" ? "active" : ""}`}
          onClick={() => setActiveTab("join")}
        >
          Join Other User's Spaces
        </button>
      </div>

      <div className="space_header">
        <h1>{activeTab === "my" ? "My Spaces" : "Join Other User's Spaces"}</h1>
      </div>

      <div className="space_list">
        {activeTab === "my" ? (
          mySpaces.length > 0 ? (
            mySpaces.map((space) => (
              <div className="space_card" key={space.id}>
                <div className="space_card_image">
                  <img
                    src="https://cdn-static.zep.us/uploads/spaces/1d54oV/thumbnail/61e1814d6a444b2dbb7bea86f80c5640/0.webp?w=600"
                    alt={space.name}
                    className="space_image"
                  />
                </div>
                <div className="space_card_header">
                  <h4>{space.name}</h4>
                </div>
                <div className="space_card_footer">
                  <button
                    onClick={() => {
                      setRoomId(space.id);
                      videoRef.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="space_button"
                  >
                    Join
                  </button>

                  <button className="space_button">Edit</button>
                </div>
              </div>
            ))
          ) : (
            <p>No spaces created yet.</p>
          )
        ) : otherSpaces.length > 0 ? (
          otherSpaces.map((space) => (
            <div className="space_card" key={space.id}>
              <div className="space_card_image">
                <img
                  src="https://cdn-static.zep.us/uploads/spaces/1d54oV/thumbnail/61e1814d6a444b2dbb7bea86f80c5640/0.webp?w=600"
                  alt={space.name}
                  className="space_image"
                />
              </div>
              <div className="space_card_header">
                <h4>{space.name}</h4>
              </div>
              <div className="space_card_footer">
                <button
                  onClick={() => {
                    setRoomId(space.id);
                    videoRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="space_button"
                >
                  Join
                </button>

                {/* No edit button for other spaces */}
              </div>
            </div>
          ))
        ) : (
          <p>No spaces available to join.</p>
        )}
      </div>
    </div>
  );
};

export default My_spaces;
