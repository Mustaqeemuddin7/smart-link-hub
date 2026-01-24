"""
Smart Link Hub - QR Code Service
Generates QR codes for hub public URLs
"""
import io
import base64
from typing import Literal
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask


def generate_qr_code(
    url: str,
    size: int = 256,
    format: Literal["png", "svg"] = "png",
    fg_color: str = "#000000",  # Black foreground for best scanning
    bg_color: str = "#FFFFFF",  # White background
) -> bytes:
    """
    Generate a QR code image for the given URL.
    
    Args:
        url: The URL to encode
        size: Size of the QR code in pixels (128-512)
        format: Output format (png or svg)
        fg_color: Foreground color (hex)
        bg_color: Background color (hex)
    
    Returns:
        Image bytes
    """
    # Clamp size
    size = max(128, min(512, size))
    
    # Create QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    # Convert hex colors to RGB tuples
    def hex_to_rgb(hex_color: str) -> tuple:
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    fg_rgb = hex_to_rgb(fg_color)
    bg_rgb = hex_to_rgb(bg_color)
    
    # Generate styled image
    img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=RoundedModuleDrawer(),
        color_mask=SolidFillColorMask(
            back_color=bg_rgb,
            front_color=fg_rgb,
        )
    )
    
    # Resize to requested size
    img = img.resize((size, size))
    
    # Convert to bytes
    buffer = io.BytesIO()
    if format == "svg":
        # For SVG, we'd need a different approach
        # For now, return PNG for both
        img.save(buffer, format="PNG")
    else:
        img.save(buffer, format="PNG")
    
    buffer.seek(0)
    return buffer.getvalue()


def generate_qr_code_base64(
    url: str,
    size: int = 256,
    fg_color: str = "#000000",
    bg_color: str = "#FFFFFF",
) -> str:
    """
    Generate a QR code and return as base64 data URL.
    
    Returns:
        Base64 data URL string (data:image/png;base64,...)
    """
    image_bytes = generate_qr_code(url, size, "png", fg_color, bg_color)
    b64 = base64.b64encode(image_bytes).decode('utf-8')
    return f"data:image/png;base64,{b64}"
