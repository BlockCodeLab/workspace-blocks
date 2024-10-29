import { useLayout, useEditor } from '@blockcode/core';
import { Text, Spinner, MenuSection, MenuItem } from '@blockcode/ui';
import { connectDevice, checkDevice, checkFlashFree, writeFiles, configDevice } from '@blockcode/device-pyboard';
import defaultDeviceFilters from '../../lib/device-filters.yaml';

let downloadAlertId = null;

export default function DeviceMenu({ itemClassName, deviceName, deviceFilters, onBeforeDownload, children }) {
  const { createAlert, removeAlert, createPrompt } = useLayout();
  const { key, name, fileList, assetList } = useEditor();

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
      setTimeout(removeDownloading, 2000);
    }
  };

  const removeDownloading = () => {
    removeAlert(downloadAlertId);
    downloadAlertId = null;
  };

  const errorAlert = (err) => {
    if (err === 'NotFoundError') return;
    createAlert(
      {
        message:
          err === 'NotFoundError' ? (
            <Text
              id="blocks.alert.connectionCancel"
              defaultMessage="Connection cancel."
            />
          ) : (
            <Text
              id="blocks.alert.connectionError"
              defaultMessage="Connection error."
            />
          ),
      },
      1000,
    );
  };

  return (
    <>
      <MenuSection>
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

            let currentDevice;
            try {
              currentDevice = await connectDevice(deviceFilters || defaultDeviceFilters);
            } catch (err) {
              errorAlert(err.name);
            }
            if (!currentDevice) return;

            const checker = checkDevice(currentDevice).catch(() => {
              errorAlert();
              removeDownloading();
            });

            let files = onBeforeDownload ? onBeforeDownload(name, fileList, assetList) : [].concat(fileList, assetList);
            files = files.map((file) => ({
              ...file,
              id: file.id.startsWith('extensions/') ? file.id : `proj${key}/${file.id}`,
            }));
            downloadingAlert(0);

            try {
              if (await checkFlashFree(currentDevice, files)) {
                await writeFiles(currentDevice, files, downloadingAlert);
                await configDevice(currentDevice, {
                  'latest-project': key,
                });
                currentDevice.hardReset();
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
            } catch (err) {
              errorAlert(err.name);
              removeDownloading();
            } finally {
              checker.cancel();
            }
          }}
        />
      </MenuSection>

      {children}
    </>
  );
}
