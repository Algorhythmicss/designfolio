#!/usr/bin/env python3
"""Capture the key flow screens of the three concept sites for their case studies.
Run from the repo root with a static server on :8766. Writes work/<site>/assets/*.webp"""
import os
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); BASE=os.environ.get("CAPTURE_BASE","http://localhost:8766")
def out(site,name): d=os.path.join(ROOT,"work",site,"assets"); os.makedirs(d,exist_ok=True); return os.path.join(d,name)
def save(pg,path,q=80):
    tmp=path+".png"; pg.screenshot(path=tmp); im=Image.open(tmp).convert("RGB"); im.save(path,"WEBP",quality=q,method=6); os.remove(tmp)
    print(" ",os.path.relpath(path,ROOT),f"{os.path.getsize(path)//1024} KB")
with sync_playwright() as p:
    b=p.chromium.launch()
    def page(w=1280,h=800): 
        ctx=b.new_context(viewport={"width":w,"height":h}); return ctx, ctx.new_page()
    # Elsewhere: programme dialog, checkout
    ctx,pg=page(); pg.goto(f"{BASE}/elsewhere/",wait_until="networkidle"); pg.wait_for_timeout(800)
    pg.click("button[data-open='programme-dialog']"); pg.wait_for_timeout(900); save(pg,out("elsewhere","programme.webp"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(400)
    pg.click("button[data-pass='weekend']"); pg.wait_for_timeout(600); pg.click("#quantity-plus"); pg.wait_for_timeout(300)
    pg.fill("#guest-name","Asha Rao"); pg.fill("#guest-email","asha@example.com"); pg.wait_for_timeout(400); save(pg,out("elsewhere","checkout.webp")); ctx.close()
    # Second Nature: room mid-reveal, brief preview
    ctx,pg=page(); pg.goto(f"{BASE}/second-nature/",wait_until="networkidle"); pg.wait_for_timeout(800)
    top=pg.evaluate("document.querySelector('.transformation-run').getBoundingClientRect().top+scrollY"); run=pg.evaluate("document.querySelector('.transformation-run').offsetHeight")
    pg.evaluate(f"window.scrollTo(0,{top+(run-800)*0.5})"); pg.wait_for_timeout(1500); save(pg,out("second-nature","room-reveal.webp"))
    pg.evaluate("document.getElementById('enquiry').scrollIntoView()"); pg.wait_for_timeout(500)
    pg.check("input[name=projectType][value='A home']"); pg.fill("#brief-name","Meera Iyer"); pg.fill("#brief-location","Indiranagar, Bengaluru")
    pg.fill("#brief-goals","The living room is dark and the kitchen is cut off from it. We want to open them up and keep the old floor.")
    pg.select_option("select[name=budget]","I’d like guidance"); pg.select_option("select[name=timing]","3–6 months"); pg.click("button.submit-button"); pg.wait_for_timeout(600)
    pg.evaluate("document.getElementById('brief-result').scrollIntoView({block:'center'})"); pg.wait_for_timeout(500); save(pg,out("second-nature","brief.webp")); ctx.close()
    # Side Note: finder question, product configurator, bag
    ctx,pg=page(); pg.goto(f"{BASE}/side-note/",wait_until="networkidle"); pg.wait_for_timeout(800)
    pg.evaluate("document.getElementById('your-cup').scrollIntoView()"); pg.wait_for_timeout(600); save(pg,out("side-note","finder.webp"))
    pg.click("button.product-button[data-product='offbeat']"); pg.wait_for_timeout(800); pg.select_option("#product-grind","pour"); pg.wait_for_timeout(300); save(pg,out("side-note","product.webp"))
    pg.click("#add-to-bag"); pg.wait_for_timeout(500); pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    pg.click("button.product-button[data-product='daybreak']"); pg.wait_for_timeout(600); pg.select_option("#product-grind","french"); pg.check("input[name=frequency][value='repeat']"); pg.click("#add-to-bag"); pg.wait_for_timeout(500); pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    pg.click("button[data-open-cart]"); pg.wait_for_timeout(800); save(pg,out("side-note","bag.webp")); ctx.close()
    b.close()
