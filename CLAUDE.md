# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website (single-page static HTML) for Mason Xu, a senior backend engineer. The site features:
- Pure HTML with no build process or bundler
- Tailwind CSS for styling (loaded from CDN: `cdn.tailwindcss.com`)
- Mobile-responsive design with Tailwind's responsive utilities
- Custom dark theme defined in the `<script>` tag within the HTML head
- Hosted on GitHub Pages with automatic redirect to Vercel (for better China accessibility)

## Architecture & File Structure

- **index.html**: Main portfolio page containing all content (hero, about, projects, experience, open source contributions)
- **404.html**: Custom 404 error page
- **favicon.svg**: Simple SVG favicon

The site is a single HTML file (~55KB) with:
- Inline `<style>` tags for custom CSS (animations, gradients, tech grid background)
- Inline `<script>` tags for interactivity (mobile menu toggle, smooth scroll, redirect logic)
- Tailwind CSS utility classes for layout and responsive design

## Key Design Decisions

**Color Scheme** (defined in tailwind.config, black-gold theme):
- bg: `#0C0C0E` (Obsidian)
- surface: `#121214`
- surfaceLight: `#1E1E21`
- border: `rgba(212, 175, 55, 0.2)` (Gold border)
- primary: `#D4AF37` (Gold)
- accent: `#F2D288` (Light Gold)
- text: `#FCFCFC` (Pearl)
- muted: `#A1A1AA` (Zinc Muted)

**Fonts** (loaded from `fonts.loli.net` - a China-friendly mirror):
- Sans: Noto Sans SC (Chinese support)
- Mono: JetBrains Mono

**Navigation Flow**:
- Fixed navigation bar with glass-morphism effect
- Mobile menu toggle (hidden on md+ screens)
- Anchor links to sections: #about, #projects, #experience, #opensource

**Vercel Redirect Logic**:
- JavaScript detects if accessed via `*.github.io` and redirects to `https://masonsxu.vercel.app`
- Canonical link set to Vercel domain for SEO
- Preserves pathname and query params on redirect

## Common Development Tasks

**Viewing the site locally**: Simply open `index.html` in a browser. No server needed.

**Updating content**: Edit content directly in the single `index.html` file. All content is inline.

**Modifying styling**:
- Tailwind utility classes: Directly add class names to HTML elements
- Custom CSS: Add or modify `<style>` block in `<head>`
- Dark theme colors: Update the `theme.colors` object in the Tailwind config script

**Adding new sections**:
- Add new `<section>` elements with unique IDs
- Add navigation links to the `<nav>` that point to these section IDs
- Update mobile menu as well

**Testing responsive design**: Use browser DevTools with different viewport sizes (mobile: <640px, tablet: 640-1024px, desktop: >1024px)

## Deployment Notes

The site deploys in two locations:
1. **GitHub Pages** (primary repository): Updates via git push to main branch
2. **Vercel** (production): Automatically synced from GitHub, accessible via `masonsxu.vercel.app`

Users in mainland China should use the Vercel URL due to GitHub Pages accessibility issues. The site includes JavaScript that automatically redirects from github.io to Vercel.

## Commit Message Style

Follow conventional commits format (lowercase, Chinese):
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code restructuring
- `style:` for styling changes
- `docs:` for documentation

Example: `feat: 添加新的核心项目展示区`

## Notes

- This is a lightweight static site with zero build complexity
- No dependencies, no node_modules needed
- All external resources (Tailwind, fonts) are loaded from CDN
- The Tailwind config is embedded as a JavaScript object, not a separate config file
