import json
from define_reasons_mappings import translations as old_trans, section_to_specialty_ar
from parse_reasons import sections

extra_translations = {
    "Suivi du développement": "متابعة التطور والنمو",
    "Stress": "توتر وضغط نفسي",
    "Douleur articulaire": "ألم المفاصل",
    "Consultation de chirurgie pédiatrique": "استشارة جراحة الأطفال",
    "Hernie chez l'enfant": "فتق عند الأطفال",
    "Masse / kyste": "كتلة أو كيس",
    "Douleur abdominale chirurgicale": "ألم بطني جراحي حاد",
    "Avis chirurgical pédiatrique": "رأي واستشارة جراح أطفال",
    "Visite médicale d'embauche": "فحص طبي للتوظيف والعمل",
    "Visite périodique": "فحص طبي دوري للموظفين",
    "Visite de reprise": "فحص استئناف العمل بعد المرض",
    "Visite de pré-reprise": "فحص ما قبل استئناف العمل",
    "Aptitude au poste": "شهادة لياقة للمنصب والمهام",
    "Inaptitude au poste": "تقييم عدم اللياقة للعمل",
    "Évaluation des risques professionnels": "تقييم المخاطر المهنية في العمل",
    "Accident du travail": "إصابة وحادث عمل",
    "Maladie professionnelle": "مرض مهني",
    "Prévention en santé au travail": "وقاية وصحة العمل",
    "Consultation gériatrique": "استشارة طب المسنين والشيخوخة",
    "Bilan global de la personne âgée": "فحص شامل للمسنين وكبار السن",
    "Chutes répétées": "السقوط المتكرر وفقدان التوازن",
    "Fragilité": "تقييم الوهن والضعف العام للمسنين",
    "Perte d'autonomie": "تقييم فقدان الاستقلالية الحركية",
    "Polymédication": "مراجعة وضبط الأدوية المتعددة للمسنين",
    "Troubles cognitifs": "اضطرابات الإدراك والتفكير",
    "Suivi des maladies chroniques": "متابعة الأمراض المزمنة لكبار السن",
    "Évaluation gériatrique": "تقييم طبي شامل للمسن",
    "Consultation de douleur": "استشارة علاج وتسكين الآلام",
    "Difficulté respiratoire": "صعوبة وضيق حاد في التنفس",
    "Douleur abdominale aiguë": "ألم حاد ومفاجئ في البطن",
    "Fièvre importante": "حمى وحرارة شديدة الارتفاع",
    "Intoxication": "تسمم غذائي أو دوائي",
    "Crise d'asthme": "أزمة ونوبة ربو حادة",
    "Convulsion": "تشنجات عصبية حادة",
    "Saignement important": "نزيف حاد يتطلب تدخلاً",
    "Cirrhose": "تليف الكبد المزمن (السكيروز)",
    "Consultation de santé sexuelle": "استشارة الصحة الجنسية",
    "Infertilité féminine": "عقم وتأخر الإنجاب عند النساء",
    "Consultation préconceptionnelle": "استشارة ما قبل الحمل والتخطيط للإنجاب",
    "Suivi de traitement de fertilité": "متابعة بروتوكول علاج الخصوبة",
    "Bilan hormonal de fertilité": "فحص الهرمونات والخصوبة",
    "Conseil en fertilité": "استشارة وتوجيه في الخصوبة والإنجاب",
    "Assistance médicale à la procréation": "المساعدة الطبية على الإنجاب (أطفال الأنابيب / PMA)"
}

all_translations = {**old_trans, **extra_translations}

# Build dataset of all reasons
all_reasons = []
unmatched = []

for section, motifs in sections.items():
    spec_ar = section_to_specialty_ar[section]
    for m in motifs:
        ar = all_translations.get(m)
        if not ar:
            unmatched.append(m)
        all_reasons.append({
            "section": section,
            "specialty_ar": spec_ar,
            "namefr": m,
            "namear": ar or m
        })

print(f"Total reasons compiled: {len(all_reasons)}, unmatched: {len(unmatched)}")

with open(r"d:\Application Web\WebTabibi\scratch\all_reasons_dataset.json", "w", encoding="utf-8") as f:
    json.dump(all_reasons, f, ensure_ascii=False, indent=2)

print("Saved all_reasons_dataset.json")
