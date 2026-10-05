import os
import io
import pytest
import fitz  # PyMuPDF
import docx
from app import create_app
from app.models.user_model import UserModel
from app.models.student_model import StudentModel

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
        "email": "resume_test_user@college.edu",
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    token = reg.get_json()['token']
    return {"Authorization": f"Bearer {token}"}

def create_sample_pdf_bytes():
    """Generates a small PDF file in memory containing sample resume text."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Jane Resume PDF\nEmail: jane.pdf@college.edu\nSkills: Python, Flask, React, MongoDB, Git\nEducation: B.Tech CSE CGPA 8.7\nProjects: Cloud AI Platform")
    pdf_stream = io.BytesIO()
    doc.save(pdf_stream)
    doc.close()
    pdf_stream.seek(0)
    return pdf_stream

def create_sample_docx_bytes():
    """Generates a small DOCX file in memory containing sample resume text."""
    doc = docx.Document()
    doc.add_paragraph("John Resume DOCX")
    doc.add_paragraph("Email: john.docx@college.edu")
    doc.add_paragraph("Skills: Java, TypeScript, SQL, Docker, Python")
    doc.add_paragraph("Education: B.Tech Computer Science 2025")
    
    docx_stream = io.BytesIO()
    doc.save(docx_stream)
    docx_stream.seek(0)
    return docx_stream

def test_unauthenticated_resume_upload_rejection(client):
    """Verifies that uploading a resume without JWT token returns HTTP 401 Unauthorized."""
    pdf_file = create_sample_pdf_bytes()
    data = {'resume': (pdf_file, 'test.pdf')}
    res = client.post('/api/resume/parse', data=data, content_type='multipart/form-data')
    assert res.status_code == 401
    assert 'Authentication token is missing' in res.get_json()['message']

def test_authenticated_pdf_resume_parse(client, auth_header):
    """Verifies PDF extraction and skill parsing for authenticated user."""
    pdf_file = create_sample_pdf_bytes()
    data = {'resume': (pdf_file, 'sample_resume.pdf')}
    res = client.post('/api/resume/parse', data=data, content_type='multipart/form-data', headers=auth_header)
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data['status'] == 'success'
    assert 'Python' in json_data['data']['skills']
    assert 'Flask' in json_data['data']['skills']

def test_authenticated_docx_resume_parse(client, auth_header):
    """Verifies DOCX extraction and skill parsing for authenticated user."""
    docx_file = create_sample_docx_bytes()
    data = {'resume': (docx_file, 'sample_resume.docx')}
    res = client.post('/api/resume/parse', data=data, content_type='multipart/form-data', headers=auth_header)
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data['status'] == 'success'
    assert 'Java' in json_data['data']['skills']
    assert 'Docker' in json_data['data']['skills']

def test_unsupported_file_format_rejection(client, auth_header):
    """Verifies 400 error when uploading an invalid file format (e.g. .txt)."""
    fake_txt = io.BytesIO(b"Hello text resume")
    data = {'resume': (fake_txt, 'resume.txt')}
    res = client.post('/api/resume/parse', data=data, content_type='multipart/form-data', headers=auth_header)
    assert res.status_code == 400
    assert 'Unsupported file format' in res.get_json()['message']

def test_authenticated_profile_confirmation_and_merging(client, auth_header):
    """Verifies that confirming extracted profile merges data without creating duplicate student records."""
    confirm_payload = {
        "parsed_profile": {
            "skills": ["Python", "Flask", "Docker"],
            "education": [{"degree": "B.Tech CSE"}],
            "projects": [{"title": "Placement Portal", "description": "Built AI recommendation system"}]
        },
        "contact_info": {
          "phone": "+91 9876543210",
          "github": "https://github.com/resumetest"
        }
    }

    res = client.post('/api/resume/confirm-profile', json=confirm_payload, headers=auth_header)
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'success'
    
    student_profile = data['data']
    assert 'Python' in student_profile['parsed_profile']['skills']
    assert student_profile['personal_info']['phone'] == "+91 9876543210"
