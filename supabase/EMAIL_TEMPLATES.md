# Coastal Kiln Email Templates

Paste these templates into the **Supabase Dashboard** under:
**Authentication > Email Templates**

---

## Confirm Signup

Go to **Authentication > Email Templates > Confirm signup** and replace the HTML body with:

```html
<div style="background-color: #FAF7F2; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background-color: #4A7C59; padding: 32px; text-align: center;">
      <img src="https://your-domain.com/CoastalKilnLogo.png" alt="Coastal Kiln" width="64" height="64" style="border-radius: 12px; margin-bottom: 12px;" />
      <h1 style="color: #FFFFFF; font-size: 24px; margin: 0;">Welcome to Coastal Kiln</h1>
    </div>

    <!-- Body -->
    <div style="padding: 32px;">
      <p style="color: #3D3D3D; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
        Thanks for signing up! Confirm your email to start tracking your pottery projects.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{ .ConfirmationURL }}"
           style="display: inline-block; background-color: #4A7C59; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;">
          Confirm Your Account
        </a>
      </div>

      <p style="color: #8B8B8B; font-size: 14px; line-height: 1.5; margin: 0;">
        If you didn't create an account, you can safely ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding: 24px 32px; border-top: 1px solid #E7E5E4; text-align: center;">
      <p style="color: #8B8B8B; font-size: 12px; margin: 0;">
        Coastal Kiln &mdash; Your pottery studio companion
      </p>
    </div>
  </div>
</div>
```

**Subject line:** `Confirm your Coastal Kiln account`

> Replace `https://your-domain.com/CoastalKilnLogo.png` with the actual URL where your logo is hosted (e.g., your Supabase storage public URL or your app's domain).
