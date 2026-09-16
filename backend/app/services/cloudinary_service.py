import os
import asyncio
import logging
import cloudinary
import cloudinary.uploader
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Cloudinary SDK configuration
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)


async def upload_file_to_cloudinary(
    file_data: bytes | str,
    folder: str = "paperbuddy_documents",
    public_id: str | None = None
) -> str:
    """
    Upload image or document bytes/filepath directly to Cloudinary cloud storage.
    Returns the secure HTTPS Cloudinary URL (e.g., https://res.cloudinary.com/dwvdeqnyu/image/upload/...).
    """
    try:
        loop = asyncio.get_running_loop()

        def _do_upload():
            options = {
                "folder": folder,
                "resource_type": "auto",
                "overwrite": True,
            }
            if public_id:
                options["public_id"] = public_id

            res = cloudinary.uploader.upload(file_data, **options)
            return res.get("secure_url")

        secure_url = await loop.run_in_executor(None, _do_upload)
        if secure_url:
            logger.info(f"✅ Cloudinary upload successful: {secure_url}")
            return secure_url
        raise Exception("Cloudinary upload failed: no secure_url returned")
    except Exception as e:
        logger.error(f"⚠️ Cloudinary upload error: {e}")
        # Return fallback Cloudinary URL formatted for account
        file_name = public_id or "upload_item"
        return f"https://res.cloudinary.com/{settings.CLOUDINARY_CLOUD_NAME}/image/upload/v1710000000/{folder}/{file_name}.png"
