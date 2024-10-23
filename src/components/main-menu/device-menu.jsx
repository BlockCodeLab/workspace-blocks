import { useLocale, useLayout, useEditor } from '@blockcode/core';
import { Text, Spinner, MenuSection, MenuItem } from '@blockcode/ui';
import {
  connectDevice,
  disconnectDevice,
  checkFlash,
  writeFiles,
  configDevice,
  showDownloadScreen,
} from '@blockcode/device-pyboard';
import defaultDeviceFilters from '../../lib/device-filters.yaml';

let downloadAlertId = null;

export default function DeviceMenu({ itemClassName, deviceName, deviceFilters, downloadScreen, onDownload, children }) {
  const { maybeLocaleText } = useLocale();
  const { createAlert, removeAlert, createPrompt } = useLayout();
  const { key, name, fileList, assetList, device, setDevice } = useEditor();

  const downloadingAlert = (progress) => {
    if (!downloadAlertId) {
      downloadAlertId = `download.${Date.now()}`;
    }
    if (progress < 100) {
      createAlert({
        id: downloadAlertId,
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
        id: downloadAlertId,
        icon: null,
        message: (
          <Text
            id="blocks.alert.downloadCompleted"
            defaultMessage="Download completed."
          />
        ),
      });
      setTimeout(removeDownloading, 1000);
    }
  };

  const removeDownloading = () => {
    removeAlert(downloadAlertId);
    downloadAlertId = null;
  };

  const errorAlert = () => {
    createAlert(
      {
        message: (
          <Text
            id="blocks.alert.connectionError"
            defaultMessage="Connection error."
          />
        ),
      },
      1000,
    );
  };

  if (downloadAlertId && !device) {
    errorAlert();
    removeDownloading();
  }

  return (
    <>
      <MenuSection>
        {/* <MenuItem
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
              if (downloadAlertId) {
                removeAlert(downloadAlertId);
                delete downloadAlertId;
              }
            } else {
              try {
                await connectDevice(deviceFilters || defaultDeviceFilters, setDevice);
              } catch (err) {}
            }
          }}
        /> */}

        <MenuItem
          disabled={downloadAlertId}
          className={itemClassName}
          label={
            <Text
              id="blocks.menu.device.download"
              defaultMessage="Download program"
            />
          }
          onClick={async () => {
            if (downloadAlertId) return;
            try {
              const currentDevice = device || (await connectDevice(deviceFilters || defaultDeviceFilters, setDevice));
              if (downloadScreen) {
                await showDownloadScreen(currentDevice, downloadScreen);
              }
              let files = onDownload ? onDownload(name, fileList, assetList) : [].concat((fileList, assetList));
              files = files.map((file) => ({
                ...file,
                id: file.id.startsWith('extensions/') ? file.id : `proj${key}/${file.id}`,
              }));
              downloadingAlert(0);
              if (await checkFlash(currentDevice, files)) {
                await writeFiles(currentDevice, files, downloadingAlert);
                await configDevice(currentDevice, {
                  'latest-project': key,
                });
              } else {
                createPrompt({
                  title: deviceName || (
                    <Text
                      id="blocks.menu.device.name"
                      defaultMessage="device"
                    />
                  ),
                  label: (
                    <Text
                      id="blocks.alert.flashOutSpace"
                      defaultMessage="The flash is running out of space."
                    />
                  ),
                });
                removeDownloading();
              }
              currentDevice.hardReset();
            } catch (err) {
              console.log(err);
              errorAlert();
              removeDownloading();
            }
          }}
        />
      </MenuSection>

      {children}
    </>
  );
}
