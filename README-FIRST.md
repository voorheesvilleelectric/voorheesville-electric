# Voorheesville Electric Website

This is a professional multi-page website for Voorheesville Electric, LLC.

## Pages included
- Home
- Services
- Projects / completed job photo carousel
- Service Area
- About
- Contact / service request form

## Free editable setup
Recommended free app: Netlify + Decap CMS.

1. Create a free GitHub account if needed.
2. Create a new GitHub repository named `voorheesville-electric-site`.
3. Upload all files from this folder to that repository.
4. Create a free Netlify account.
5. In Netlify, choose **Add new site > Import an existing project**.
6. Connect the GitHub repository.
7. Build command: leave blank.
8. Publish directory: `.`
9. Deploy the site.
10. In Netlify, enable **Identity**.
11. Enable **Git Gateway**.
12. Invite Ryan as a user under Identity.
13. Ryan edits the website at: `https://your-site-name.netlify.app/admin`

## Updating photos
Project photos can be edited through `/admin` once Netlify Identity and Git Gateway are enabled. You can also manually replace images in `assets/images` or add photos to `uploads`.

## Wix transfer notes
After the Netlify site is live:
1. Log into Wix and find the domain settings for voorheesvilleelectric.com.
2. Point the domain DNS records to Netlify using Netlify's domain instructions.
3. Keep Wix active until the new site is verified live.
4. Once the Netlify site is fully working, cancel the Wix website plan only after confirming the domain/email are not tied to that billing.
