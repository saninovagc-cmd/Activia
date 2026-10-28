import openpyxl
import datetime
import uuid
import json
import re

# 14 authentic DLVS Users mapping
USER_MAP = {
    'SATCHIVI': ('a0000000-0000-0000-0000-000000000001', 'Dr. SATCHIVI Jocelyne KANLE'),
    'HOUNGUE': ('a0000000-0000-0000-0000-000000000002', 'Dr. HOUNGUE Perrin'),
    'ALOFA': ('a0000000-0000-0000-0000-000000000003', 'Dr. ALOFA Huibert'),
    'KINTIN': ('a0000000-0000-0000-0000-000000000004', 'Dr. KINTIN Daniel'),
    'KINTI': ('a0000000-0000-0000-0000-000000000004', 'Dr. KINTIN Daniel'),
    'AROUNA': ('a0000000-0000-0000-0000-000000000005', 'Dr. AROUNA Radihath'),
    'FIKARA': ('a0000000-0000-0000-0000-000000000006', 'Dr. FIKARA Sarath'),
    'TONOUEWA': ('a0000000-0000-0000-0000-000000000007', 'M. TONOUEWA Hermion'),
    'LOKOUN': ('a0000000-0000-0000-0000-000000000008', 'Dr. LOKOUN Ella'),
    'TONOUKOUIN': ('a0000000-0000-0000-0000-000000000009', 'Dr. TONOUKOUIN Joel'),
    'DOSSOU': ('a0000000-0000-0000-0000-000000000010', 'Dr. DOSSOU YOVO H. O. Mael'),
    'MAELLE': ('a0000000-0000-0000-0000-000000000010', 'Dr. DOSSOU YOVO H. O. Mael'),
    'MAËLLE': ('a0000000-0000-0000-0000-000000000010', 'Dr. DOSSOU YOVO H. O. Mael'),
    'GANHOU': ('a0000000-0000-0000-0000-000000000011', 'Dr. GANHOU Irenée'),
    'GAHOU': ('a0000000-0000-0000-0000-000000000011', 'Dr. GANHOU Irenée'),
    'IRÉNÉ': ('a0000000-0000-0000-0000-000000000011', 'Dr. GANHOU Irenée'),
    'IRENE': ('a0000000-0000-0000-0000-000000000011', 'Dr. GANHOU Irenée'),
    'YAMBODE': ('a0000000-0000-0000-0000-000000000012', 'Dr. YAMBODE Maria-Carole'),
    'VIGAN': ('a0000000-0000-0000-0000-000000000013', 'Dr. VIGAN Jean Paul'),
    'ADOGNON': ('a0000000-0000-0000-0000-000000000014', 'Mme ADOGNON Larissa')
}

SERVICE_CHIEFS = {
    'SSMUR': ('a0000000-0000-0000-0000-000000000003', 'Dr. ALOFA Huibert'),
    'SL': ('a0000000-0000-0000-0000-000000000004', 'Dr. KINTIN Daniel'),
    'SVPS': ('a0000000-0000-0000-0000-000000000002', 'Dr. HOUNGUE Perrin')
}

DEPT_NAMES = {
    'SSMUR': 'Service de la Surveillance du Marché (SSMUR)',
    'SL': 'Service des Licences (SL)',
    'SVPS': 'Service des Vigilances et des Produits de Santé (SVPS)'
}

def clean_date(val):
    if val is None:
        return None
    if isinstance(val, (datetime.datetime, datetime.date)):
        return val.strftime('%Y-%m-%d')
    s = str(val).strip()
    if not s or s in ['-', '/', 'NA', 'N/A', '#VALUE!', 'None']:
        return None
    # match YYYY-MM-DD
    m = re.match(r'^(\d{4})-(\d{2})-(\d{2})', s)
    if m:
        return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    # match DD/MM/YYYY
    m = re.match(r'^(\d{1,2})/(\d{1,2})/(\d{4})', s)
    if m:
        d, mth, y = m.group(1), m.group(2), m.group(3)
        return f"{y}-{int(mth):02d}-{int(d):02d}"
    return None

def clean_int(val):
    if val is None:
        return None
    try:
        if isinstance(val, (int, float)):
            v = int(val)
            return v if v >= 0 else None
        s = str(val).strip()
        if s.isdigit():
            return int(s)
    except:
        pass
    return None

def parse_month_year(period_str, month_year_str):
    if month_year_str and isinstance(month_year_str, str):
        s = month_year_str.lower().strip()
        month_map = {
            'janvier': '01', 'février': '02', 'fevrier': '02', 'mars': '03',
            'avril': '04', 'mai': '05', 'juin': '06', 'juillet': '07',
            'août': '08', 'aout': '08', 'septembre': '09', 'octobre': '10',
            'novembre': '11', 'décembre': '12', 'decembre': '12'
        }
        for m_name, m_num in month_map.items():
            if m_name in s:
                m_year = re.search(r'\b(202[0-9])\b', s)
                year = m_year.group(1) if m_year else '2025'
                return f"{year}-{m_num}-01"
    
    if period_str and isinstance(period_str, str):
        m = re.search(r'(\d{1,2})/(\d{1,2})/(\d{2,4})', period_str)
        if m:
            d, mth, y = m.group(1), m.group(2), m.group(3)
            if len(y) == 2:
                y = '20' + y
            return f"{y}-{int(mth):02d}-{int(d):02d}"
            
    return '2025-10-01'

