import React, { useState } from 'react';
import './css/bluetooth.css'; // Use renamed, scoped CSS file

const BluetoothAttendance = () => {
  const [connected, setConnected] = useState(false);

  const connectToBluetoothDevice = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
      });
      console.log("Connected to device:", device.name);
      setConnected(true);
    } catch (error) {
      alert("Bluetooth connection failed or cancelled.");
      console.error(error);
    }
  };

  const handleSelfieAndMarkAttendance = () => {
    alert('Proceeding to take selfie and mark attendance');
  };

  return (
    <div className="bluetooth-container">
      <h2 className="bluetooth-title">📡 Bluetooth Attendance</h2>

      {!connected ? (
        <button
          onClick={connectToBluetoothDevice}
          className="bluetooth-button"
        >
          🔗 Connect to Nearby Bluetooth Device
        </button>
      ) : (
        <>
          <p className="bluetooth-status">✅ Connected to Bluetooth Device Successfully</p>
          <button
            onClick={handleSelfieAndMarkAttendance}
            className="bluetooth-button"
          >
            🤳 Take Selfie & Mark Attendance
          </button>
        </>
      )}
    </div>
  );
};

export default BluetoothAttendance;
