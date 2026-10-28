import json

with open("scripts/excel_audit_raw.json", "r", encoding="utf-8") as f:
    data = json.load(f)

targets = [
    "DLVS/TABLEAU DE BORD COURRIERS DLVS_15.09.2026.xlsx",
    "SL/Activités du SL.xlsx",
    "SL/BASE DE RECEPTION E SERVICE AUTRES DE PRODUITS DE SANTE 26.11.2025.xlsx",
    "SL/Base de réception.xlsx"
]

for k, v in data.items():
    if any(t.replace('/', '\\') in k or t.replace('\\', '/') in k for t in targets) or "COURRIERS" in k or "Activit" in k or "RECEPTION" in k:
        print("=" * 70)
        print(f"FILE: {v['filename']} ({v['size_kb']} KB)")
        for sh in v["sheets"]:
            print(f"  * Sheet: '{sh['name']}' (~{sh['max_row']} rows x ~{sh['max_col']} cols)")
            for idx, r in enumerate(sh["preview"]):
                ne = [c.replace('\n', ' ').strip() for c in r if c and c.strip()]
                if len(ne) >= 3:
                    print(f"    Header (line {idx+1}): {ne[:15]}")
                    if idx + 1 < len(sh["preview"]):
                        sample = [c.replace('\n', ' ').strip() for c in sh["preview"][idx+1] if c and c.strip()]
                        print(f"    Sample: {sample[:8]}")
                    break