def detect_mail_type(subj):
    s = (subj or '').lower()
    if any(k in s for k in ['demande', 'quitus', 'installation', 'agrément', 'autorisation', 'renouvellement', 'mutation', 'remplacement', 'transfert', 'carte']):
        return 'Demande Usager'
    if any(k in s for k in ['rapport', 'procès-verbal', 'pv', 'cession', 'compte rendu', 'statistique']):
        return 'Rapport / PV'
    if any(k in s for k in ['notification', 'signalement', 'vigilance', 'effet indésirable', 'incident', 'rappel', 'falsifié']):
        return 'Notification Réglementaire'
    if any(k in s for k in ['recours', 'contentieux', 'mise en demeure', 'plainte', 'réclamation']):
        return 'Contentieux'
    if any(k in s for k in ['circulaire', 'note d\'information', 'instruction']):
        return 'Circulaire Ministérielle'
    return 'Officiel'

def extract_sender_and_type(subj):
    s = (subj or '').strip()
    
    # Check for patterns like "... / PHARMACIE BAYOL" or "... /BAYOL"
    if '/' in s:
        parts = s.split('/')
        last_part = parts[-1].strip()
        if len(last_part) > 2 and len(last_part) < 60:
            if any(k in last_part.upper() for k in ['PHARMACIE', 'LABORATOIRE', 'CLINIQUE', 'SARL', 'SA', 'ONG', 'SOCIETE']):
                return last_part, 'Établissement Pharmaceutique'
            elif any(k in last_part.upper() for k in ['DR', 'DOCTEUR', 'M.', 'MME']):
                return last_part, 'Professionnel de Santé'
            elif not any(k in last_part.lower() for k in ['avis', 'suite', 'urgent', 'demande', 'reponse']):
                return last_part, 'Promoteur / Usager'

    # Check for mentions of pharmacy
    m = re.search(r'(PHARMACIE\s+[A-ZÀ-ÿ\s\-]+)', s, re.IGNORECASE)
    if m:
        p_name = m.group(1).strip()
        if len(p_name) < 45:
            return p_name.title(), 'Établissement Pharmaceutique'

    # Default based on subject content
    if 'demande' in s.lower() or 'quitus' in s.lower():
        return 'Promoteur d\'Officine / Demandeur', 'Professionnel de Santé'
    if 'ministère' in s.lower() or 'direction' in s.lower() or 'dg' in s.lower():
        return 'Ministère de la Santé / Directions Partenaires', 'Administration Publique'
    
    return 'Usager / Promoteur DLVS', 'Promoteur / Usager'

def map_assignee(collaborateur_str, sname):
    if not collaborateur_str:
        return SERVICE_CHIEFS[sname]
    s_upper = collaborateur_str.upper()
    for key, (u_id, u_name) in USER_MAP.items():
        if key in s_upper:
            return u_id, u_name
    return SERVICE_CHIEFS[sname]

def determine_status(r, sname, date_trait, date_visa, date_aff_svc, date_aff_dlvs):
    # Check status column in row
    status_raw = ''
    if sname == 'SSMUR' and len(r) > 18 and r[18]:
        status_raw = str(r[18]).lower().strip()
    elif sname in ['SL', 'SVPS'] and len(r) > 16 and r[16]:
        status_raw = str(r[16]).lower().strip()

    if 'clôturé' in status_raw or 'cloture' in status_raw:
        return 'cloture'
    if 'traité' in status_raw or 'traite' in status_raw:
        return 'reponse' if date_visa else 'validation'
    if date_visa:
        return 'reponse'
    if date_trait:
        return 'validation'
    if date_aff_svc:
        return 'traitement'
    if date_aff_dlvs:
        return 'affectation'
    return 'enregistrement'

