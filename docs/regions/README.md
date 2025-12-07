# 行政区划数据使用说明

本项目的前端需要一个「省 / 市 / 区县 / 乡镇街道」四级联动选择器，数据不内置在仓库里。请按下列方式准备数据：

1. 数据源：可以使用开源的全国行政区划数据（如 GitHub 上的 “Administrative-divisions-of-China” 或其它同类项目），确保许可证允许在项目中使用。
2. 切片存放路径：将数据放在 `public/regions/` 目录（静态资源），并按「省份一文件」的方式切片：
   - 省级列表：`public/regions/provinces.json`
   - 省份详情：`public/regions/<provinceCode>.json`，例如 `public/regions/610000.json`（陕西省），`public/regions/110000.json`（北京市）。
3. 数据格式约定：
   - `provinces.json`：数组，每项至少包含 `code`（省级代码，如 `610000`）和 `name`（省名，如 `陕西省`）。示例：
     ```json
     [
       { "code": "610000", "name": "陕西省" },
       { "code": "110000", "name": "北京市" }
     ]
     ```
   - 每个省份文件：树形数组，节点至少包含 `code`, `name`, `children`，可直接转换为 Ant Design Cascader 所需结构。示例（截取）：
     ```json
     [
       {
         "code": "610100",
         "name": "西安市",
         "children": [
           {
             "code": "610113",
             "name": "雁塔区",
             "children": [
               { "code": "610113001", "name": "小寨路街道" },
               { "code": "610113002", "name": "等驾坡街道" }
             ]
           }
         ]
       }
     ]
     ```
4. 文件大小与性能：`provinces.json` 体积较小，可直接首屏加载；省份详情按需懒加载，由前端在用户展开某省时请求对应的 `<provinceCode>.json`。
5. 注意事项：
   - 不要将完整的全国大文件直接放进 bundle；务必按省拆分后放置于 `public/regions/`。
   - 如果数据源字段名不同（如 `label`/`value`），前端会做兼容性转换，但请保证至少有 `name` 或 `label`，以及对应的 `code`。

完成上述准备后即可在本地和生产环境下正常使用 Region 级联选择器。***
