import React from 'react';
import { Cascader, CascaderProps, message } from 'antd';
import { loadProvinceList, loadRegionSlice, RegionOption } from '@/utils/regionLoader';

type RegionCascaderProps = Omit<CascaderProps<string[]>, 'options' | 'loadData'>;

export const RegionCascader: React.FC<RegionCascaderProps> = (props) => {
  const [options, setOptions] = React.useState<RegionOption[]>([]);

  // 初始化省级列表
  React.useEffect(() => {
    loadProvinceList()
      .then(setOptions)
      .catch((err) => {
        console.error('[RegionCascader] load provinces failed', err);
        message.error('省份列表加载失败，请稍后重试');
      });
  }, []);

  const handleLoadData: CascaderProps<string[]>['loadData'] = async (selectedOptions) => {
    const targetOption = selectedOptions[selectedOptions.length - 1] as RegionOption | undefined;
    if (!targetOption?.code) return;

    try {
      const children = await loadRegionSlice(targetOption.code);
      setOptions((prev) =>
        prev.map((opt) =>
          opt.code === targetOption.code ? { ...opt, children, isLeaf: false } : opt,
        ),
      );
    } catch (err) {
      console.error('[RegionCascader] load slice failed', err);
      message.error('行政区数据加载失败，请稍后重试');
    }
  };

  return (
    <Cascader
      options={options}
      loadData={handleLoadData}
      changeOnSelect
      showSearch
      placeholder="请选择省/市/区县/街道"
      allowClear
      {...props}
    />
  );
};

export default RegionCascader;

