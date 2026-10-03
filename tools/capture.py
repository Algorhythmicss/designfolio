#!/usr/bin/env python3
"""Capture the three concept sites for the portfolio's work section.

Run from the repo root with a static server on :8766 (python3 -m http.server 8766):
    python3 tools/capture.py
Writes assets/shots/<site>-desktop.webp (1280x800) and <site>-phone.webp (390x844 @2x).
Requires: playwright (python), Pillow.
"""
import os, sys
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "shots")
BASE = os.environ.get("CAPTURE_BASE", "http://localhost:8766")
SITES = ["elsewhere", "second-nature", "side-note"]
os.makedirs(OUT, exist_ok=True)

def save_webp(png_path, webp_path, quality):
    im = Image.open(png_path).convert("RGB")
    im.save(webp_path, "WEBP", quality=quality, method=6)
    os.remove(png_path)
    print(f"  {os.path.relpath(webp_path, ROOT)}  {im.width}x{im.height}  {os.path.getsize(webp_path)//1024} KB")

with sync_playwright() as p:
    browser = p.chromium.launch()
    for site in SITES:
        url = f"{BASE}/{site}/"
        print(site)
        # desktop: the first screen at 1280x800
        ctx = browser.new_context(viewport={"width": 1280, "height": 800}, device_scale_factor=1)
        page = ctx.new_page(); page.goto(url, wait_until="networkidle"); page.wait_for_timeout(1200)
        tmp = os.path.join(OUT, f"{site}-desktop.png"); page.screenshot(path=tmp)
        save_webp(tmp, os.path.join(OUT, f"{site}-desktop.webp"), 80)
        ctx.close()
        # phone: the first screen at 390x844, 2x
        ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        page = ctx.new_page(); page.goto(url, wait_until="networkidle"); page.wait_for_timeout(1200)
        tmp = os.path.join(OUT, f"{site}-phone.png"); page.screenshot(path=tmp)
        save_webp(tmp, os.path.join(OUT, f"{site}-phone.webp"), 80)
        ctx.close()
    browser.close()
