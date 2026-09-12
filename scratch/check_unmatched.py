import json
from define_reasons_mappings import translations, section_to_specialty_ar
from parse_reasons import sections

unmatched = []
for sec, motifs in sections.items():
    for m in motifs:
        if m not in translations:
            unmatched.append(m)

with open(r"d:\Application Web\WebTabibi\scratch\unmatched.json", "w", encoding="utf-8") as f:
    json.dump(unmatched, f, ensure_ascii=False, indent=2)

print(f"Total unmatched motifs: {len(unmatched)}")
