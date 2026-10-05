class SkillGapService:
    @staticmethod
    def _normalize_skill(skill, nlp_service=None):
        """Normalizes skill name using taxonomy alias dictionary if available."""
        s_clean = skill.strip()
        if not nlp_service or not hasattr(nlp_service, 'taxonomy'):
            return s_clean.lower()
        
        s_lower = s_clean.lower()
        for category, skill_dict in nlp_service.taxonomy.items():
            for canonical_name, aliases in skill_dict.items():
                for alias in aliases:
                    if alias.lower() == s_lower:
                        return canonical_name.lower()
        return s_lower

    @classmethod
    def analyze_gap(cls, student_skills, target_career, nlp_service=None):
        """
        Compares student's confirmed M1 skills against target career role requirements.
        Calculates Skill Match %, Skill Gap %, matched and missing skill breakdown.
        """
        if not target_career or "required_skills" not in target_career:
            return {
                "error": "Invalid target career role provided",
                "skill_match_percentage": 0.0,
                "skill_gap_percentage": 100.0,
                "matched_skills": [],
                "missing_core_skills": [],
                "missing_secondary_skills": [],
                "missing_soft_skills": [],
                "extra_skills": []
            }

        # Normalize student skills set
        normalized_student_skills = set(cls._normalize_skill(s, nlp_service) for s in student_skills)

        req_skills = target_career.get("required_skills", {})
        core_req = req_skills.get("core", [])
        sec_req = req_skills.get("secondary", [])
        soft_req = req_skills.get("soft_skills", [])

        # Match Core Skills
        matched_core = []
        missing_core = []
        for s in core_req:
            s_norm = cls._normalize_skill(s, nlp_service)
            if s_norm in normalized_student_skills:
                matched_core.append(s)
            else:
                missing_core.append(s)

        # Match Secondary Skills
        matched_sec = []
        missing_sec = []
        for s in sec_req:
            s_norm = cls._normalize_skill(s, nlp_service)
            if s_norm in normalized_student_skills:
                matched_sec.append(s)
            else:
                missing_sec.append(s)

        # Match Soft Skills
        matched_soft = []
        missing_soft = []
        for s in soft_req:
            s_norm = cls._normalize_skill(s, nlp_service)
            if s_norm in normalized_student_skills:
                matched_soft.append(s)
            else:
                missing_soft.append(s)

        # Identify complementary/extra student skills
        all_req_norm = set(cls._normalize_skill(s, nlp_service) for s in (core_req + sec_req + soft_req))
        extra_skills = [s for s in student_skills if cls._normalize_skill(s, nlp_service) not in all_req_norm]

        # Calculate weighted Skill Match % (Core: 60%, Secondary: 30%, Soft: 10%)
        core_score = (len(matched_core) / len(core_req) * 60.0) if core_req else 60.0
        sec_score = (len(matched_sec) / len(sec_req) * 30.0) if sec_req else 30.0
        soft_score = (len(matched_soft) / len(soft_req) * 10.0) if soft_req else 10.0

        match_percentage = round(min(100.0, core_score + sec_score + soft_score), 1)
        skill_gap_percentage = round(max(0.0, 100.0 - match_percentage), 1)

        all_matched = matched_core + matched_sec + matched_soft

        return {
            "role_id": target_career.get("role_id"),
            "role_title": target_career.get("title"),
            "category": target_career.get("category"),
            "skill_match_percentage": match_percentage,
            "skill_gap_percentage": skill_gap_percentage,
            "match_percentage": match_percentage,
            "matched_skills": all_matched,
            "matched_core_skills": matched_core,
            "missing_core_skills": missing_core,
            "matched_secondary_skills": matched_sec,
            "missing_secondary_skills": missing_sec,
            "matched_soft_skills": matched_soft,
            "missing_soft_skills": missing_soft,
            "extra_skills": extra_skills,
            "breakdown_scores": {
                "core_score": round(core_score, 1),
                "secondary_score": round(sec_score, 1),
                "soft_score": round(soft_score, 1)
            },
            "readiness_summary": cls._get_summary(match_percentage, len(missing_core))
        }

    @staticmethod
    def _get_summary(match_pct, missing_core_count):
        if match_pct >= 80.0 and missing_core_count == 0:
            return "Excellent match! You possess almost all key requirements for this role."
        elif match_pct >= 60.0:
            return "Good match. Acquiring 1-2 key missing core skills will significantly boost your readiness."
        elif match_pct >= 40.0:
            return "Moderate match. Focus on fundamental core skills before applying for this role."
        else:
            return "High skill gap. Consider foundational courses in this domain to build prerequisite knowledge."
