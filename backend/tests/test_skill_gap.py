import pytest
from app import create_app
from app.models.user_model import UserModel
from app.models.student_model import StudentModel
from app.services.skill_gap import SkillGapService

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            UserModel.clear_in_memory_store()
            StudentModel.clear_in_memory_store()
        yield client

@pytest.fixture
def auth_header(client):
    reg = client.post('/api/auth/register', json={
        "email": "skillgap_user@college.edu",
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    token = reg.get_json()['token']
    return {"Authorization": f"Bearer {token}"}

def test_unauthenticated_skill_gap_rejection(client):
    """Verifies that calling /api/skill-gap/analyze without JWT token returns HTTP 401."""
    res = client.post('/api/skill-gap/analyze', json={"role_id": "ROLE_BACKEND_DEV"})
    assert res.status_code == 401
    assert 'Authentication token is missing' in res.get_json()['message']

def test_authenticated_skill_gap_analysis(client, auth_header):
    """Verifies authenticated skill gap analysis using confirmed student skills."""
    # First save confirmed M1 profile with skills
    confirm_res = client.post('/api/resume/confirm-profile', json={
        "parsed_profile": {
            "skills": ["Python", "Flask", "SQL", "Git", "REST APIs"],
            "education": [{"degree": "B.Tech"}]
        }
    }, headers=auth_header)
    assert confirm_res.status_code == 200

    # Perform Skill-Gap Analysis against ROLE_BACKEND_DEV
    analyze_res = client.post('/api/skill-gap/analyze', json={"role_id": "ROLE_BACKEND_DEV"}, headers=auth_header)
    assert analyze_res.status_code == 200
    
    data = analyze_res.get_json()['data']
    assert data['role_id'] == 'ROLE_BACKEND_DEV'
    assert 'Python' in data['matched_skills'] or 'Python' in data['matched_core_skills']
    assert 'skill_match_percentage' in data
    assert 'skill_gap_percentage' in data
    assert round(data['skill_match_percentage'] + data['skill_gap_percentage'], 1) == 100.0

def test_skill_gap_weighted_calculation(client):
    """Verifies SkillGapService calculation formula (Core 60%, Secondary 30%, Soft 10%)."""
    mock_career = {
        "role_id": "test_role",
        "title": "Test Role",
        "category": "Software Engineering",
        "required_skills": {
            "core": ["Python", "Flask"],
            "secondary": ["Docker", "Git"],
            "soft_skills": ["Communication"]
        }
    }

    # Case 1: All skills matched -> 100% Match, 0% Gap
    student_skills_all = ["Python", "Flask", "Docker", "Git", "Communication"]
    res_all = SkillGapService.analyze_gap(student_skills_all, mock_career)
    assert res_all['skill_match_percentage'] == 100.0
    assert res_all['skill_gap_percentage'] == 0.0
    assert len(res_all['missing_core_skills']) == 0

    # Case 2: Partial skills matched (1/2 Core = 30%, 1/2 Secondary = 15%, 0/1 Soft = 0% -> 45% Match, 55% Gap)
    student_skills_partial = ["Python", "Docker"]
    res_partial = SkillGapService.analyze_gap(student_skills_partial, mock_career)
    assert res_partial['skill_match_percentage'] == 45.0
    assert res_partial['skill_gap_percentage'] == 55.0
    assert 'Flask' in res_partial['missing_core_skills']
    assert 'Git' in res_partial['missing_secondary_skills']

def test_empty_student_skills_handling(client, auth_header):
    """Verifies graceful handling when student profile has zero skills."""
    res = client.post('/api/skill-gap/analyze', json={"role_id": "ROLE_DATA_SCIENTIST"}, headers=auth_header)
    assert res.status_code == 200
    data = res.get_json()['data']
    assert data['skill_match_percentage'] == 0.0
    assert data['skill_gap_percentage'] == 100.0
    assert len(data['matched_skills']) == 0

def test_dynamic_skills_produce_different_results(client, auth_header):
    """Verifies that changing student skills produces different analysis results."""
    # Profile 1: Web Dev skills
    client.post('/api/resume/confirm-profile', json={
        "parsed_profile": {"skills": ["HTML", "CSS", "JavaScript", "React"]}
    }, headers=auth_header)
    res_web = client.post('/api/skill-gap/analyze', json={"role_id": "ROLE_BACKEND_DEV"}, headers=auth_header)
    score_web = res_web.get_json()['data']['skill_match_percentage']

    # Profile 2: Add Backend skills
    client.post('/api/resume/confirm-profile', json={
        "parsed_profile": {"skills": ["Python", "Flask", "SQL", "PostgreSQL", "REST APIs", "Docker"]}
    }, headers=auth_header)
    res_backend = client.post('/api/skill-gap/analyze', json={"role_id": "ROLE_BACKEND_DEV"}, headers=auth_header)
    score_backend = res_backend.get_json()['data']['skill_match_percentage']

    assert score_backend > score_web
