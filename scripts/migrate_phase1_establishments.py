import openpyxl
import re
import uuid
import json

excel_path = r"Base de données/SL/Etablissements pharmaceutiques.xlsx"
wb = openpyxl.load_workbook(excel_path, data_only=True)

establishments = []
seen_names = set()

def clean_str(val):
    if val is None:
        return ""
    s = str(val).replace('\r', ' ').replace('\n', ' ').strip()
    if s.lower() in ['#value!', '#ref!', 'none', 'null', 'nan', 'na', 'n/a']:
        return ""
    return s

def clean_phone(val):
    s = clean_str(val)
    # clean multiple slashes or newlines
    return re.sub(r'\s+', ' ', s)

def extract_date(auth_str):
    if not auth_str:
        return "2026-01-01"
    # match dates like 11/03/2016 or 18/01/2022
    m = re.search(r'(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})', auth_str)
    if m:
        day, month, year = m.group(1).zfill(2), m.group(2).zfill(2), m.group(3)
        return f"{year}-{month}-{day}"
    # match year like 2022
    m_yr = re.search(r'(20\d{2}|19\d{2})', auth_str)
    if m_yr:
        return f"{m_yr.group(1)}-01-01"
    return "2026-01-01"

# -------------------------------------------------------------------------
# 1. OFFICINES DE PHARMACIE (~400)
# -------------------------------------------------------------------------
sh_off = wb['Officines de pharmacie']
rows_off = list(sh_off.iter_rows(values_only=True))
# header is row 0
for i, r in enumerate(rows_off[1:]):
    code_raw = clean_str(r[0])
    name = clean_str(r[1])
    dept = clean_str(r[2]) or "Bénin"
    zone = clean_str(r[3])
    commune = clean_str(r[4])
    arrond = clean_str(r[5])
    address = clean_str(r[6])
    lon_raw = clean_str(r[7])
    lat_raw = clean_str(r[8])
    owner = clean_str(r[9])
    pharma_resp = clean_str(r[10]) or owner or "Pharmacien Titulaire"
    email_resp = clean_str(r[11])
    email_struct = clean_str(r[12])
    phone_resp = clean_phone(r[13])
    phone_struct = clean_phone(r[14])
    auth_ref = clean_str(r[15])
    quitus_ref = clean_str(r[16])
    suspension = clean_str(r[18]) if len(r) > 18 else ""

    if not name or len(name) < 2:
        continue

    # lat/long check for Benin: lat is ~6 to ~12 N, lon is ~1 to ~4 E
    lat = None
    lon = None
    try:
        if lon_raw and lat_raw:
            v1 = float(lon_raw.replace(',', '.'))
            v2 = float(lat_raw.replace(',', '.'))
            # In benin, latitude is 6-12, longitude is 0.5-4
            if 6.0 <= v1 <= 13.0 and 0.5 <= v2 <= 4.0:
                lat, lon = v1, v2
            elif 6.0 <= v2 <= 13.0 and 0.5 <= v1 <= 4.0:
                lat, lon = v2, v1
            else:
                lat, lon = v1, v2
    except:
        pass

    auth_num = auth_ref or quitus_ref or f"AUT-OFF-{code_raw or (i+1)}"
    auth_dt = extract_date(auth_ref or quitus_ref)

    status = "Suspendu" if suspension and len(suspension) > 2 else "Actif"

    etab_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"activia-officine-{name}-{code_raw}-{i}"))

    establishments.append({
        "id": etab_id,
        "code": f"OFF-{code_raw}" if code_raw and not code_raw.startswith("OFF") else (code_raw or f"OFF-{i+1:03d}"),
        "name": name if name.lower().startswith("pharmacie") else f"Pharmacie {name}",
        "establishment_type": "Officine de Pharmacie",
        "owner": owner or pharma_resp,
        "responsible_pharmacist": pharma_resp,
        "address": address or (f"{arrond}, {commune}" if arrond and commune else commune),
        "city": commune or arrond or dept,
        "department": dept,
        "phone": phone_struct or phone_resp or "+229",
        "email": email_struct or email_resp or "",
        "status": status,
        "authorization_number": auth_num,
        "auth_date": auth_dt,
        "commune": commune,
        "arrondissement": arrond,
        "zone_sanitaire": zone,
        "latitude": lat,
        "longitude": lon,
        "decree_ref": auth_ref,
        "documents": [],
        "created_at": "2026-01-01 08:00"
    })

