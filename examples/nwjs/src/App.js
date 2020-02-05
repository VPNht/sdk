import React, { useState, useEffect } from "react";
import * as VPNht from "@vpnht/sdk";
import logo from "./logo.svg";
import "./App.css";

export default () => {
  const [isInstalled, setInstalled] = useState(false);
  const [isConnected, setConnected] = useState(false);
  const [isInstalling, setInstalling] = useState(false);
  const [remainingTime, setRemainingTime] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const subscribeEvents = () => {
    if (subscribed) {
      return;
    }
    try {
      const vpnStatus = VPNht.status();

      vpnStatus.on("connected", () => {
        setConnected(true);
      });

      vpnStatus.on("disconnected", () => {
        setConnected(false);
      });

      vpnStatus.on("error", error => {
        console.log("ERROR", error);
      });

      setSubscribed(true);
      console.log("subscribed to events");
    } catch (error) {
      console.log(error);
      setSubscribed(false);
    }
  };

  const updateVpnStatus = async () => {
    const appInstalled = VPNht.isInstalled();
    if (appInstalled) {
      setConnected(await VPNht.isConnected());
      subscribeEvents();
    }
    setInstalled(appInstalled);
  };

  // update status on load
  useEffect(() => {
    updateVpnStatus();
  }, []);

  const showRemainingTime = () => {
    if (!remainingTime) {
      return "N/A";
    }

    if (remainingTime > 2) {
      return remainingTime;
    } else {
      return "Launching...";
    }
  };

  const vpnLauncher = async () => {
    if (!isInstalled) {
      // eslint-disable-next-line
      const selectedOption = confirm(
        "Your connection is NOT secured.\n\nDo you want to install VPN.ht now?\n"
      );

      if (!selectedOption) {
        return;
      }

      setInstalling(true);
      const installer = await VPNht.install();

      installer.on("download", data => {
        if (data && data.time && data.time.remaining) {
          setRemainingTime(data.time.remaining);
        }
      });

      installer.on("installed", () => {
        setInstalling(false);
        setRemainingTime(false);
        updateVpnStatus();

        // open
        VPNht.open();
      });

      installer.on("error", data => {
        setInstalling(false);
        console.log(data);
      });
    } else {
      subscribeEvents();
      VPNht.open();
    }
  };

  let icon = "🔓";
  if (isConnected) {
    icon = "🔒";
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {isInstalling ? (
          <p style={{ textAlign: "left" }}>
            Remaining time: {showRemainingTime()}
          </p>
        ) : (
          <p style={{ textAlign: "left" }}>
            Status: {isConnected ? "Connected" : "Disconnected"}
            <br />
            Service: {isInstalled ? "Ready" : "Not installed"}
          </p>
        )}
        <a
          className="App-link"
          onClick={vpnLauncher}
          target="_blank"
          rel="noopener noreferrer"
        >
          {icon}
        </a>
      </header>
    </div>
  );
};
