import React,{useState} from "react";
import { Link } from 'react-router-dom';
import VideoSection from "./VideoSection";

const Home=()=>{
    const [showDialog, setShowDialog] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [userQuery, setUserQuery] = useState("");
    const [output, setOutput] = useState("");

    const toggleDialog = () => {
        setShowDialog(prev => !prev);
    };

    
    const fetchingData = () => {
        fetch("http://127.0.0.1:8000/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: userQuery })
        })
        .then(res => res.json())
        .then(data => console.log(data));
    }
    
    const setValue=(e)=>{
        console.log(e.target.textContent);
        setUserQuery(e.target.textContent);
        fetchingData();
    }

    return(
        <>
            <div className="chatbot">
                <div className="chatbot_inner" onClick={toggleDialog}>?</div>
                {showDialog && (
                    <div className="chatbot_dialog_box">
                        <div className="chatbot_title_box">
                            <div className="navbar_logo">
                                <img src="https://zep.us/images/light/layout/logo_zep.svg" alt="Logo" />
                            </div>
                        </div>
                        <div className="chatbot_content">
                            <div className="chatbot_content_welcome">Hello wave
                            Welcome to ZEP — the metaverse for everyone! sparkles
                            From basic usage to helpful tips, you can find everything in the ZEP User Guide below.
                            You can also check out our FAQ page to get answers to common questions!
                            If you have any other inquiries, please select the appropriate button below smile</div>
                            <div className="chatbot_content_chat">
                                {!showChat &&(<button onClick={()=>{setShowChat(true)}} >Start a chat</button>)} 
         
                            </div>
                            {output && (
                                <div className="chatbot_content_chat"></div>
                            )}
                            {showChat && (
                                <div className="chatbot_content_chat">
                                    {/* <input type="text" placeholder="Ask your query" value={userQuery} onChange={(e)=>setUserQuery(e.target.value)}/>
                                    <div className="chatbot_go_button" onClick={fetchingData}>Go</div> */}
                                    <div className="chatbot_query_options" onClick={setValue}>What is metaverse?</div>
                                    <div className="chatbot_query_options" onClick={setValue}>What is the ZEP ?</div>
                                    <div className="chatbot_query_options" onClick={setValue}>How to create a space in ZEP world?</div>
                                    <div className="chatbot_query_options" onClick={setValue}>How to join existing space?</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <VideoSection/>
            <div className="section_third">
                <div className="section_third_title"> Tons of People are Using Zep</div>
                <div className="section_third_content">
                    <div className="section_third_content_item">
                        <p>MAU(Monthly Active Users)</p>
                        <div className="numeric_data"><h1>1.23M</h1></div>
                    </div>
                    <div className="section_third_content_item">
                        <p>Daily Space creation average</p>
                        <div className="numeric_data"><h1>1800+</h1></div>
                    </div>
                    <div className="section_third_content_item">
                        <p>Average User Attention Time</p>
                        <div className="numeric_data"><h1>40 mins</h1></div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home;