print(f"Parsed {len(establishments)} officines.")

# -------------------------------------------------------------------------
# 2. GROSSISTES-RÉPARTITEURS (10)
# -------------------------------------------------------------------------
sh_gr = wb['Grossistes-répartiteurs']
rows_gr = list(sh_gr.iter_rows(values_only=True))
for i, r in enumerate(rows_gr[1:]):
    idx_raw = clean_str(r[0])
    name = clean_str(r[1])
    dg = clean_str(r[2])
    auth_ref = clean_str(r[3])
    address = clean_str(r[4])
    phone = clean_phone(r[5])
    email = clean_str(r[7])
    suspension = clean_str(r[10]) if len(r) > 10 else ""

    if not name:
        continue

    auth_dt = extract_date(auth_ref)
    etab_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"activia-grossiste-{name}-{i}"))

    establishments.append({
        "id": etab_id,
        "code": f"GROSS-{i+1:02d}",
        "name": name,
        "establishment_type": "Grossiste-Répartiteur",
        "owner": name,
        "responsible_pharmacist": dg or "Pharmacien Responsable / DG",
        "managing_director": dg,
        "address": address or "Cotonou, Bénin",
        "city": "Cotonou",
        "department": "Littoral",
        "phone": phone or "+229 21-33-00-00",
        "email": email or "",
        "status": "Suspendu" if suspension and len(suspension) > 2 else "Actif",
        "authorization_number": auth_ref or f"ARR-GROSS-{i+1}",
        "auth_date": auth_dt,
        "decree_ref": auth_ref,
        "documents": [],
        "created_at": "2026-01-01 08:00"
    })

print(f"Parsed grossistes. Total establishments: {len(establishments)}")

# -------------------------------------------------------------------------
# 3. DÉPÔTS PHARMACEUTIQUES (21)
# -------------------------------------------------------------------------
sh_dep = wb['Dépôts pharmaceutiques']
rows_dep = list(sh_dep.iter_rows(values_only=True))
for i, r in enumerate(rows_dep[1:]):
    idx_raw = clean_str(r[0])
    dept = clean_str(r[1]) or "ZOU"
    zone = clean_str(r[2])
    commune = clean_str(r[3])
    arrond = clean_str(r[4])
    name = clean_str(r[5])
    address = clean_str(r[6])
    lon_raw = clean_str(r[7])
    lat_raw = clean_str(r[8])
    resp = clean_str(r[9])
    qualif = clean_str(r[10])
    pharma_approv = clean_str(r[11])
    email = clean_str(r[13]) if len(r) > 13 else ""
    phone = clean_phone(r[14]) if len(r) > 14 else ""
    auth_ref = clean_str(r[15]) if len(r) > 15 else ""

    if not name:
        continue

    lat = None
    lon = None
    try:
        if lon_raw and lat_raw:
            lat = float(lon_raw.replace(',', '.'))
            lon = float(lat_raw.replace(',', '.'))
    except:
        pass

    auth_dt = extract_date(auth_ref)
    etab_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"activia-depot-{name}-{i}"))

    establishments.append({
        "id": etab_id,
        "code": f"DEP-{i+1:03d}",
        "name": f"Dépôt Pharmaceutique {name}" if not name.lower().startswith("dépôt") else name,
        "establishment_type": "Dépôt Pharmaceutique",
        "owner": resp or name,
        "responsible_pharmacist": resp or "Gérant de dépôt",
        "replacement_pharmacist": qualif,
        "approvisionnement_pharmacie": f"Pharmacie {pharma_approv}" if pharma_approv and not pharma_approv.lower().startswith("pharmacie") else pharma_approv,
        "address": address or f"{arrond}, {commune}",
        "city": commune or arrond or dept,
        "department": dept,
        "phone": phone or "+229",
        "email": email or "",
        "status": "Actif",
        "authorization_number": auth_ref or f"AUT-DEP-{i+1}",
        "auth_date": auth_dt,
        "commune": commune,
        "arrondissement": arrond,
        "zone_sanitaire": zone,
        "latitude": lat,
        "longitude": lon,
        "decree_ref": auth_ref,
        "documents": [],
        "created_at": "2026-01-01 08:00"
    })

print(f"Parsed dépôts. Total establishments: {len(establishments)}")

