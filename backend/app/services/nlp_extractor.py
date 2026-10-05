import os
import json
import re
import logging
import unicodedata

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
    # Comprehensive Section Header Patterns with boundary and delimiter support
    SECTION_PATTERNS = {
        "education": r'^\s*(education|academic background|academics|qualifications|academic details|scholastic achievements)\b[:\s-]*$',
        "skills": r'^\s*(technical skills|skills|key skills|technologies|core competencies|programming languages|areas of expertise)\b[:\s-]*$',
        "experience": r'^\s*(work experience|professional experience|experience|employment history|internships|work history|industrial training)\b[:\s-]*$',
        "projects": r'^\s*(projects|academic projects|key projects|personal projects|technical projects|notable projects|capstone projects)\b[:\s-]*$',
        "certifications": r'^\s*(certifications|certificates|professional certifications|credentials|licenses & certifications|certifications & licenses|certifications & courses|courses & certifications)\b[:\s-]*$',
        "involvement": r'^\s*(campus involvement|leadership|extracurricular activities|activities|co-curricular activities|volunteer experience|community involvement|positions of responsibility)\b[:\s-]*$',
        "accomplishments": r'^\s*(accomplishments|achievements|honors & awards|awards & achievements|competitions|hackathons)\b[:\s-]*$',
        "publications": r'^\s*(publications|research papers|patents)\b[:\s-]*$'
    }

    BULLET_CHARS = ('•', '-', '*', '–', '—', '\x83', '\x95', '▪', '►', '‣', '·')
    DATE_PATTERN = r'^(?:(19|20)\d{2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(19|20)?\d{2})\s*(?:[-–—to]+\s*(?:(19|20)\d{2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(19|20)?\d{2}|present|ongoing|current))?$'

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
        Ensures sections like 'Campus Involvement' and 'Accomplishments' do not leak into certifications or projects.
        """
        sections = {}
        current_section = None
        lines = text.split("\n")

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

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
        degrees = ["B.Tech", "M.Tech", "B.E.", "B.Sc", "M.Sc", "BCA", "MCA", "Bachelor", "Master", "Diploma", "PhD"]
        
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

        if not education_entries and section_lines is None:
            for line in text.split("\n"):
                for deg in degrees:
                    if deg.lower() in line.lower():
                        education_entries.append({
                            "degree": deg,
                            "details": line.strip()
                        })
                        break

        seen = set()
        unique_entries = []
        for entry in education_entries:
            if entry["details"] not in seen:
                seen.add(entry["details"])
                unique_entries.append(entry)

        return unique_entries[:4]

    def extract_projects(self, text, section_lines=None):
        """
        Extracts actual distinct projects by grouping bullet points and descriptions
        under each project's header line, rather than treating each bullet point as a separate project.
        """
        lines_to_check = section_lines if section_lines else []
        
        # If no explicit section was captured, fallback to regex scanning
        if not lines_to_check:
            lines = text.split("\n")
            in_sec = False
            for line in lines:
                l_str = line.strip()
                if re.match(r'^\s*(projects|key projects|academic projects|personal projects)\b[:\s-]*$', l_str, re.IGNORECASE):
                    in_sec = True
                    continue
                elif in_sec and re.match(r'^\s*(experience|education|skills|certifications|awards|involvement|accomplishments)\b[:\s-]*$', l_str, re.IGNORECASE):
                    break
                if in_sec and l_str:
                    lines_to_check.append(l_str)

        projects = []
        current_proj = None

        for line in lines_to_check:
            clean = line.strip()
            if not clean:
                continue

            is_bullet = clean.startswith(self.BULLET_CHARS)
            is_date = bool(re.match(self.DATE_PATTERN, clean, re.IGNORECASE)) or clean.isdigit()

            # Determine if this line is a new project title
            is_new_title = False
            if not is_bullet and not is_date:
                if '|' in clean:
                    is_new_title = True
                elif len(clean) < 80 and not clean.endswith('.'):
                    is_new_title = True

            if is_new_title:
                if current_proj:
                    projects.append(current_proj)

                if '|' in clean:
                    parts = clean.split('|', 1)
                    title = parts[0].strip()
                    tech = parts[1].strip()
                else:
                    title = clean
                    tech = ""

                current_proj = {
                    "title": title,
                    "technologies": tech,
                    "bullets": [],
                    "date": ""
                }
            elif is_date and current_proj and not current_proj["date"]:
                current_proj["date"] = clean
            elif current_proj:
                bullet_clean = clean.lstrip('•-*–—\x83\x95▪►‣· ').strip()
                if bullet_clean:
                    current_proj["bullets"].append(bullet_clean)

        if current_proj:
            projects.append(current_proj)

        # Format projects cleanly with description and technologies
        formatted_projects = []
        for p in projects:
            desc_parts = []
            if p["technologies"]:
                desc_parts.append(f"Technologies: {p['technologies']}")
            if p["date"]:
                desc_parts.append(f"({p['date']})")
            if p["bullets"]:
                desc_parts.append(" • " + " • ".join(p["bullets"]))

            full_desc = " ".join(desc_parts) if desc_parts else p["title"]
            formatted_projects.append({
                "title": p["title"],
                "technologies": p["technologies"],
                "description": full_desc
            })

        return formatted_projects

    def extract_certifications(self, text, section_lines=None):
        """
        Extracts genuine certifications from the dedicated section.
        Prevents other sections like 'Campus Involvement' and 'Accomplishments' from leaking in.
        """
        lines_to_check = section_lines if section_lines else []

        # If no explicit section was captured, fallback to regex search bounded by next section
        if not lines_to_check:
            lines = text.split("\n")
            in_sec = False
            for line in lines:
                l_str = line.strip()
                if re.match(r'^\s*(certifications|certificates|professional certifications|credentials)\b[:\s-]*$', l_str, re.IGNORECASE):
                    in_sec = True
                    continue
                elif in_sec and re.match(r'^\s*(experience|education|skills|projects|awards|involvement|accomplishments|activities)\b[:\s-]*$', l_str, re.IGNORECASE):
                    break
                if in_sec and len(l_str) > 4:
                    lines_to_check.append(l_str)

        certs = []
        seen = set()

        for line in lines_to_check:
            clean = line.strip().lstrip('•-*–—\x83\x95▪►‣· ')
            if not clean or len(clean) <= 4:
                continue
            if re.match(self.DATE_PATTERN, clean, re.IGNORECASE) or clean.isdigit():
                continue
            if clean.lower() in seen:
                continue

            seen.add(clean.lower())
            certs.append(clean)

        return certs

    def extract_experience(self, text, section_lines=None):
        """
        Extracts structured work experience / internships, grouping role, company,
        and bullets into clean unified objects.
        """
        lines_to_check = section_lines if section_lines else []

        if not lines_to_check:
            lines = text.split("\n")
            in_sec = False
            for line in lines:
                l_str = line.strip()
                if re.match(r'^\s*(work experience|professional experience|experience|internships)\b[:\s-]*$', l_str, re.IGNORECASE):
                    in_sec = True
                    continue
                elif in_sec and re.match(r'^\s*(education|skills|projects|certifications|awards|involvement|accomplishments)\b[:\s-]*$', l_str, re.IGNORECASE):
                    break
                if in_sec and len(l_str) > 5:
                    lines_to_check.append(l_str)

        experiences = []
        current_exp = None

        for line in lines_to_check:
            clean = line.strip()
            if not clean:
                continue

            is_bullet = clean.startswith(self.BULLET_CHARS)
            is_date = bool(re.match(self.DATE_PATTERN, clean, re.IGNORECASE))

            is_new_title = False
            if not is_bullet and not is_date:
                if len(clean) < 65 and not clean.endswith('.'):
                    if current_exp is None or (current_exp["bullets"] and len(current_exp["bullets"]) > 0):
                        is_new_title = True
                    elif not current_exp.get("company"):
                        current_exp["company"] = clean
                        continue
                    elif not current_exp.get("location"):
                        current_exp["location"] = clean
                        continue

            if is_new_title:
                if current_exp:
                    experiences.append(current_exp)
                current_exp = {
                    "title": clean,
                    "company": "",
                    "location": "",
                    "date": "",
                    "bullets": []
                }
            elif is_date and current_exp and not current_exp["date"]:
                current_exp["date"] = clean
            elif current_exp:
                bullet_clean = clean.lstrip('•-*–—\x83\x95▪►‣· ').strip()
                if bullet_clean:
                    current_exp["bullets"].append(bullet_clean)

        if current_exp:
            experiences.append(current_exp)

        formatted_exp = []
        for exp in experiences:
            full_title = exp["title"]
            if exp["company"]:
                full_title += f" at {exp['company']}"
            
            desc_parts = []
            if exp["date"]:
                desc_parts.append(f"({exp['date']})")
            if exp["location"]:
                desc_parts.append(exp["location"])
            if exp["bullets"]:
                desc_parts.append(" • " + " • ".join(exp["bullets"]))

            formatted_exp.append({
                "title": full_title,
                "company": exp["company"],
                "duration": exp["date"],
                "description": " ".join(desc_parts) if desc_parts else full_title
            })

        return formatted_exp
