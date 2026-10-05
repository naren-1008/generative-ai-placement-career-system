from app.services.skill_gap import SkillGapService

# Centralized Scoring Weights Configuration fallback if Config not loaded
DEFAULT_WEIGHTS = {
    "SKILL_MATCH_MAX": 70.0,
    "ACADEMIC_ELIGIBILITY_MAX": 15.0,
    "INTEREST_ALIGNMENT_MAX": 10.0,
    "PROJECT_CERT_RELEVANCE_MAX": 5.0
}

class RecommendationEngineService:
    @staticmethod
    def get_weights():
        try:
            from app.config import Config
            return getattr(Config, "RECOMMENDATION_WEIGHTS", DEFAULT_WEIGHTS)
        except Exception:
            return DEFAULT_WEIGHTS

    @staticmethod
    def recommend_careers(student_profile, available_careers):
        """
        Calculates normalized recommendation suitability scores (0 - 100 points) across active career roles.
        Weights:
          - Skill Match: 70%
          - Academic Eligibility: 15%
          - Interest Alignment: 10%
          - Project & Certification Relevance: 5%
        """
        if not student_profile or not available_careers:
            return []

        weights = RecommendationEngineService.get_weights()

        parsed_profile = student_profile.get("parsed_profile", {})
        student_skills = parsed_profile.get("skills", [])
        if not student_skills:
            student_skills = student_profile.get("skills", [])

        projects = parsed_profile.get("projects", [])
        certifications = parsed_profile.get("certifications", [])

        academic_info = student_profile.get("academic_info", {})
        cgpa = float(academic_info.get("cgpa", 0.0))
        branch = academic_info.get("branch", "").lower()
        interests = [i.lower() for i in student_profile.get("interests", [])]

        recommendations = []

        for career in available_careers:
            reasons = []

            # 1. Skill Match Component (Max 70 points)
            gap_analysis = SkillGapService.analyze_gap(student_skills, career)
            raw_skill_pct = gap_analysis.get("match_percentage", 0.0)
            skill_score = round((raw_skill_pct / 100.0) * weights["SKILL_MATCH_MAX"], 2)
            reasons.append(f"Skill Match: {skill_score:.1f}/70 pts ({raw_skill_pct}% match)")

            # 2. Academic Relevance / Eligibility Component (Max 15 points)
            eligibility = career.get("academic_eligibility", {})
            min_cgpa = float(eligibility.get("min_cgpa", 0.0))
            allowed_branches = [b.lower() for b in eligibility.get("allowed_branches", [])]

            cgpa_passed = cgpa >= min_cgpa
            branch_passed = False
            if not allowed_branches or "any branch" in allowed_branches:
                branch_passed = True
            else:
                branch_passed = any(b in branch or branch in b for b in allowed_branches)

            if cgpa_passed and branch_passed:
                academic_score = weights["ACADEMIC_ELIGIBILITY_MAX"]  # 15.0 pts
                reasons.append(f"Academic Relevance: {academic_score:.1f}/15 pts (Meets CGPA {cgpa}>={min_cgpa} & Branch aligned)")
            elif cgpa_passed:
                academic_score = 10.0
                reasons.append(f"Academic Relevance: {academic_score:.1f}/15 pts (Meets CGPA {cgpa}>={min_cgpa})")
            elif branch_passed:
                academic_score = 7.5
                reasons.append(f"Academic Relevance: {academic_score:.1f}/15 pts (Branch aligned, CGPA below {min_cgpa})")
            else:
                academic_score = 0.0
                reasons.append(f"Academic Relevance: 0.0/15 pts (CGPA {cgpa} below benchmark {min_cgpa})")

            # 3. Interest Alignment Component (Max 10 points)
            role_title_lower = career.get("title", "").lower()
            category_lower = career.get("category", "").lower()
            domain_lower = career.get("domain", "").lower()
            
            interest_match = any(
                i in role_title_lower or i in category_lower or i in domain_lower
                for i in interests
            )
            
            if interest_match:
                interest_score = weights["INTEREST_ALIGNMENT_MAX"]  # 10.0 pts
                reasons.append(f"Interest Alignment: {interest_score:.1f}/10 pts (Matches student domain interest)")
            else:
                interest_score = 0.0
                reasons.append("Interest Alignment: 0.0/10 pts (No direct domain interest match)")

            # 4. Project & Certification Relevance Component (Max 5 points)
            target_skills_lower = set(s.lower() for s in career.get("required_skills", {}).get("core", []))
            
            has_relevant_proj_or_cert = False
            for proj in projects:
                title_desc = (proj.get("title", "") + " " + proj.get("description", "")).lower()
                if any(sk in title_desc for sk in target_skills_lower) or role_title_lower in title_desc:
                    has_relevant_proj_or_cert = True
                    break
            if not has_relevant_proj_or_cert:
                for cert in certifications:
                    cert_lower = str(cert).lower()
                    if any(sk in cert_lower for sk in target_skills_lower) or role_title_lower in cert_lower:
                        has_relevant_proj_or_cert = True
                        break

            if has_relevant_proj_or_cert:
                project_cert_score = weights["PROJECT_CERT_RELEVANCE_MAX"]  # 5.0 pts
                reasons.append(f"Project & Cert Relevance: {project_cert_score:.1f}/5 pts (Domain-relevant projects/certs found)")
            elif len(projects) > 0 or len(certifications) > 0:
                project_cert_score = 2.5
                reasons.append(f"Project & Cert Relevance: {project_cert_score:.1f}/5 pts (General projects/certs present)")
            else:
                project_cert_score = 0.0
                reasons.append("Project & Cert Relevance: 0.0/5 pts (No projects or certifications listed)")

            # Final Composite Suitability Score (Always strictly between 0 and 100)
            raw_total = skill_score + academic_score + interest_score + project_cert_score
            composite_score = round(min(100.0, max(0.0, raw_total)), 1)

            recommendations.append({
                "role_id": career.get("role_id"),
                "title": career.get("title"),
                "category": career.get("category"),
                "domain": career.get("domain"),
                "suitability_score": composite_score,
                "skill_match_percentage": raw_skill_pct,
                "score_components": {
                    "skill_score": skill_score,
                    "academic_score": academic_score,
                    "interest_score": interest_score,
                    "project_cert_score": project_cert_score
                },
                "demand_level": career.get("demand_level", "High"),
                "matched_skills_count": len(gap_analysis["matched_skills"]),
                "missing_core_skills_count": len(gap_analysis["missing_core_skills"]),
                "reasons": reasons,
                "skill_gap_details": gap_analysis
            })

        # Sort recommendations descending by final suitability score
        recommendations.sort(key=lambda x: x["suitability_score"], reverse=True)
        return recommendations
