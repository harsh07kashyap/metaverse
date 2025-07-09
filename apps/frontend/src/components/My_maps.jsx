import React, { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../context/ContextProvider";

const MyMaps = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);
  
  // Element State
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  // Map State
  const [mapName, setMapName] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [dimensions, setDimensions] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const { backendUrl } = useContext(UserContext);

  // Open & Close Dialog
  const openDialog = () => setShowDialog(true);
  const closeDialog = () => setShowDialog(false);

  // Handle Image Upload for Elements & Maps
  const handleImageUpload = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;

      img.onload = function () {
        if (type === "element") {
          setWidth(img.width);
          setHeight(img.height);
          setImageUrl(e.target.result); // Preview
        } else {
          setThumbnail(e.target.result);
          setDimensions(`${img.width}x${img.height}`);
        }
      };
    };
  };

  // Upload Image to Cloudinary
  const uploadToCloudinary = async (type) => {
    if (!imageFile) return alert("Please select an image first!");

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "my_unsigned_preset"); // Replace with your Cloudinary preset

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dbp50plxb/image/upload",
        formData
      );
      setIsUploading(false);
      return response.data.secure_url; // Cloudinary URL
    } catch (error) {
      setIsUploading(false);
      console.error("Cloudinary Upload Error:", error);
      return null;
    }
  };

  // Submit Element Form
  const handleElementSubmit = async (event) => {
    event.preventDefault();

    // Upload image to Cloudinary first
    const uploadedImageUrl = await uploadToCloudinary("element");
    if (!uploadedImageUrl) return;

    const elementData = {
      imageUrl: uploadedImageUrl,
      width,
      height,
      static: false, // Change as needed
    };

    try {
      const token = localStorage.getItem("auth-token");
      const response = await axios.post(`${backendUrl}/api/v1/admin/element`, elementData, {
        headers: { Authorization: "Bearer " + token },
      });
      alert("Element Created Successfully! ID: " + response.data.id);
      closeDialog();
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to create element");
    }
  };

  // Submit Map Form
  const handleMapSubmit = async (e) => {
    e.preventDefault();

    // Upload thumbnail to Cloudinary first
    const uploadedThumbnailUrl = await uploadToCloudinary("map");
    if (!uploadedThumbnailUrl) return;

    try {
      const token = localStorage.getItem("auth-token");
      const response = await axios.post(`${backendUrl}/api/v1/admin/map`, {
        name: mapName,
        thumbnail: uploadedThumbnailUrl,
        dimensions,
        defaultElements: [],
      },{
        headers: { Authorization: "Bearer " + token },
      });
      alert(`Map created! ID: ${response.data.id}`);
      setShowMapDialog(false);
    } catch (error) {
      console.error("Error creating map:", error);
      alert("Failed to create map.");
    }
  };

  return (
    <div>
      {/* Open Dialog Buttons */}
      <button className="open-btn" onClick={openDialog}>
        Create Element
      </button>
      <button className="open-btn" onClick={() => setShowMapDialog(true)}>
        Create Map
      </button>

      {/* Create Element Dialog */}
      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <span className="close-btn" onClick={closeDialog}>&times;</span>
            <h2>Create Element</h2>

            <form onSubmit={handleElementSubmit}>
              <label>Upload Image:</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "element")} />

              {imageUrl && <img src={imageUrl} alt="Preview" className="preview-img" />}

              <label>Image URL:</label>
              <input type="text" value={imageUrl} readOnly />

              <label>Width (px):</label>
              <input type="number" value={width} readOnly />

              <label>Height (px):</label>
              <input type="number" value={height} readOnly />

              <button type="submit" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Create Element"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Map Dialog */}
      {showMapDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <span className="close-btn" onClick={() => setShowMapDialog(false)}>&times;</span>
            <h2>Create Map</h2>

            <form onSubmit={handleMapSubmit}>
              <label>Map Name:</label>
              <input
                type="text"
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                required
              />

              <label>Upload Thumbnail:</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "map")} />

              {thumbnail && <img src={thumbnail} alt="Thumbnail" className="preview-img" />}

              <label>Dimensions (Auto-filled):</label>
              <input type="text" value={dimensions} readOnly required />

              <button type="submit" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Create Map"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMaps;
