import json

with open("scripts/excel_audit_raw.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for k, v in data.items():
    if "TABLEAU DE BORD COURRIERS" in k:
        print(f"=== {k} ===")
        for sh in v["sheets"]:
            print(f"\nSheet: '{sh['name']}' (~{sh['max_row']} rows x ~{sh['max_col']} cols)")
            for idx, r in enumerate(sh["preview"][:10]):
                ne = [c.replace('\n', ' ').strip() for c in r if c and c.strip()]
                if len(ne) >= 3:
                    print(f"  Header line {idx+1}: {ne[:15]}")
                    if idx + 1 < len(sh["preview"]):
                        smp = [c.replace('\n', ' ').strip() for c in sh["preview"][idx+1] if c and c.strip()]
                        print(f"  Sample: {smp[:8]}")
                    break