# -------------------------------------------------------------------------
# 4. INDUSTRIES PHARMACEUTIQUES (6)
# -------------------------------------------------------------------------
sh_ind = wb['Industries']
rows_ind = list(sh_ind.iter_rows(values_only=True))
for i, r in enumerate(rows_ind[1:]):
    idx_raw = clean_str(r[0])
    dept = clean_str(r[1]) or "Atlantique"
    commune = clean_str(r[3])
    arrond = clean_str(r[4])
    name = clean_str(r[5])
    ind_type = clean_str(r[6])
    address = clean_str(r[7])
    lon_raw = clean_str(r[8])
    lat_raw = clean_str(r[9])
    dg = clean_str(r[10])
    pharma_resp = clean_str(r[11])
    email_resp = clean_str(r[12]) if len(r) > 12 else ""
    email_struct = clean_str(r[13]) if len(r) > 13 else ""
    phone_resp = clean_phone(r[14]) if len(r) > 14 else ""
    phone_struct = clean_phone(r[15]) if len(r) > 15 else ""
    auth_ref = clean_str(r[16]) if len(r) > 16 else ""

    if not name:
        continue

    lat = None
    lon = None
    try:
        if lon_raw and lat_raw:
            lat = float(lon_raw.replace(',', '.'))
            lon = float(lat_raw.replace(',', '.'))
    except:
        pass

    auth_dt = extract_date(auth_ref)
    etab_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"activia-industrie-{name}-{i}"))

    establishments.append({
        "id": etab_id,
        "code": f"IND-{i+1:02d}",
        "name": name,
        "establishment_type": "Industrie Pharmaceutique / Fabricant",
        "owner": dg or name,
        "managing_director": dg,
        "responsible_pharmacist": pharma_resp or dg or "Pharmacien Responsable",
        "address": address or f"{arrond}, {commune}",
        "city": commune or arrond or dept,
        "department": dept,
        "phone": phone_struct or phone_resp or "+229",
        "email": email_struct or email_resp or "",
        "status": "Actif",
        "authorization_number": auth_ref or f"AUT-IND-{i+1}",
        "auth_date": auth_dt,
        "commune": commune,
        "arrondissement": arrond,
        "latitude": lat,
        "longitude": lon,
        "observations": f"Type: {ind_type}",
        "decree_ref": auth_ref,
        "documents": [],
        "created_at": "2026-01-01 08:00"
    })

print(f"Parsed industries. Total establishments: {len(establishments)}")

# -------------------------------------------------------------------------
# 5. PRODUITS COSMÉTIQUES (~98)
# -------------------------------------------------------------------------
sh_cosm = wb['Produits cosmétiques']
rows_cosm = list(sh_cosm.iter_rows(values_only=True))
for i, r in enumerate(rows_cosm[1:]):
    name = clean_str(r[1])
    dept = clean_str(r[2]) or "Littoral"
    phone = clean_phone(r[3])
    auth_ref = clean_str(r[4])
    obs = clean_str(r[5]) if len(r) > 5 else ""

    if not name:
        continue

    auth_dt = extract_date(auth_ref)
    etab_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"activia-cosmetique-{name}-{i}"))

    establishments.append({
        "id": etab_id,
        "code": f"COSM-{i+1:03d}",
        "name": name,
        "establishment_type": "Établissement Cosmétique",
        "owner": name,
        "responsible_pharmacist": "Responsable Technique Cosmétiques",
        "address": f"{dept}, Bénin",
        "city": dept,
        "department": dept,
        "phone": phone or "+229",
        "email": "",
        "status": "Actif",
        "authorization_number": auth_ref or f"AUT-COSM-{i+1}",
        "auth_date": auth_dt,
        "observations": obs,
        "decree_ref": auth_ref,
        "documents": [],
        "created_at": "2026-01-01 08:00"
    })

print(f"Parsed cosmétiques. Total establishments: {len(establishments)}")

