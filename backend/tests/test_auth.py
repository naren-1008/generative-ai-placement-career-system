import pytest
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

def test_user_registration(client):
    """Verifies successful user registration, password hashing, and token issue."""
    payload = {
        "email": "newstudent@college.edu",
        "password": "SecurePassword123",
        "confirm_password": "SecurePassword123"
    }
    res = client.post('/api/auth/register', json=payload)
    assert res.status_code == 201
    data = res.get_json()
    assert data['status'] == 'success'
    assert 'token' in data
    assert data['user']['email'] == 'newstudent@college.edu'
    # Ensure password_hash is NEVER exposed in API user object
    assert 'password_hash' not in data['user']

def test_duplicate_registration(client):
    """Verifies 409 error code on registering existing email."""
    payload = {
        "email": "duplicate@college.edu",
        "password": "Password123",
        "confirm_password": "Password123"
    }
    res1 = client.post('/api/auth/register', json=payload)
    assert res1.status_code == 201

    res2 = client.post('/api/auth/register', json=payload)
    assert res2.status_code == 409
    data = res2.get_json()
    assert 'already exists' in data['message']

def test_password_hashing(client):
    """Verifies password is never stored plain text and is verified using scrypt hash."""
    raw_pass = "MySecretPass99"
    user_doc = UserModel.create_user("hash_test@college.edu", raw_pass)
    stored = UserModel.find_by_email("hash_test@college.edu")
    
    assert stored['password_hash'] != raw_pass
    assert stored['password_hash'].startswith("scrypt:") or len(stored['password_hash']) > 20
    assert UserModel.verify_password(stored['password_hash'], raw_pass) is True
    assert UserModel.verify_password(stored['password_hash'], "WrongPass") is False

def test_user_login_success(client):
    """Verifies successful login returning token and linked student profile."""
    reg_payload = {
        "email": "loginstudent@college.edu",
        "password": "LoginPass123",
        "confirm_password": "LoginPass123"
    }
    client.post('/api/auth/register', json=reg_payload)

    login_payload = {
        "email": "loginstudent@college.edu",
        "password": "LoginPass123"
    }
    res = client.post('/api/auth/login', json=login_payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'success'
    assert 'token' in data
    assert data['student_profile'] is not None

def test_user_login_invalid_password(client):
    """Verifies 401 error code on wrong password."""
    reg_payload = {
        "email": "wrongpass_user@college.edu",
        "password": "CorrectPassword123",
        "confirm_password": "CorrectPassword123"
    }
    client.post('/api/auth/register', json=reg_payload)

    login_payload = {
        "email": "wrongpass_user@college.edu",
        "password": "WrongPassword"
    }
    res = client.post('/api/auth/login', json=login_payload)
    assert res.status_code == 401

def test_user_login_nonexistent_email(client):
    """Verifies 401 error code on non-existent email."""
    login_payload = {
        "email": "nonexistent@college.edu",
        "password": "SomePassword"
    }
    res = client.post('/api/auth/login', json=login_payload)
    assert res.status_code == 401

def test_protected_route_access(client):
    """Verifies 401 when token missing/invalid, and 200 when Bearer token is provided."""
    # 1. Unauthenticated request -> 401
    res_unauth = client.get('/api/auth/me')
    assert res_unauth.status_code == 401

    # 2. Register & fetch token
    reg = client.post('/api/auth/register', json={
        "email": "protected_user@college.edu",
        "password": "Pass123Password",
        "confirm_password": "Pass123Password"
    })
    token = reg.get_json()['token']

    # 3. Authenticated request with Bearer header -> 200
    res_auth = client.get('/api/auth/me', headers={"Authorization": f"Bearer {token}"})
    assert res_auth.status_code == 200
    data = res_auth.get_json()
    assert data['user']['email'] == "protected_user@college.edu"
    assert data['student_profile'] is not None
