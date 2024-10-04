import { useEffect, useState } from 'preact/hooks';
import { useLocale, useLayout, useEditor } from '@blockcode/core';
import { Library } from '@blockcode/ui';
import allExtensions from './extensions';

const loadingExtensions = Promise.all(allExtensions);

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
    loadingExtensions.then((extensions) => {
      setData(
        extensions.filter(handleFilter).map((extensionInfo) =>
          Object.assign(
            {
              ...extensionInfo,
              featured: true,
              disabled: extensionInfo.disabled || (!DEVELOPMENT && extensionInfo.preview),
              onSelect: () => {
                onSelect(extensionInfo.id);
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
