import React from 'react'
import { Cascader, type CascaderProps, message, Typography } from 'antd'
import type { CascaderRef } from 'antd/es/cascader'
import { loadProvinceList, loadRegionSlice, type RegionOption } from '@/utils/regionLoader'

type RegionCascaderProps = Omit<CascaderProps<RegionOption, 'value', false>, 'options' | 'loadData'>

function updateOptionsTree(
  options: RegionOption[],
  targetCode: string,
  patch: Partial<RegionOption>,
): RegionOption[] {
  let changed = false

  const next = options.map((option) => {
    if (option.code === targetCode) {
      changed = true
      return { ...option, ...patch }
    }

    if (Array.isArray(option.children) && option.children.length > 0) {
      const nextChildren = updateOptionsTree(option.children, targetCode, patch)
      if (nextChildren !== option.children) {
        changed = true
        return { ...option, children: nextChildren }
      }
    }

    return option
  })

  return changed ? next : options
}

export const RegionCascader = React.forwardRef<CascaderRef, RegionCascaderProps>((props, ref) => {
  const [options, setOptions] = React.useState<RegionOption[]>([])
  const [devDepth, setDevDepth] = React.useState<number | null>(null)
  const didReportDevRef = React.useRef(false)

  // 初始化省级列表
  React.useEffect(() => {
    loadProvinceList()
      .then(setOptions)
      .catch((err) => {
        console.error('[RegionCascader] load provinces failed', err)
        message.error('省份列表加载失败，请稍后重试')
      })
  }, [])

  const handleLoadData: CascaderProps<RegionOption, 'value', false>['loadData'] = async (selectedOptions) => {
    const targetOption = selectedOptions[selectedOptions.length - 1]
    const targetCode = targetOption?.code
    if (!targetCode) return

    setOptions((prev) => updateOptionsTree(prev, targetCode, { loading: true }))

    try {
      const children = await loadRegionSlice(targetCode)
      setOptions((prev) =>
        updateOptionsTree(prev, targetCode, {
          loading: false,
          children,
          isLeaf: children.length === 0,
        }),
      )
    } catch (err) {
      setOptions((prev) => updateOptionsTree(prev, targetCode, { loading: false }))
      console.error('[RegionCascader] load slice failed', err)
      message.error('行政区数据加载失败，请稍后重试')
    }
  }

  const handleChange: CascaderProps<RegionOption, 'value', false>['onChange'] = (value, selected) => {
    props.onChange?.(value, selected)

    if (import.meta.env.DEV && !didReportDevRef.current) {
      didReportDevRef.current = true
      setDevDepth(Array.isArray(selected) ? selected.length : 0)
    }
  }

  return (
    <div>
      <Cascader<RegionOption, 'value'>
        ref={ref}
        options={options}
        loadData={handleLoadData}
        changeOnSelect
        showSearch
        placeholder="请选择省/市/区县/街道"
        allowClear
        {...props}
        onChange={handleChange}
      />
      {import.meta.env.DEV && typeof devDepth === 'number' ? (
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
          RegionCascader（dev self-check）：已选层级 {devDepth}（期望可达 4：省/市/区县/街道）
        </Typography.Text>
      ) : null}
    </div>
  )
})

RegionCascader.displayName = 'RegionCascader'

export default RegionCascader
