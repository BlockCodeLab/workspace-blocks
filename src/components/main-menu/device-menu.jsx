import { useState } from 'preact/hooks';
import { useLocale, useLayout, useEditor } from '@blockcode/core';
import { Text, Spinner, MenuSection, MenuItem } from '@blockcode/ui';
import { connectDevice, disconnectDevice, downloadDevice, showDownloadScreen } from '@blockcode/device-pyboard';
import defaultDeviceFilters from '../../lib/device-filters.yaml';

export default function DeviceMenu({ itemClassName, deviceName, deviceFilters, downloadScreen, onDownload, children }) {
  const [downloadDisabled, setDownloadDisabled] = useState(false);
  const { maybeLocaleText } = useLocale();
  const { createAlert, removeAlert } = useLayout();
  const { fileList, assetList, device, setDevice } = useEditor();

  const enableDownload = () => setDownloadDisabled(false);
  const disableDownload = () => setDownloadDisabled(true);

  const downloadingAlert = (progress) => {
    if (!downloadingAlert.id) {
      downloadingAlert.id = `download.${Date.now()}`;
      disableDownload();
    }
    if (progress < 100) {
      createAlert({
        id: downloadingAlert.id,
        icon: <Spinner level="success" />,
        message: (
          <Text
            id="blocks.alert.downloading"
            defaultMessage="Downloading...{progress}%"
            progress={progress}
          />
        ),
      });
    } else {
      createAlert({
        id: downloadingAlert.id,
        icon: null,
        message: (
          <Text
            id="blocks.alert.downloadCompleted"
            defaultMessage="Download completed."
          />
        ),
      });
      setTimeout(() => {
        removeAlert(downloadingAlert.id);
        enableDownload();
        delete downloadingAlert.id;
      }, 1000);
    }
  };

  return (
    <>
      <MenuSection>
        <MenuItem
          className={itemClassName}
          label={
            device ? (
              <Text
                id="blocks.menu.device.disconnect"
                defaultMessage="Disconnect this {name}"
                name={maybeLocaleText(
                  deviceName || (
                    <Text
                      id="blocks.menu.device.name"
                      defaultMessage="device"
                    />
                  ),
                )}
              />
            ) : (
              <Text
                id="blocks.menu.device.connect"
                defaultMessage="Connect your {name}"
                name={maybeLocaleText(
                  deviceName || (
                    <Text
                      id="blocks.menu.device.name"
                      defaultMessage="device"
                    />
                  ),
                )}
              />
            )
          }
          onClick={async () => {
            if (device) {
              await disconnectDevice(device, setDevice);
              if (downloadingAlert.id) {
                removeAlert(downloadingAlert.id);
                delete downloadingAlert.id;
              }
            } else {
              try {
                await connectDevice(deviceFilters || defaultDeviceFilters, setDevice);
              } catch (err) {}
            }
          }}
        />

        <MenuItem
          disabled={downloadDisabled}
          className={itemClassName}
          label={
            <Text
              id="blocks.menu.device.download"
              defaultMessage="Download program"
            />
          }
          onClick={async () => {
            if (downloadingAlert.id) return;
            try {
              const currentDevice = device || (await connectDevice(deviceFilters || defaultDeviceFilters, setDevice));
              if (downloadScreen) {
                await showDownloadScreen(currentDevice, downloadScreen);
              }
              downloadDevice(
                currentDevice,
                onDownload ? await onDownload(fileList, assetList) : [].concat((fileList, assetList)),
                downloadingAlert,
              );
            } catch (err) {}
          }}
        />
      </MenuSection>

      {children}
    </>
  );
}
