#!/usr/bin/env python3
"""
Test script for email OTP functionality.
This script tests the email OTP sending without requiring a full registration.
"""

import os
import sys
from dotenv import load_dotenv
from utils import send_email_otp, generate_otp

# Load environment variables from .env file
load_dotenv()

def test_email_otp():
    """Test the email OTP sending functionality."""
    print("🧪 Testing Email OTP Functionality")
    print("=" * 50)
    
    # Test email (you can change this to your email for testing)
    test_email = "la24csb0b38@student.nitw.ac.in"
    
    # Generate a test OTP
    otp_code = generate_otp()
    print(f"Generated OTP: {otp_code}")
    
    # Test sending email OTP
    print(f"\n📧 Sending OTP to: {test_email}")
    success = send_email_otp(test_email, otp_code)
    
    if success:
        print("✅ Email OTP test completed successfully!")
        print("\nNote: If SMTP credentials are not configured, the OTP will be printed to console.")
    else:
        print("❌ Email OTP test failed!")
        return False
    
    return True

def test_smtp_configuration():
    """Check if SMTP is properly configured."""
    print("\n🔧 Checking SMTP Configuration")
    print("=" * 50)
    
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = os.getenv("SMTP_PORT", "587")
    smtp_username = os.getenv("SMTP_USERNAME", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    
    print(f"SMTP Server: {smtp_server}")
    print(f"SMTP Port: {smtp_port}")
    print(f"SMTP Username: {'✅ Set' if smtp_username else '❌ Not set'}")
    print(f"SMTP Password: {'✅ Set' if smtp_password else '❌ Not set'}")
    
    if not smtp_username or not smtp_password:
        print("\n⚠️  SMTP credentials not configured!")
        print("To enable email sending, create a .env file with:")
        print("SMTP_USERNAME=your-email@gmail.com")
        print("SMTP_PASSWORD=your-app-password")
        print("\nSee EMAIL_CONFIG.md for detailed instructions.")
    else:
        print("\n✅ SMTP configuration looks good!")

if __name__ == "__main__":
    print("DigiVote Email OTP Test")
    print("=" * 50)
    
    # Check SMTP configuration
    test_smtp_configuration()
    
    # Test email OTP functionality
    test_email_otp()
    
    print("\n🎉 Test completed!")