def main():
    wb_path = r'Base de données/DLVS/TABLEAU DE BORD COURRIERS DLVS_15.09.2026.xlsx'
    wb = openpyxl.load_workbook(wb_path, read_only=True, data_only=True)
    
    all_mails = []
    seen_numbers = set()
    mail_idx = 1

    for sname in ['SSMUR', 'SL', 'SVPS']:
        sh = wb[sname]
        dept = DEPT_NAMES[sname]
        sheet_count = 0

        for row in list(sh.iter_rows(values_only=True))[1:]:
            if not any(row[:10]):
                continue
            
            sheet_count += 1
            n_ordre = row[0]
            period_str = str(row[1]).strip() if len(row) > 1 and row[1] else ''
            chrono_raw = str(row[2]).strip() if len(row) > 2 and row[2] not in (None, '', '-', '/', 'NA', 'N/A') else ''
            month_year = str(row[3]).strip() if len(row) > 3 and row[3] else ''
            
            # Dates
            date_rec_dlvs = clean_date(row[4]) if len(row) > 4 else None
            date_aff_svc = clean_date(row[5]) if len(row) > 5 else None
            delay_dlvs_svc = clean_int(row[6]) if len(row) > 6 else None
            
            subject = str(row[7]).strip() if len(row) > 7 and row[7] else 'Courrier officiel administratif DLVS'
            
            date_aff_chef = clean_date(row[8]) if len(row) > 8 else None
            delay_chef = clean_int(row[9]) if len(row) > 9 else None
            
            collab_raw = str(row[10]).strip() if len(row) > 10 and row[10] not in (None, '', '-', '/', 'NA', 'N/A') else ''
            
            date_trait = clean_date(row[11]) if len(row) > 11 else None
            delay_trait = clean_int(row[12]) if len(row) > 12 else None
            
            date_visa = clean_date(row[13]) if len(row) > 13 else None
            delay_visa = clean_int(row[14]) if len(row) > 14 else None
            
            # Observation
            obs = ''
            if sname == 'SSMUR' and len(row) > 23 and row[23]:
                obs = str(row[23]).strip()
            elif sname in ['SL', 'SVPS'] and len(row) > 21 and row[21]:
                obs = str(row[21]).strip()

            # Normalized Receipt Date
            receipt_date = date_rec_dlvs or date_aff_svc or date_aff_chef or date_trait or parse_month_year(period_str, month_year)
            
            # Standard due date (e.g., receipt_date + 15 or 30 days)
            try:
                rec_dt = datetime.datetime.strptime(receipt_date, '%Y-%m-%d')
                due_dt = rec_dt + datetime.timedelta(days=15)
                due_date = due_dt.strftime('%Y-%m-%d')
            except:
                due_date = '2025-11-30'

            # Chrono / register number
            if chrono_raw and chrono_raw != 'None':
                # clean up chrono
                chrono = chrono_raw.replace(' ', '')
                if chrono in seen_numbers:
                    chrono = f"{chrono}-{mail_idx}"
                seen_numbers.add(chrono)
                reg_num = chrono
            else:
                reg_num = f"ABMED/2025A/{sname}-{mail_idx:04d}"
                seen_numbers.add(reg_num)

            # Assignee
            mgr_id, mgr_name = map_assignee(collab_raw, sname)
            
            # Sender
            sender, sender_type = extract_sender_and_type(subject)
            
            # Mail Type
            mail_type = detect_mail_type(subject)
            
            # Status
            status = determine_status(row, sname, date_trait, date_visa, date_aff_chef, date_aff_svc)
            
            # Priority
            priority = 'haute' if any(w in subject.lower() for w in ['urgent', 'périmé', 'falsifié', 'recours', 'plainte', 'danger', 'avarié']) else 'moyenne'
            
            mail_item = {
                'id': str(uuid.uuid4()),
                'register_number': reg_num,
                'receipt_date': receipt_date,
                'reference': chrono_raw if chrono_raw else f"REF-{sname}-{mail_idx:04d}",
                'sender': sender,
                'sender_type': sender_type,
                'subject': subject,
                'mail_type': mail_type,
                'department': dept,
                'manager_id': mgr_id,
                'manager_name': mgr_name,
                'due_date': due_date,
                'status': status,
                'priority': priority,
                'target_service': dept,
                'affectation_date_dlvs': date_aff_svc,
                'affectation_date_service': date_aff_chef,
                'treatment_date_collaborator': date_trait,
                'visa_date_chef': date_visa,
                'delay_dlvs_days': delay_dlvs_svc,
                'delay_service_days': delay_chef,
                'delay_treatment_days': delay_trait,
                'delay_visa_days': delay_visa,
                'observations': obs if obs not in ['-', '/', 'NA', 'None'] else '',
                'created_at': f"{receipt_date}T08:30:00Z",
                'updated_at': f"{date_visa or date_trait or receipt_date}T17:00:00Z"
            }
            all_mails.append(mail_item)
            mail_idx += 1

        print(f"Processed sheet {sname}: {sheet_count} courriers.")

    wb.close()
    print(f"\nTotal courriers migrated: {len(all_mails)}")

    # Write to src/lib/realCourriers.ts
    output_ts_path = r'src/lib/realCourriers.ts'
    with open(output_ts_path, 'w', encoding='utf-8') as f:
        f.write("import { IncomingMail } from '@/types';\n\n")
        f.write("// ==============================================================================\n")
        f.write("// DONNÉES RÉELLES OFFICIELLES — COURRIERS ENTRANTS DLVS (SSMUR, SL, SVPS)\n")
        f.write("// Migré fidèlement depuis TABLEAU DE BORD COURRIERS DLVS_15.09.2026.xlsx\n")
        f.write(f"// Volume : {len(all_mails)} courriers officiels avec chronos, dates et délais réels\n")
        f.write("// ==============================================================================\n\n")
        f.write("export const REAL_INCOMING_MAILS: IncomingMail[] = ")
        f.write(json.dumps(all_mails, ensure_ascii=False, indent=2))
        f.write(";\n")

    print(f"Successfully generated {output_ts_path} ({len(all_mails)} courriers)")

if __name__ == '__main__':
    main()