# -------------------------------------------------------------------------
# 6. COMPLÉMENTS NUTRITIONNELS (~31)
# -------------------------------------------------------------------------
sh_comp = wb['Compléments nutritionnels']
rows_comp = list(sh_comp.iter_rows(values_only=True))
for i, r in enumerate(rows_comp[1:]):
    name = clean_str(r[1])
    dept = clean_str(r[2]) or "Littoral"
    phone = clean_phone(r[3])
    auth_ref = clean_str(r[4])
    obs = clean_str(r[5]) if len(r) > 5 else ""

    if not name:
        continue

    auth_dt = extract_date(auth_ref)
    etab_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"activia-comp-{name}-{i}"))

    establishments.append({
        "id": etab_id,
        "code": f"COMP-{i+1:03d}",
        "name": name,
        "establishment_type": "Compléments Nutritionnels",
        "owner": name,
        "responsible_pharmacist": "Responsable Qualité Compléments",
        "address": f"{dept}, Bénin",
        "city": dept,
        "department": dept,
        "phone": phone or "+229",
        "email": "",
        "status": "Actif",
        "authorization_number": auth_ref or f"AUT-COMP-{i+1}",
        "auth_date": auth_dt,
        "observations": obs,
        "decree_ref": auth_ref,
        "documents": [],
        "created_at": "2026-01-01 08:00"
    })

print(f"Parsed compléments. Total establishments: {len(establishments)}")

# -------------------------------------------------------------------------
# 7. MATÉRIEL MÉDICAL (~196)
# -------------------------------------------------------------------------
sh_mat = wb['Mat méd']
rows_mat = list(sh_mat.iter_rows(values_only=True))
for i, r in enumerate(rows_mat[1:]):
    name = clean_str(r[1])
    resp = clean_str(r[2])
    auth_type = clean_str(r[3])
    dept = clean_str(r[4]) or "Littoral"
    phone = clean_phone(r[5])
    auth_ref = clean_str(r[6])
    obs = clean_str(r[7]) if len(r) > 7 else ""

    if not name:
        continue

    auth_dt = extract_date(auth_ref)
    etab_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"activia-matmed-{name}-{i}"))

    establishments.append({
        "id": etab_id,
        "code": f"MM-{i+1:03d}",
        "name": name,
        "establishment_type": "Matériel Médical",
        "owner": name,
        "responsible_pharmacist": resp or "Responsable Technique Matériel Médical",
        "address": f"{dept}, Bénin",
        "city": dept,
        "department": dept,
        "phone": phone or "+229",
        "email": "",
        "status": "Actif",
        "authorization_number": auth_ref or f"AUT-MM-{i+1}",
        "auth_date": auth_dt,
        "observations": f"{auth_type} {obs}".strip(),
        "decree_ref": auth_ref,
        "documents": [],
        "created_at": "2026-01-01 08:00"
    })

print(f"Parsed matériel médical. Total establishments: {len(establishments)}")

# -------------------------------------------------------------------------
# 8. PRODUITS CHIMIQUES & RÉACTIFS DE LABORATOIRE - PCRL (~204)
# -------------------------------------------------------------------------
sh_pcrl = wb['PCRL']
rows_pcrl = list(sh_pcrl.iter_rows(values_only=True))
for i, r in enumerate(rows_pcrl[1:]):
    name = clean_str(r[1])
    resp = clean_str(r[2])
    auth_type = clean_str(r[3])
    dept = clean_str(r[4]) or "Littoral"
    phone = clean_phone(r[5])
    auth_ref = clean_str(r[6])
    obs = clean_str(r[7]) if len(r) > 7 else ""

    if not name:
        continue

    auth_dt = extract_date(auth_ref)
    etab_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"activia-pcrl-{name}-{i}"))

    establishments.append({
        "id": etab_id,
        "code": f"PCRL-{i+1:03d}",
        "name": name,
        "establishment_type": "Produits Chimiques & Réactifs (PCRL)",
        "owner": name,
        "responsible_pharmacist": resp or "Pharmacien / Responsable PCRL",
        "address": f"{dept}, Bénin",
        "city": dept,
        "department": dept,
        "phone": phone or "+229",
        "email": "",
        "status": "Actif",
        "authorization_number": auth_ref or f"AUT-PCRL-{i+1}",
        "auth_date": auth_dt,
        "observations": f"{auth_type} {obs}".strip(),
        "decree_ref": auth_ref,
        "documents": [],
        "created_at": "2026-01-01 08:00"
    })

print(f"Parsed PCRL. Total establishments: {len(establishments)}")

