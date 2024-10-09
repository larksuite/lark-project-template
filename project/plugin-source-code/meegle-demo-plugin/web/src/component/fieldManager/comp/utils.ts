import { Option } from '../../../types/index';

export const formatTreeData = (list: Option[]) =>
  list.map(item => {
    const { children, ...argsItem } = item;
    const config: any = {
      key: item.value,
      ...argsItem,
    };
    if (children) {
      config.children = formatTreeData(children);
    } else {
      config.isLeaf = true;
    }
    return config;
  });

export const nonLeafNode = (data, selectedValue) => {
  return data.some(item => {
    if (item.value === selectedValue) {
      return item.children && item.children.length > 0;
    }
    return item.children && item.children.length > 0 && nonLeafNode(item.children, selectedValue);
  });
};

// 构建 openapi 的格式;
export const findValueWithParent = (data, selectKey) => {
  for (const item of data) {
    if (item.children) {
      // 选中的节点是否包含
      const child = item.children.find(option => option.value === selectKey);
      if (child) {
        return {
          value: item.value,
          children: {
            value: child.value,
          },
        };
      }
      if (item.children.length > 0) {
        const result = findValueWithParent(item.children, selectKey);
        if (result) {
          return {
            value: item.value,
            children: result,
          };
        }
      }
    }
  }
  return null;
};

export const findLeafValue = node => {
  if (!node?.children || Object.keys(node?.children)?.length === 0) {
    return node.value;
  }
  return findLeafValue(node?.children);
};

export const downloadOperation = (blobData: Blob, name: string) => {
  const blob = new Blob([blobData]);
  const href = window.URL.createObjectURL(blob);
  const downloadElement = document.createElement('a');
  downloadElement.style.display = 'none';
  downloadElement.href = href;
  downloadElement.download = name;
  document.body.appendChild(downloadElement);
  downloadElement.click();
  document.body.removeChild(downloadElement);
  window.URL.revokeObjectURL(href);
};
