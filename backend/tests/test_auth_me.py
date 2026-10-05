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

def test_auth_me_no_token(client):
    """Verifies that requesting /api/auth/me without a token returns 401."""
    res = client.get('/api/auth/me')
    assert res.status_code == 401
    assert 'token is missing' in res.get_json()['message']

def test_auth_me_valid_token(client):
    """Verifies that requesting /api/auth/me with a valid JWT token returns 200 and user data."""
    reg = client.post('/api/auth/register', json={
        "email": "session_valid@college.edu",
        "password": "ValidPassword123",
        "confirm_password": "ValidPassword123"
    })
    token = reg.get_json()['token']

    res = client.get('/api/auth/me', headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'success'
    assert data['user']['email'] == 'session_valid@college.edu'
    assert data['student_profile'] is not None

def test_auth_me_invalid_token(client):
    """Verifies that requesting /api/auth/me with an invalid JWT returns 401."""
    res = client.get('/api/auth/me', headers={"Authorization": "Bearer fake_invalid_jwt"})
    assert res.status_code == 401
    assert 'Invalid or expired token' in res.get_json()['message']

def test_auth_me_token_user_no_longer_exists(client):
    """Verifies that a JWT for a user ID no longer in the DB/store returns 401."""
    # Generate a valid token signed with SECRET_KEY for a non-existent user_id
    from flask import current_app
    import jwt, datetime
    
    with client.application.app_context():
        secret = current_app.config['SECRET_KEY']
        payload = {
            "user_id": "non_existent_user_999",
            "email": "deleted@college.edu",
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1)
        }
        orphan_token = jwt.encode(payload, secret, algorithm="HS256")

    res = client.get('/api/auth/me', headers={"Authorization": f"Bearer {orphan_token}"})
    assert res.status_code == 401
    assert 'no longer exists' in res.get_json()['message']
