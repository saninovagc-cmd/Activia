import json
import os

with open(r"c:\Users\LENOVO X13\Desktop\ITA\Activia\scripts\excel_audit_raw.json", "r", encoding="utf-8") as f:
    data = json.load(f)

services = ["DLVS", "SL", "SSMUR", "SVPS"]

for s_target in services:
    print(f"\n################################################################################")
    print(f"SERVICE: {s_target}")
    print(f"################################################################################\n")
    for file_key, info in data.items():
        if info["service"] != s_target:
            continue
        print(f"FILE: {info['filename']} ({info['size_kb']} KB)")
        print(f"Sheets ({len(info['sheets'])}):")
        for sheet in info["sheets"]:
            print(f"  * Sheet: '{sheet['name']}' (~{sheet['max_row']} rows x ~{sheet['max_col']} cols)")
            for idx, r in enumerate(sheet['preview']):
                ne = [c.replace('\n', ' ').strip() for c in r if c and c.strip()]
                if len(ne) >= 3:
                    print(f"    Line {idx+1}: {ne[:10]}")
                    if idx + 1 < len(sheet['preview']):
                        ne_next = [c.replace('\n', ' ').strip() for c in sheet['preview'][idx+1] if c and c.strip()]
                        print(f"    Sample: {ne_next[:6]}")
                    break
        print("-" * 60)
