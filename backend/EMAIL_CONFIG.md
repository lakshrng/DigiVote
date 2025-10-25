# Email Configuration for DigiVote

To enable email OTP functionality, you need to configure SMTP settings. Follow these steps:

## 1. Create a .env file in the backend directory

Create a file named `.env` in the `backend/` directory with the following content:

```env
# Database Configuration
DATABASE_URL=postgresql+psycopg://postgres:1234@localhost:5432/digi-voter

# Email Configuration (for OTP sending)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com

# Optional: Database connection settings
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30
SQLALCHEMY_ECHO=false
```

## 2. Gmail Configuration

### For Gmail users:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this app password (not your regular Gmail password) in `SMTP_PASSWORD`

### For other email providers:

- **Outlook/Hotmail**: Use `smtp-mail.outlook.com` with port 587
- **Yahoo**: Use `smtp.mail.yahoo.com` with port 587
- **Custom SMTP**: Use your organization's SMTP server details

## 3. Alternative Email Services

For production use, consider using dedicated email services:

### SendGrid
```env
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### AWS SES
```env
SMTP_SERVER=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
```

## 4. Testing

Without SMTP configuration, the system will:
- Print OTP codes to the console for development
- Show a warning message about missing SMTP credentials
- Still function for testing purposes

## 5. Security Notes

- Never commit your `.env` file to version control
- Use app passwords instead of your main account password
- Consider using environment-specific configurations for production
