import React from 'react';
import "../App.css"

function VideoSection() {
  return (
    <div className="video-container">
      <video className="landing-video" autoPlay loop muted>
        <source
          src="https://asset-zepetoful.zepeto.io/lZS2as4ZxDWZ/9P8X33wK87gtw7fX6Km48aG/Tm4Gf3wK8aD50a0ea4e7e36264312512abc49f95888twAmqDeqkAkO/landing_2.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
      {/* Optional: Add any overlay content here */}
      <div className="video-overlay">
        <h1>Welcome to Zepeto</h1>
        <p>Discover a new world of possibilities!</p>
      </div>
    </div>
  );
}

export default VideoSection;
