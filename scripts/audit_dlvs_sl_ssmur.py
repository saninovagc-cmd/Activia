import json

with open("scripts/excel_audit_raw.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for s in ["DLVS", "SL", "SSMUR"]:
    print(f"\n=======================================================")
    print(f"SERVICE: {s}")
    print(f"=======================================================")
    for k, v in data.items():
        if v["service"] == s:
            print(f"\nFILE: {v['filename']} ({v['size_kb']} KB)")
            for sh in v["sheets"]:
                print(f"  * Sheet: '{sh['name']}' (~{sh['max_row']} rows x ~{sh['max_col']} cols)")
                for idx, r in enumerate(sh["preview"]):
                    ne = [c.replace('\n', ' ').strip() for c in r if c and c.strip()]
                    if len(ne) >= 3:
                        print(f"    Header (line {idx+1}): {ne[:12]}")
                        if idx + 1 < len(sh["preview"]):
                            sample = [c.replace('\n', ' ').strip() for c in sh["preview"][idx+1] if c and c.strip()]
                            print(f"    Sample: {sample[:8]}")
                        break
