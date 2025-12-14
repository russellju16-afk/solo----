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
  loading?: boolean;
}

const provinceCache: { options: RegionOption[] | null } = { options: null };
const sliceCache: Record<string, RegionOption[]> = {};
const allTreeCache: { options: RegionOption[] | null } = { options: null };

const withBase = (path: string) => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${base}/${cleanPath}`;
};

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

async function loadAllTree(): Promise<RegionOption[]> {
  if (allTreeCache.options) return allTreeCache.options;
  const resp = await fetch(withBase('/regions/pcas.json'));
  if (!resp.ok) {
    throw new Error(`加载完整行政区数据失败: ${resp.status}`);
  }
  const data: RegionNode[] = await resp.json();
  const normalized = normalizeNodes(data).map((item) => ({ ...item, isLeaf: false }));
  allTreeCache.options = normalized;
  return normalized;
}

const normalizeProvinceCode = (code?: string) => {
  if (!code) return code;
  const trimmed = code.replace(/0+$/, '');
  return trimmed || code;
};

const normalizeLabel = (label?: string) => label?.trim();

const findNodeByCodeOrLabel = (nodes: RegionOption[], code?: string, label?: string): RegionOption | undefined => {
  const normalizedCode = normalizeProvinceCode(code);
  const normalizedLabel = normalizeLabel(label);
  for (const node of nodes) {
    if (
      node.code === normalizedCode ||
      node.code === code ||
      node.value === normalizedCode ||
      node.value === code ||
      node.label === normalizedLabel
    ) {
      return node;
    }
    if (node.children) {
      const found = findNodeByCodeOrLabel(node.children, code, label);
      if (found) return found;
    }
  }
  return undefined;
};

export async function loadProvinceList(): Promise<RegionOption[]> {
  if (provinceCache.options) return provinceCache.options;

  // 直接使用完整行政区树，避免单省文件缺失导致报错
  const allTree = await loadAllTree();
  const provinces = allTree.map((item) => ({
    label: item.label,
    value: item.value,
    code: item.code,
    isLeaf: false,
  }));
  provinceCache.options = provinces;
  return provinces;
}

export async function loadRegionSlice(provinceCode: string): Promise<RegionOption[]> {
  if (sliceCache[provinceCode]) return sliceCache[provinceCode];

  // 统一从完整行政区树读取，避免 404
  const allTree = await loadAllTree();
  const target = findNodeByCodeOrLabel(allTree, provinceCode, provinceCode);
  if (!target || !target.children) {
    throw new Error(`未找到省份数据: ${provinceCode}`);
  }
  const normalized = target.children;
  sliceCache[provinceCode] = normalized;
  return normalized;
}
