"""schemas.py Pydantic 모델 유닛 테스트."""

import pytest
from pydantic import ValidationError

from server.models.schemas import (
    CreateDubbingRequest,
    DubbingItem,
    DubbingProgress,
    DubbingStatus,
    LanguageCode,
    StepProgress,
    DubbingStep,
    StepStatus,
    UserProfile,
)


class TestLanguageCode:
    def test_valid_codes(self):
        for code in ("ko", "en", "ja", "zh", "es"):
            assert LanguageCode(code).value == code

    def test_invalid_code(self):
        with pytest.raises(ValueError):
            LanguageCode("fr")


class TestCreateDubbingRequest:
    def test_valid_request(self):
        req = CreateDubbingRequest(
            video_uri="https://example.com/v.mp4",
            file_name="video.mp4",
            source_language=LanguageCode.ko,
            target_language=LanguageCode.en,
        )
        assert req.source_language == LanguageCode.ko
        assert req.target_language == LanguageCode.en

    def test_missing_field(self):
        with pytest.raises(ValidationError):
            CreateDubbingRequest(
                video_uri="https://example.com/v.mp4",
                file_name="video.mp4",
                source_language=LanguageCode.ko,
                # target_language missing
            )


class TestDubbingItem:
    def test_full_item(self):
        item = DubbingItem(
            id="abc-123",
            title="Test Video",
            source_language=LanguageCode.ko,
            target_language=LanguageCode.en,
            status=DubbingStatus.completed,
            created_at="2026-04-13T00:00:00Z",
            file_size_bytes=1024,
            duration_seconds=60,
        )
        assert item.status == DubbingStatus.completed
        assert item.thumbnail_url is None


class TestDubbingProgress:
    def test_progress_model(self):
        progress = DubbingProgress(
            id="abc-123",
            status=DubbingStatus.processing,
            current_step=DubbingStep.analyze_speech,
            progress_percent=45,
            estimated_remaining_seconds=30,
            steps=[
                StepProgress(step=DubbingStep.upload, status=StepStatus.done),
                StepProgress(step=DubbingStep.extract_audio, status=StepStatus.done),
                StepProgress(step=DubbingStep.analyze_speech, status=StepStatus.in_progress),
                StepProgress(step=DubbingStep.synthesize_dubbing, status=StepStatus.pending),
            ],
        )
        assert progress.progress_percent == 45
        assert len(progress.steps) == 4


class TestUserProfile:
    def test_optional_avatar(self):
        user = UserProfile(id="u1", email="a@b.com", display_name="Test")
        assert user.avatar_url is None

    def test_with_avatar(self):
        user = UserProfile(id="u1", email="a@b.com", display_name="Test", avatar_url="https://img.com/a.jpg")
        assert user.avatar_url == "https://img.com/a.jpg"
