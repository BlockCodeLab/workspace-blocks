import { useEffect, useState } from 'preact/hooks';
import { useLocale, useLayout, useEditor } from '@blockcode/core';
import { Library } from '@blockcode/ui';
import extensions from './extensions';

const loadingExtensions = Promise.all(extensions);

export default function ExtensionLibrary({ deviceId, onSelect, onClose, onFilter }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { language, getText } = useLocale();
  const { createAlert, removeAlert } = useLayout();
  const { addAsset } = useEditor();

  const handleFilter = (extensionInfo) => {
    const tags = extensionInfo.tags || [];
    let filter = ['blocks', ['dupont', 'data'], ['3v3', '5v']];
    if (onFilter) {
      filter = onFilter(tags);
    }
    if (Array.isArray(filter)) {
      return filter.every((subfilter) => {
        if (Array.isArray(subfilter)) {
          return subfilter.some((item) => tags.includes(item));
        }
        return tags.includes(subfilter);
      });
    }
    return filter;
  };

  useEffect(() => {
    loadingExtensions.then((allExtensions) => {
      setData(
        allExtensions.filter(handleFilter).map((extensionInfo) =>
          Object.assign(
            {
              ...extensionInfo,
              featured: true,
              disabled: extensionInfo.disabled || (!DEVELOPMENT && extensionInfo.preview),
              onSelect: async () => {
                createAlert('importing', { id: extensionInfo.id });
                let { default: extensionObject } = await import(`@blockcode/extension-${extensionInfo.id}/blocks`);
                if (typeof extensionObject === 'function') {
                  extensionObject = extensionObject(deviceId);
                }
                extensionObject.id = extensionInfo.id;
                if (extensionObject.files) {
                  for (const file of extensionObject.files) {
                    const id = `extensions/${extensionInfo.id.replace(/[^a-z\d]/gi, '_')}/${file.name}`;
                    const content = await fetch(file.uri).then((res) => res.text());
                    addAsset({
                      ...file,
                      id,
                      content,
                    });
                  }
                }
                onSelect(extensionObject);
                removeAlert(extensionInfo.id);
                onClose();
              },
            },
            // translations
            extensionInfo.translations && extensionInfo.translations[language]
              ? {
                  name: extensionInfo.translations[language].name || extensionInfo.name,
                  description: extensionInfo.translations[language].description || extensionInfo.description,
                  collaborator: extensionInfo.translations[language].collaborator || extensionInfo.collaborator,
                }
              : {},
          ),
        ),
      );
      setLoading(false);
    });
  }, []);

  return (
    <Library
      filterable
      loading={loading}
      items={data}
      filterPlaceholder={getText('gui.library.search', 'Search')}
      title={getText('blocks.extensions.addExtension', 'Add Extension')}
      emptyText={getText('blocks.extensions.empty', 'No extension!')}
      onClose={onClose}
    />
  );
}
