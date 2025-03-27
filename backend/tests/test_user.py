import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
def test_user_endpoint(client):
    User.objects.create_user(id="1", username="test1", password="123")
    User.objects.create_user(id="2", username="test2", password="456")

    url = reverse("test-user")
    response = client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 2
    assert response.data[0]["username"] == "test1"
    assert response.data[1]["username"] == "test2"
