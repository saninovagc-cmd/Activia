import json

with open(r"c:\Users\LENOVO X13\Desktop\ITA\Activia\scripts\excel_audit_raw.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Total files audited: {len(data)}\n")

for file_key, info in data.items():
    print("=" * 80)
    print(f"FILE: {file_key} | Service: {info['service']} | Size: {info['size_kb']} KB")
    print(f"Sheets count: {len(info['sheets'])}")
    for sheet in info['sheets']:
        name = sheet['name']
        max_r = sheet['max_row']
        max_c = sheet['max_col']
        preview = sheet['preview']
        print(f"\n  -- Sheet: '{name}' (rows: ~{max_r}, cols: ~{max_c})")
        # Find likely header row (first row with multiple non-empty cells)
        for r_idx, row in enumerate(preview):
            non_empty = [c.strip() for c in row if c and c.strip()]
            if len(non_empty) >= 3:
                print(f"     Likely headers (row {r_idx+1}): {non_empty[:12]} ({len(non_empty)} non-empty cols)")
                if r_idx + 1 < len(preview):
                    sample = [c.strip() for c in preview[r_idx+1] if c and c.strip()]
                    print(f"     Sample row 1: {sample[:8]}")
                break
