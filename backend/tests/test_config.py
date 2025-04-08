from django.conf import settings


class TestSettings:
    # def test_security_settings(self):
    #     assert hasattr(settings, "SECRET_KEY")

    #     assert isinstance(settings.SECRET_KEY, str)
    #     assert len(settings.SECRET_KEY) >= 50

    def test_debug_mode(self):
        assert isinstance(settings.DEBUG, bool)
        if settings.DEBUG:
            assert settings.ALLOWED_HOSTS == ["*"]

    def test_installed_apps(self):
        required_apps = [
            "django.contrib.admin",
            "django.contrib.auth",
            "django.contrib.contenttypes",
            "django.contrib.sessions",
            "django.contrib.messages",
            "django.contrib.staticfiles",
            "rest_framework",
            "drf_spectacular",
        ]
        for app in required_apps:
            assert app in settings.INSTALLED_APPS

    def test_middleware(self):
        required_middleware = [
            "django.middleware.security.SecurityMiddleware",
            "django.contrib.sessions.middleware.SessionMiddleware",
            "django.middleware.common.CommonMiddleware",
            "django.middleware.csrf.CsrfViewMiddleware",
            "django.contrib.auth.middleware.AuthenticationMiddleware",
            "django.contrib.messages.middleware.MessageMiddleware",
            "django.middleware.clickjacking.XFrameOptionsMiddleware",
            "corsheaders.middleware.CorsMiddleware",
        ]
        for mw in required_middleware:
            assert mw in settings.MIDDLEWARE


class TestRestFrameworkSettings:
    def test_drf_config(self):
        assert hasattr(settings, "REST_FRAMEWORK")
        assert "DEFAULT_SCHEMA_CLASS" in settings.REST_FRAMEWORK
        assert (
            settings.REST_FRAMEWORK["DEFAULT_SCHEMA_CLASS"]
            == "drf_spectacular.openapi.AutoSchema"
        )

    def test_spectacular_config(self):
        assert hasattr(settings, "SPECTACULAR_SETTINGS")
        assert settings.SPECTACULAR_SETTINGS["TITLE"] == "Project API"
        assert (
            settings.SPECTACULAR_SETTINGS["DESCRIPTION"] == "API documentation for Jira"
        )
        assert settings.SPECTACULAR_SETTINGS["VERSION"] == "1.0.0"
        assert settings.SPECTACULAR_SETTINGS["SWAGGER_UI_DIST"] == "SIDECAR"


class TestStaticFilesSettings:
    def test_static_config(self):
        assert settings.STATIC_URL == "/static/"
        assert settings.STATIC_ROOT == "static/"
        assert settings.DEFAULT_AUTO_FIELD == "django.db.models.BigAutoField"


class TestSecuritySettings:

    def test_password_validators(self):
        assert len(settings.AUTH_PASSWORD_VALIDATORS) == 4
        validator_names = [v["NAME"] for v in settings.AUTH_PASSWORD_VALIDATORS]
        assert (
            "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
            in validator_names
        )
        assert (
            "django.contrib.auth.password_validation.MinimumLengthValidator"
            in validator_names
        )


class TestInternationalization:
    def test_i18n_settings(self):
        assert settings.LANGUAGE_CODE == "en-us"
        assert settings.TIME_ZONE == "UTC"
        assert settings.USE_I18N is True
        assert settings.USE_TZ is True
