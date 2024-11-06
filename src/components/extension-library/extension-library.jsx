import { useEffect, useState } from 'preact/hooks';
import { useLocale } from '@blockcode/core';
import { Library } from '@blockcode/ui';
import allExtensions from './extensions';

const loadingExtensions = Promise.all(allExtensions);

export default function ExtensionLibrary({ deviceId, onSelect, onClose, onFilter }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { language, getText } = useLocale();

  const handleFilter = (extensionInfo) => {
    const tags = extensionInfo.tags || [];
    let filter = ['blocks'];
    if (onFilter) {
      filter = onFilter(tags);
    }
    if (Array.isArray(filter)) {
      return filter.some((subfilter) => {
        if (Array.isArray(subfilter)) {
          return subfilter.every((item) => (item[0] === '!' ? !tags.includes(item.slice(1)) : tags.includes(item)));
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
              hidden: extensionInfo.hidden || (window.electron && (extensionInfo.preview || extensionInfo.disabled)),
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
