# Server Fix Notes

- Resolved admin product create/update 500 errors by mapping `category_id`/`brand_id` to real relations, validating existence, and managing product images with cascade deletion.
- Content cases query now avoids the SQL reserved word alias and matches admin payloads (customer name/industry/detail).
- Admin CMS (cases/solutions/news) forms updated to send the fields that backend entities expect and to read paginated totals correctly, eliminating save failures.
- Solutions admin form now controls channel type/enabled/sort order and splits pain points/solutions into arrays for the JSON columns.
- Lead module: fixed list query joins and camel/snake param mismatch, corrected DTO string-array validation, and ensured region data loader works with custom base paths.
