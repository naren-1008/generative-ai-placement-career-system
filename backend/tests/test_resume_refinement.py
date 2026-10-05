import pytest
from app.services.nlp_extractor import NLPExtractorService

@pytest.fixture
def extractor():
    return NLPExtractorService()

def test_realistic_student_resume_parsing(extractor):
    """
    Tests NLPExtractorService on a realistic student resume containing all 5 key sections:
    Education, Skills, Projects, Certifications, and Experience.
    """
    sample_resume_text = """
    Alex Morgan
    Email: alex.morgan@university.edu
    Phone: +91 9876543210
    GitHub: https://github.com/alexmorgan
    LinkedIn: https://linkedin.com/in/alexmorgan

    Education
    B.Tech Computer Science & Engineering, Institute of Tech, CGPA 8.7

    Skills
    Python, py, Flask, JavaScript, JS, React, react.js, MongoDB, Mongo, SQL, Git, REST APIs, Problem Solving

    Experience
    Software Development Intern at Tech Solutions Inc.
    Developed scalable REST APIs using Python and Flask.

    Projects
    Intelligent Placement & Career Recommendation System
    Engineered Flask REST API backend and React Vite frontend.

    Certifications
    AWS Certified Cloud Practitioner
    Python for Data Science - Coursera
    """

    res = extractor.extract_all(sample_resume_text)

    # 1. Contact Info
    assert res['contact_info']['email'] == 'alex.morgan@university.edu'
    assert res['contact_info']['phone'] == '+91 9876543210'

    # 2. Skill Normalization & Deduplication (aliases mapped to canonical names)
    skills = res['skills']
    assert 'Python' in skills
    assert 'JavaScript' in skills
    assert 'React' in skills
    assert 'MongoDB' in skills
    # Check deduplication: raw text had 'python' & 'py', 'react' & 'react.js', but output contains single canonical entries
    assert len(skills) == len(set(skills))

    # 3. Education Extraction
    assert len(res['education']) > 0
    assert res['education'][0]['degree'] == 'B.Tech'

    # 4. Project Extraction
    assert len(res['projects']) > 0
    assert 'Intelligent Placement' in res['projects'][0]['title']

    # 5. Certification Extraction
    assert len(res['certifications']) >= 2
    assert any('AWS Certified' in c for c in res['certifications'])
    assert any('Python for Data Science' in c for c in res['certifications'])

    # 6. Experience Extraction
    assert len(res['experience']) > 0
    assert 'Software Development Intern' in res['experience'][0]['title']


def test_missing_sections_graceful_handling(extractor):
    """
    Verifies that missing sections return empty lists rather than crashing.
    """
    minimal_resume_text = """
    Jane Student
    Email: jane@test.com
    Skills: Python, SQL
    """

    res = extractor.extract_all(minimal_resume_text)
    assert res['skills'] == ['Python', 'SQL']
    assert res['education'] == []
    assert res['projects'] == []
    assert res['certifications'] == []
    assert res['experience'] == []


def test_duplicate_skills_normalization(extractor):
    """
    Verifies boundary-aware skill matching and canonical deduplication.
    """
    text_with_duplicates = "Skilled in Python, python, PY, python3, React, react.js, REACT, Docker, docker"
    skills = extractor.extract_skills(text_with_duplicates)
    
    assert skills == ['Docker', 'Python', 'React']
    assert len(skills) == 3
