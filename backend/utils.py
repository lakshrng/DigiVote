import os
import random
import string
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Optional
from database import get_session, OTP, User
import re
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def generate_otp(length: int = 6) -> str:
    """Generate a random OTP code."""
    return ''.join(random.choices(string.digits, k=length))


def validate_email_domain(email: str) -> bool:
    """Validate that email ends with @student.nitw.ac.in"""
    pattern = r'^[a-zA-Z0-9._%+-]+@student\.nitw\.ac\.in$'
    return bool(re.match(pattern, email))


def validate_phone_number(phone: str) -> bool:
    """Validate Indian phone number format."""
    # Remove any non-digit characters
    phone_digits = re.sub(r'\D', '', phone)
    # Check if it's a valid Indian mobile number (10 digits starting with 6-9)
    pattern = r'^[6-9]\d{9}$'
    return bool(re.match(pattern, phone_digits))


def format_phone_number(phone: str) -> str:
    """Format phone number to standard format."""
    phone_digits = re.sub(r'\D', '', phone)
    if len(phone_digits) == 10:
        return f"+91{phone_digits}"
    elif len(phone_digits) == 12 and phone_digits.startswith('91'):
        return f"+{phone_digits}"
    return phone


def create_otp(user_id: str, otp_type: str, session=None, expires_minutes: int = 10) -> str:
    """Create and store an OTP for a user."""
    code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=expires_minutes)
    
    if session:
        # Use the provided session
        # Invalidate any existing unused OTPs of the same type
        session.query(OTP).filter(
            OTP.user_id == user_id,
            OTP.otp_type == otp_type,
            OTP.is_used == False
        ).update({"is_used": True})
        
        # Create new OTP
        otp = OTP(
            user_id=user_id,
            code=code,
            otp_type=otp_type,
            expires_at=expires_at
        )
        session.add(otp)
    else:
        # Fallback to creating a new session (for backward compatibility)
        with get_session() as session:
            # Invalidate any existing unused OTPs of the same type
            session.query(OTP).filter(
                OTP.user_id == user_id,
                OTP.otp_type == otp_type,
                OTP.is_used == False
            ).update({"is_used": True})
            
            # Create new OTP
            otp = OTP(
                user_id=user_id,
                code=code,
                otp_type=otp_type,
                expires_at=expires_at
            )
            session.add(otp)
        
    return code


def verify_otp(user_id: str, code: str, otp_type: str) -> bool:
    """Verify an OTP code for a user."""
    with get_session() as session:
        otp = session.query(OTP).filter(
            OTP.user_id == user_id,
            OTP.code == code,
            OTP.otp_type == otp_type,
            OTP.is_used == False,
            OTP.expires_at > datetime.utcnow()
        ).first()
        
        if otp:
            otp.is_used = True
            return True
        return False


def send_email_otp(email: str, otp_code: str) -> bool:
    """Send OTP via email using SMTP."""
    try:
        # Email configuration - you can set these as environment variables
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_username = os.getenv("SMTP_USERNAME", "")
        smtp_password = os.getenv("SMTP_PASSWORD", "")
        from_email = os.getenv("FROM_EMAIL", smtp_username)
        
        # If no SMTP credentials are configured, fall back to console logging
        if not smtp_username or not smtp_password:
            print(f"⚠️  SMTP credentials not configured. Email OTP for {email}: {otp_code}")
            print("To enable email sending, set SMTP_USERNAME and SMTP_PASSWORD environment variables")
            return True
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = email
        msg['Subject'] = "DigiVote - Email Verification OTP"
        
        # Email body
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <h2 style="color: #2c3e50; margin-bottom: 20px;">DigiVote Email Verification</h2>
                <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                    Thank you for registering with DigiVote! Please use the following OTP to verify your email address:
                </p>
                <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 2px solid #3498db; margin: 20px 0;">
                    <h1 style="color: #2c3e50; font-size: 32px; letter-spacing: 5px; margin: 0;">{otp_code}</h1>
                </div>
                <p style="font-size: 14px; color: #666; margin-top: 20px;">
                    This OTP will expire in 10 minutes. If you didn't request this verification, please ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">
                    This is an automated message from DigiVote. Please do not reply to this email.
                </p>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Connect to server and send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Enable TLS encryption
        server.login(smtp_username, smtp_password)
        text = msg.as_string()
        server.sendmail(from_email, email, text)
        server.quit()
        
        print(f"✅ Email OTP sent successfully to {email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email OTP to {email}: {e}")
        # Fallback to console logging for development
        print(f"📧 Email OTP for {email}: {otp_code}")
        return False


def send_sms_otp(phone: str, otp_code: str) -> bool:
    """Send OTP via SMS. This is a placeholder implementation."""
    # In a real implementation, you would use an SMS service like Twilio, AWS SNS, etc.
    print(f"SMS OTP for {phone}: {otp_code}")
    
    # For development, we'll just log the OTP
    # You can replace this with actual SMS sending logic
    try:
        # Example using a simple SMS service (replace with your preferred service)
        # This is just a placeholder - implement actual SMS sending
        return True
    except Exception as e:
        print(f"Failed to send SMS OTP: {e}")
        return False


def get_user_by_email_or_phone(identifier: str) -> Optional[User]:
    """Get user by email or phone number."""
    with get_session() as session:
        # Try to find by email first
        user = session.query(User).filter(User.email == identifier).first()
        if user:
            return user
        
        # Try to find by phone
        user = session.query(User).filter(User.phone == identifier).first()
        if user:
            return user
        
        return None
