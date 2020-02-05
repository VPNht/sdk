// @flow
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as VPNht from '@vpnht/sdk';
import { remote } from 'electron';
import styles from './Home.css';
import routes from '../constants/routes.json';

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

      vpnStatus.on('connected', () => {
        setConnected(true);
      });

      vpnStatus.on('disconnected', () => {
        setConnected(false);
      });

      vpnStatus.on('error', error => {
        console.log('ERROR', error);
      });

      setSubscribed(true);
      console.log('subscribed to events');
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
      return 'N/A';
    }

    if (remainingTime > 2) {
      return remainingTime;
    } else {
      return 'Launching...';
    }
  };

  const vpnLauncher = async () => {
    if (!isInstalled) {
      const selectedOption = remote.dialog.showMessageBoxSync({
        type: 'question',
        title: 'Connection not secure',
        message:
          'Your connection is NOT secured.\n\nDo you want to install VPN.ht now?\n',
        buttons: ['Yes', 'No, stay unsecure'],
        defaultId: 0,
        cancelId: 1
      });

      if (selectedOption === 1) {
        return;
      }

      setInstalling(true);
      const installer = await VPNht.install();

      installer.on('download', data => {
        if (data && data.time && data.time.remaining) {
          setRemainingTime(data.time.remaining);
        }
      });

      installer.on('installed', () => {
        setInstalling(false);
        setRemainingTime(false);
        updateVpnStatus();

        // open
        VPNht.open();
      });

      installer.on('error', data => {
        setInstalling(false);
        console.log(data);
      });
    } else {
      subscribeEvents();
      VPNht.open();
    }
  };

  let icon = '🔓';
  if (isConnected) {
    icon = '🔒';
  }

  return (
    <div className={styles.container} data-tid="container">
      <h2>VPN</h2>
      {isInstalling ? (
        <p style={{ textAlign: 'left' }}>
          Remaining time: {showRemainingTime()}
        </p>
      ) : (
        <p style={{ textAlign: 'left' }}>
          Status: {isConnected ? 'Connected' : 'Disconnected'}
          <br />
          Service: {isInstalled ? 'Ready' : 'Not installed'}
        </p>
      )}

      <Link to={routes.HOME}>← home</Link>
      <button
        style={{ marginTop: '50px' }}
        className={styles.btn}
        onClick={vpnLauncher}
        data-tclass="btn"
        type="button"
      >
        {icon}
      </button>
    </div>
  );
};
