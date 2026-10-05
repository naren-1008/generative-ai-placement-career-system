import io
import pytest
import fitz
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

def create_sample_pdf():
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Regression Resume Test\nSkills: Python, Flask, React, SQL")
    stream = io.BytesIO()
    doc.save(stream)
    doc.close()
    stream.seek(0)
    return stream

def test_jwt_authentication_regression_flow(client):
    """
    Regression Test Verifying:
    1. Login returns a valid JWT.
    2. The same JWT can successfully authenticate a protected endpoint.
    3. The authenticated JWT can successfully call /api/resume/parse.
    4. A request without a JWT still receives 401.
    5. A request with an invalid JWT still receives 401.
    """
    email = "regression_user@college.edu"
    password = "RegressionPassword123"

    # Step 0: Register user
    reg_res = client.post('/api/auth/register', json={
        "email": email,
        "password": password,
        "confirm_password": password
    })
    assert reg_res.status_code == 201

    # 1. Login returns a valid JWT
    login_res = client.post('/api/auth/login', json={
        "email": email,
        "password": password
    })
    assert login_res.status_code == 200
    token = login_res.get_json().get("token")
    assert token is not None
    assert isinstance(token, str) and len(token) > 20

    # 2. The same JWT can successfully authenticate a protected endpoint (/api/auth/me)
    me_res = client.get('/api/auth/me', headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.get_json()["user"]["email"] == email

    # 3. The authenticated JWT can successfully call /api/resume/parse
    pdf_bytes = create_sample_pdf()
    parse_res = client.post(
        '/api/resume/parse',
        data={'resume': (pdf_bytes, 'resume.pdf')},
        content_type='multipart/form-data',
        headers={"Authorization": f"Bearer {token}"}
    )
    assert parse_res.status_code == 200
    assert parse_res.get_json()["status"] == "success"
    assert "Python" in parse_res.get_json()["data"]["skills"]

    # 4. A request without a JWT still receives 401
    pdf_bytes_no_token = create_sample_pdf()
    no_jwt_res = client.post(
        '/api/resume/parse',
        data={'resume': (pdf_bytes_no_token, 'resume.pdf')},
        content_type='multipart/form-data'
    )
    assert no_jwt_res.status_code == 401

    # 5. A request with an invalid JWT still receives 401
    pdf_bytes_invalid_token = create_sample_pdf()
    invalid_jwt_res = client.post(
        '/api/resume/parse',
        data={'resume': (pdf_bytes_invalid_token, 'resume.pdf')},
        content_type='multipart/form-data',
        headers={"Authorization": "Bearer invalid_fake_jwt_token_12345"}
    )
    assert invalid_jwt_res.status_code == 401
