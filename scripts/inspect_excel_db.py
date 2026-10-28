import os
import glob
import openpyxl
import json

base_dir = r"c:\Users\LENOVO X13\Desktop\ITA\Activia\Base de données"

results = {}

for root, dirs, files in os.walk(base_dir):
    service = os.path.basename(root)
    if service == "Base de données":
        continue
    for file in files:
        if not file.endswith('.xlsx'):
            continue
        file_path = os.path.join(root, file)
        rel_path = os.path.relpath(file_path, base_dir)
        print(f"Inspecting: {rel_path}...")
        
        file_info = {
            "service": service,
            "filename": file,
            "size_kb": round(os.path.getsize(file_path) / 1024, 1),
            "sheets": []
        }
        
        try:
            # Load with read_only=True and data_only=True for speed and memory efficiency
            wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
            for sheet_name in wb.sheetnames:
                sheet = wb[sheet_name]
                rows_iter = sheet.iter_rows(values_only=True)
                
                # Grab first 15 rows to find header and sample data
                sample_rows = []
                for i in range(15):
                    try:
                        row = next(rows_iter)
                        # convert values to string, handling dates and numbers
                        sample_rows.append([str(v) if v is not None else "" for v in row])
                    except StopIteration:
                        break
                
                # count approx rows
                # In read_only mode sheet.max_row may be None or approximate
                max_row = sheet.max_row
                max_col = sheet.max_column
                
                file_info["sheets"].append({
                    "name": sheet_name,
                    "max_row": max_row,
                    "max_col": max_col,
                    "preview": sample_rows[:8]
                })
            wb.close()
        except Exception as e:
            file_info["error"] = str(e)
            print(f"Error inspecting {file}: {e}")
            
        results[rel_path] = file_info

output_json = os.path.join(r"c:\Users\LENOVO X13\Desktop\ITA\Activia\scripts", "excel_audit_raw.json")
os.makedirs(os.path.dirname(output_json), exist_ok=True)
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\nAudit complete! Raw results written to {output_json}")
