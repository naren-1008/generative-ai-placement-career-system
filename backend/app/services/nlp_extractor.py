import os
import json
import re
import logging

logger = logging.getLogger(__name__)

# Try loading spaCy model if available
try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception:
        nlp = spacy.blank("en")
except ImportError:
    nlp = None

class NLPExtractorService:
    # Section Header Keywords Pattern Definitions
    SECTION_PATTERNS = {
        "education": r'^\s*(education|academic background|academics|qualifications|academic details)\s*$',
        "skills": r'^\s*(skills|technical skills|key skills|technologies|core competencies)\s*$',
        "projects": r'^\s*(projects|key projects|academic projects|personal projects)\s*$',
        "certifications": r'^\s*(certifications|certificates|professional certifications|credentials|licenses & certifications)\s*$',
        "experience": r'^\s*(experience|work experience|internships|professional experience|employment history)\s*$'
    }

    def __init__(self, taxonomy_path=None):
        if not taxonomy_path:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            taxonomy_path = os.path.join(base_dir, "data", "taxonomy.json")
            
        self.taxonomy = self._load_taxonomy(taxonomy_path)

    def _load_taxonomy(self, path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("skills", {})
        except Exception as e:
            logger.error(f"Error loading taxonomy from {path}: {e}")
            return {}

    def extract_all(self, text):
        """
        Parses raw text and returns a structured dictionary of extracted profile info:
        skills, education, projects, certifications, experience, contact_info.
        """
        sections = self._parse_sections(text)

        email = self.extract_email(text)
        phone = self.extract_phone(text)
        github = self.extract_github(text)
        linkedin = self.extract_linkedin(text)

        skills = self.extract_skills(text)
        education = self.extract_education(text, sections.get("education", []))
        projects = self.extract_projects(text, sections.get("projects", []))
        certifications = self.extract_certifications(text, sections.get("certifications", []))
        experience = self.extract_experience(text, sections.get("experience", []))

        return {
            "contact_info": {
                "email": email,
                "phone": phone,
                "github": github,
                "linkedin": linkedin
            },
            "skills": skills,
            "education": education,
            "projects": projects,
            "certifications": certifications,
            "experience": experience
        }

    def _parse_sections(self, text):
        """
        Splits text into logical section blocks using regex heading boundaries.
        """
        sections = {}
        current_section = None
        lines = text.split("\n")

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            # Check if line is a section header
            matched_header = None
            for sec_name, pattern in self.SECTION_PATTERNS.items():
                if re.match(pattern, stripped, re.IGNORECASE):
                    matched_header = sec_name
                    break

            if matched_header:
                current_section = matched_header
                if current_section not in sections:
                    sections[current_section] = []
            elif current_section:
                sections[current_section].append(stripped)

        return sections

    def extract_email(self, text):
        match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
        return match.group(0) if match else ""

    def extract_phone(self, text):
        match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        return match.group(0) if match else ""

    def extract_github(self, text):
        match = re.search(r'https?://(?:www\.)?github\.com/[a-zA-Z0-9_-]+', text, re.IGNORECASE)
        return match.group(0) if match else ""

    def extract_linkedin(self, text):
        match = re.search(r'https?://(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+', text, re.IGNORECASE)
        return match.group(0) if match else ""

    def extract_skills(self, text):
        """
        Extracts canonical skills from taxonomy, ensuring boundary-awareness and deduplication.
        """
        extracted_skills = set()
        text_lower = text.lower()
        
        # Tokenize text with word boundary awareness
        words = set(re.findall(r'\b[a-zA-Z0-9\+#\.]+\b', text_lower))

        for category, skill_dict in self.taxonomy.items():
            for canonical_name, aliases in skill_dict.items():
                for alias in aliases:
                    alias_lower = alias.lower()
                    if " " in alias_lower or "+" in alias_lower or "#" in alias_lower:
                        pattern = r'\b' + re.escape(alias_lower) + r'\b'
                        if re.search(pattern, text_lower):
                            extracted_skills.add(canonical_name)
                            break
                    else:
                        if alias_lower in words:
                            extracted_skills.add(canonical_name)
                            break

        return sorted(list(extracted_skills))

    def extract_education(self, text, section_lines=None):
        education_entries = []
        degrees = ["B.Tech", "M.Tech", "B.E.", "B.Sc", "M.Sc", "BCA", "MCA", "Bachelor", "Master", "PhD"]
        
        lines_to_check = section_lines if section_lines else text.split("\n")
        
        for line in lines_to_check:
            line_str = line.strip()
            for deg in degrees:
                if deg.lower() in line_str.lower():
                    education_entries.append({
                        "degree": deg,
                        "details": line_str
                    })
                    break

        # Fallback line scan if section parsing yielded no degrees
        if not education_entries and section_lines is None:
            for line in text.split("\n"):
                for deg in degrees:
                    if deg.lower() in line.lower():
                        education_entries.append({
                            "degree": deg,
                            "details": line.strip()
                        })
                        break

        # Deduplicate by details string
        seen = set()
        unique_entries = []
        for entry in education_entries:
            if entry["details"] not in seen:
                seen.add(entry["details"])
                unique_entries.append(entry)

        return unique_entries[:3]

    def extract_projects(self, text, section_lines=None):
        projects = []
        lines_to_check = section_lines if section_lines else []
        
        # If no explicit section block was captured, fallback to regex search
        if not lines_to_check:
            lines = text.split("\n")
            in_sec = False
            for line in lines:
                l_str = line.strip()
                if re.match(r'^\s*(projects|key projects|academic projects)\s*$', l_str, re.IGNORECASE):
                    in_sec = True
                    continue
                elif in_sec and re.match(r'^\s*(experience|education|skills|certifications|awards)\s*$', l_str, re.IGNORECASE):
                    break
                if in_sec and len(l_str) > 8:
                    lines_to_check.append(l_str)

        for line in lines_to_check:
            cleaned = line.lstrip("•-* ").strip()
            if len(cleaned) > 10:
                projects.append({
                    "title": cleaned[:60],
                    "description": cleaned
                })

        # Deduplicate
        seen = set()
        unique_proj = []
        for p in projects:
            if p["title"] not in seen:
                seen.add(p["title"])
                unique_proj.append(p)

        return unique_proj[:4]

    def extract_certifications(self, text, section_lines=None):
        """
        Extracts certification entries from section block or line keywords.
        Returns a clean list of strings.
        """
        certs = []
        lines_to_check = section_lines if section_lines else []

        # Fallback scanning if no explicit section block
        if not lines_to_check:
            lines = text.split("\n")
            in_sec = False
            for line in lines:
                l_str = line.strip()
                if re.match(r'^\s*(certifications|certificates|professional certifications|credentials)\s*$', l_str, re.IGNORECASE):
                    in_sec = True
                    continue
                elif in_sec and re.match(r'^\s*(experience|education|skills|projects|awards)\s*$', l_str, re.IGNORECASE):
                    break
                if in_sec and len(l_str) > 5:
                    lines_to_check.append(l_str)

        # Keyword backup scan across entire text if still empty
        if not lines_to_check:
            for line in text.split("\n"):
                l_str = line.strip()
                if re.search(r'\b(certified|certificate|certification|coursera|udemy|aws certified|nptel)\b', l_str, re.IGNORECASE):
                    if len(l_str) > 8 and not re.match(r'^\s*(certifications|certificates)\s*$', l_str, re.IGNORECASE):
                        lines_to_check.append(l_str)

        for line in lines_to_check:
            cleaned = line.lstrip("•-* ").strip()
            if cleaned and len(cleaned) > 4:
                certs.append(cleaned)

        # Deduplicate while preserving order
        seen = set()
        unique_certs = []
        for c in certs:
            if c.lower() not in seen:
                seen.add(c.lower())
                unique_certs.append(c)

        return unique_certs[:5]

    def extract_experience(self, text, section_lines=None):
        """
        Extracts experience/internship entries.
        Returns a structured list of dicts: [{"title": "...", "description": "..."}]
        """
        exp_entries = []
        lines_to_check = section_lines if section_lines else []

        if not lines_to_check:
            lines = text.split("\n")
            in_sec = False
            for line in lines:
                l_str = line.strip()
                if re.match(r'^\s*(experience|work experience|internships|professional experience)\s*$', l_str, re.IGNORECASE):
                    in_sec = True
                    continue
                elif in_sec and re.match(r'^\s*(education|skills|projects|certifications|awards)\s*$', l_str, re.IGNORECASE):
                    break
                if in_sec and len(l_str) > 8:
                    lines_to_check.append(l_str)

        for line in lines_to_check:
            cleaned = line.lstrip("•-* ").strip()
            if len(cleaned) > 8:
                exp_entries.append({
                    "title": cleaned[:60],
                    "description": cleaned
                })

        seen = set()
        unique_exp = []
        for e in exp_entries:
            if e["title"] not in seen:
                seen.add(e["title"])
                unique_exp.append(e)

        return unique_exp[:4]