# -------------------------------------------------------------------------
# 9. ÉTABLISSEMENTS DE REPRÉSENTATION PHARMACEUTIQUE - ERP (21)
# -------------------------------------------------------------------------
sh_erp = wb['ERP']
rows_erp = list(sh_erp.iter_rows(values_only=True))
for i, r in enumerate(rows_erp[1:]):
    name = clean_str(r[1])
    gerant = clean_str(r[2])
    pharma_resp = clean_str(r[3])
    phone = clean_phone(r[4])
    auth_ref = clean_str(r[5])
    obs = clean_str(r[6]) if len(r) > 6 else ""

    if not name:
        continue

    auth_dt = extract_date(auth_ref)
    etab_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"activia-erp-{name}-{i}"))

    establishments.append({
        "id": etab_id,
        "code": f"ERP-{i+1:03d}",
        "name": name,
        "establishment_type": "Établissement de Représentation (ERP)",
        "owner": gerant or name,
        "managing_director": gerant,
        "responsible_pharmacist": pharma_resp or gerant or "Pharmacien Responsable ERP",
        "address": "Cotonou, Bénin",
        "city": "Cotonou",
        "department": "Littoral",
        "phone": phone or "+229",
        "email": "",
        "status": "Actif",
        "authorization_number": auth_ref or f"AUT-ERP-{i+1}",
        "auth_date": auth_dt,
        "observations": obs,
        "decree_ref": auth_ref,
        "documents": [],
        "created_at": "2026-01-01 08:00"
    })

print(f"Parsed ERP. Total establishments: {len(establishments)}")

# -------------------------------------------------------------------------
# 10. OFFICINES EN GÉRANCE (50)
# -------------------------------------------------------------------------
sh_ger = wb['Gérance']
rows_ger = list(sh_ger.iter_rows(values_only=True))
for i, r in enumerate(rows_ger[1:]):
    name_raw = clean_str(r[1])
    decede = clean_str(r[2])
    date_deces = clean_str(r[3])
    motif = clean_str(r[5]) or "Délai légal de succession"
    statut_onpb = clean_str(r[6])
    obs_onpb = clean_str(r[7])
    obs_abmed = clean_str(r[8]) if len(r) > 8 else ""

    if not name_raw:
        continue

    # Extract clean name and phone
    lines = [l.strip() for l in str(r[1]).split('\n') if l.strip()]
    name = lines[0] if lines else name_raw
    phone = clean_phone(lines[1]) if len(lines) > 1 else ""

    # extract town in parenthesis
    m_town = re.search(r'\(([^)]+)\)', name)
    city = m_town.group(1).strip() if m_town else "Bénin"

    etab_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"activia-gerance-{name}-{i}"))

    establishments.append({
        "id": etab_id,
        "code": f"GER-{i+1:03d}",
        "name": f"Pharmacie {name}" if not name.lower().startswith("pharmacie") else name,
        "establishment_type": "Officine en Gérance (Décès/Succession)",
        "owner": decede or "Succession du Titulaire",
        "responsible_pharmacist": f"{decede} (En gérance)",
        "replacement_pharmacist": "En attente de pharmacien gérant désigné",
        "address": f"{city}, Bénin",
        "city": city,
        "department": "Bénin",
        "phone": phone or "+229",
        "email": "",
        "status": "En attente",
        "authorization_number": f"DOS-GERANCE-{i+1:03d}",
        "auth_date": "2026-01-01",
        "observations": f"Motif: {motif}. Statut ONPB: {statut_onpb}. Décision ABMed: {obs_abmed or obs_onpb}",
        "documents": [],
        "created_at": "2026-01-01 08:00"
    })

print(f"\n=======================================================")
print(f"TOTAL REAL ESTABLISHMENTS EXTRACTED: {len(establishments)}")
print(f"=======================================================")

# Output to TypeScript file
ts_content = f"""import {{ Establishment }} from '@/types';

// ==============================================================================
// REGISTRE NATIONAL OFFICIEL DES ÉTABLISSEMENTS PHARMACEUTIQUES DU BÉNIN
// SOURCE : MINISTÈRE DE LA SANTÉ / DLVS / SERVICE DES LICENCES (SL)
// TOTAL STRUCTURES IMPORTÉES : {len(establishments)}
// ==============================================================================

export const REAL_ESTABLISHMENTS: Establishment[] = {json.dumps(establishments, ensure_ascii=False, indent=2)};
"""

with open("src/lib/realEstablishments.ts", "w", encoding="utf-8") as f:
    f.write(ts_content)

print("Successfully written src/lib/realEstablishments.ts")
