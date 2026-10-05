import pytest
from app import create_app
from app.services.nlp_extractor import NLPExtractorService
from app.services.skill_gap import SkillGapService
from app.services.recommender import RecommendationEngineService
from app.config import Config

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    res = client.get('/api/health')
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data['status'] == 'healthy'

def test_nlp_extraction():
    extractor = NLPExtractorService()
    sample_text = """
    Jane Student
    Email: jane.student@example.com
    Phone: +91 9876543210
    GitHub: https://github.com/janestudent
    Education: B.Tech Computer Science Engineering CGPA 8.8
    Skills: Python, Flask, React, JavaScript, MongoDB, Git, SQL
    """
    result = extractor.extract_all(sample_text)
    assert result['contact_info']['email'] == 'jane.student@example.com'
    assert 'Python' in result['skills']
    assert 'React' in result['skills']
    assert 'MongoDB' in result['skills']

def test_skill_gap_analysis():
    student_skills = ["Python", "Flask", "MongoDB", "Git"]
    target_career = {
        "role_id": "ROLE_BACKEND_DEV",
        "title": "Backend Developer",
        "category": "Software Engineering",
        "required_skills": {
            "core": ["Python", "REST APIs", "SQL", "MongoDB", "Git"],
            "secondary": ["Docker", "Redis"],
            "soft_skills": ["Problem Solving"]
        }
    }
    gap = SkillGapService.analyze_gap(student_skills, target_career)
    assert gap['match_percentage'] > 0
    assert "Python" in gap['matched_core_skills']
    assert "REST APIs" in gap['missing_core_skills']

def test_recommendation_engine():
    student_profile = {
        "academic_info": {"cgpa": 8.5, "branch": "Computer Science"},
        "parsed_profile": {"skills": ["Python", "Flask", "React", "JavaScript", "MongoDB", "Git"]},
        "interests": ["Backend Development"]
    }
    careers = [
        {
            "role_id": "ROLE_BACKEND_DEV",
            "title": "Backend Developer",
            "category": "Software Engineering",
            "required_skills": {"core": ["Python", "Flask", "MongoDB"], "secondary": ["Docker"], "soft_skills": []},
            "academic_eligibility": {"min_cgpa": 6.0, "allowed_branches": ["Computer Science"]}
        }
    ]
    recommendations = RecommendationEngineService.recommend_careers(student_profile, careers)
    assert len(recommendations) == 1
    score = recommendations[0]['suitability_score']
    assert 0.0 <= score <= 100.0

def test_recommendation_score_cannot_exceed_100():
    """Verifies that even with a perfect profile across all 4 factors, suitability_score <= 100.0."""
    perfect_student = {
        "academic_info": {"cgpa": 9.5, "branch": "Computer Science"},
        "parsed_profile": {
            "skills": ["Python", "Flask", "MongoDB", "Docker", "Problem Solving"],
            "projects": [{"title": "Backend Development API", "description": "Built Python Flask microservices"}],
            "certifications": ["Python Backend Specialist"]
        },
        "interests": ["Backend Developer", "Software Engineering"]
    }
    career_role = {
        "role_id": "ROLE_BACKEND_DEV",
        "title": "Backend Developer",
        "category": "Software Engineering",
        "domain": "Backend Development",
        "required_skills": {
            "core": ["Python", "Flask", "MongoDB"],
            "secondary": ["Docker"],
            "soft_skills": ["Problem Solving"]
        },
        "academic_eligibility": {"min_cgpa": 7.0, "allowed_branches": ["Computer Science"]}
    }

    recs = RecommendationEngineService.recommend_careers(perfect_student, [career_role])
    assert len(recs) == 1
    suitability_score = recs[0]['suitability_score']
    
    # Assert score is exactly capped/equal to 100.0 and never exceeds 100.0
    assert suitability_score == 100.0
    assert suitability_score <= 100.0

    # Verify score components sum to 100.0
    comps = recs[0]['score_components']
    assert comps['skill_score'] == 70.0
    assert comps['academic_score'] == 15.0
    assert comps['interest_score'] == 10.0
    assert comps['project_cert_score'] == 5.0
