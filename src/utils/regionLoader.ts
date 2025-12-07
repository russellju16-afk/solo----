/**
 * 懒加载行政区划数据：
 * - provinces.json：省级列表（体积小，首屏加载）
 * - <provinceCode>.json：单省份的市/区县/乡镇街道树，按需加载并缓存
 */

export interface RegionNode {
  code: string;
  name: string;
  children?: RegionNode[];
  label?: string; // 兼容已有字段
  value?: string; // 兼容已有字段
}

export interface RegionOption {
  label: string;
  value: string; // 对外暴露为名称，便于最终拼接成字符串
  code?: string; // 内部用于根据 code 取子级文件
  children?: RegionOption[];
  isLeaf?: boolean;
}

const provinceCache: { options: RegionOption[] | null } = { options: null };
const sliceCache: Record<string, RegionOption[]> = {};

const normalizeNodes = (nodes: RegionNode[] = []): RegionOption[] => {
  return nodes.map((node) => {
    const label = node.label || node.name || node.value || '';
    const code = node.code || node.value || label;
    const children = Array.isArray(node.children) ? normalizeNodes(node.children) : undefined;
    return {
      label,
      value: label, // value 用名称，方便最终拼接
      code,
      children,
      isLeaf: !children || children.length === 0,
    };
  });
};

export async function loadProvinceList(): Promise<RegionOption[]> {
  if (provinceCache.options) return provinceCache.options;
  const resp = await fetch('/regions/provinces.json');
  if (!resp.ok) {
    throw new Error(`加载省份列表失败: ${resp.status}`);
  }
  const data: RegionNode[] = await resp.json();
  const normalized = normalizeNodes(data).map((item) => ({
    ...item,
    isLeaf: false, // 省级节点必须可展开
  }));
  provinceCache.options = normalized;
  return normalized;
}

export async function loadRegionSlice(provinceCode: string): Promise<RegionOption[]> {
  if (sliceCache[provinceCode]) return sliceCache[provinceCode];
  const resp = await fetch(`/regions/${provinceCode}.json`);
  if (!resp.ok) {
    throw new Error(`加载省份数据失败: ${provinceCode}, status ${resp.status}`);
  }
  const data: RegionNode[] = await resp.json();
  const normalized = normalizeNodes(data);
  sliceCache[provinceCode] = normalized;
  return normalized;
}

