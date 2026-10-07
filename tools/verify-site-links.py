#!/usr/bin/env python3
"""Network-free audit of published local links, assets and HTML references.

Only Git-tracked files are inspected. Held, untracked experiments are deliberately
excluded. Controller-owned pricing fragments and runtime dialog headings are
checked against their source rather than treated as missing static elements.
"""

from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
TRACKED = set(subprocess.check_output(
    ["git", "ls-files", "-z"], cwd=ROOT).decode().split("\0")) - {""}
HTML_FILES = sorted(p for p in TRACKED if p.endswith(".html"))
LEGACY_OFFERS = {
    "first-impression", "product-review", "product-upgrade", "monthly-partner",
    "first-product", "website-week", "launch-grow", "lockdown-week", "look-week",
    "quarterly-checkin",
}
errors = []
counts = Counter()


class Page(HTMLParser):
    def __init__(self, name):
        super().__init__(convert_charrefs=True)
        self.name = name
        self.ids = []
        self.id_tags = {}
        self.links = []
        self.references = []
        self.scripts = []
        self.fields = []
        self.labels = []
        self.stack = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        line = self.getpos()[0]
        if attrs.get("id"):
            self.ids.append(attrs["id"])
            self.id_tags[attrs["id"]] = tag
        for key in ("href", "src", "poster", "action"):
            if attrs.get(key):
                self.links.append((line, key, attrs[key]))
        if attrs.get("srcset"):
            if attrs["srcset"].lstrip().startswith("data:"):
                counts["data_srcsets"] += 1
            else:
                for candidate in attrs["srcset"].split(","):
                    self.links.append((line, "srcset", candidate.strip().split()[0]))
        if tag == "script" and attrs.get("src"):
            self.scripts.append(attrs["src"])
        if tag == "img":
            counts["images"] += 1
            if "alt" not in attrs:
                fail(self.name, line, "image is missing alt (use an empty alt for decoration)")
        for key in ("aria-labelledby", "aria-describedby", "aria-controls"):
            for target in attrs.get(key, "").split():
                self.references.append((line, key, target))
        if tag == "label" and attrs.get("for"):
            self.references.append((line, "for", attrs["for"]))
            self.labels.append(attrs["for"])
        if attrs.get("data-open"):
            self.references.append((line, "data-open", attrs["data-open"]))
        if attrs.get("data-go"):
            self.references.append((line, "data-go", attrs["data-go"]))
        if tag in {"input", "select", "textarea"} and attrs.get("type") not in {
                "hidden", "submit", "button", "reset", "image"}:
            implicit = any(t == "label" for t in self.stack)
            self.fields.append((line, attrs, implicit))
        if tag not in {"area", "base", "br", "col", "embed", "hr", "img", "input",
                       "link", "meta", "param", "source", "track", "wbr"}:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in self.stack:
            reverse = self.stack[::-1].index(tag)
            del self.stack[len(self.stack) - reverse - 1:]

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)


def fail(name, line, message):
    errors.append(f"{name}:{line}: {message}")


def local_target(name, line, url, kind="link"):
    """Resolve a local resource, including directory-index and exact-case checks."""
    parts = urlsplit(url.strip())
    if parts.scheme or parts.netloc:
        counts["external_or_special"] += 1
        return None
    path = unquote(parts.path)
    if path.startswith("/designfolio/"):
        # The 404 page can be reached at any depth. Its explicit deployment
        # prefix is required; ordinary relative URLs would resolve incorrectly.
        target = ROOT / path.removeprefix("/designfolio/")
    elif path.startswith("/"):
        fail(name, line, f"root-relative {kind} is unsafe for Pages subpath: {url}")
        return None
    else:
        target = (ROOT / name).parent / path if path else ROOT / name
    target = target.resolve()
    if not target.is_relative_to(ROOT):
        fail(name, line, f"{kind} escapes the checkout: {url}")
        return None
    if target.is_dir():
        target = target / "index.html"
    relative = target.relative_to(ROOT).as_posix()
    if relative not in TRACKED:
        fail(name, line, f"missing, untracked, or case-mismatched {kind}: {url} -> {relative}")
        return None
    counts["local_targets"] += 1
    return relative, unquote(parts.fragment)


pages = {}
runtime_ids = {}
for name in HTML_FILES:
    page = Page(name)
    page.feed((ROOT / name).read_text())
    pages[name] = page
    dynamic = set()
    for script in page.scripts:
        resolved = local_target(name, 1, script, "script")
        if resolved and resolved[0].endswith((".js", ".mjs")):
            source = (ROOT / resolved[0]).read_text()
            dynamic.update(re.findall(r'\bid=["\']([^"\']+)["\']', source))
    runtime_ids[name] = dynamic
    for identity, count in Counter(page.ids).items():
        if count > 1:
            fail(name, 1, f"duplicate id {identity!r} ({count} occurrences)")

for name, page in pages.items():
    static = set(page.ids)
    for line, kind, target in page.references:
        counts["id_references"] += 1
        if target not in static:
            if target in runtime_ids[name]:
                counts["runtime_references"] += 1
            else:
                fail(name, line, f"{kind} references missing id {target!r}")
        elif kind == "for" and page.id_tags[target] not in {
                "input", "select", "textarea", "button", "meter", "output", "progress"}:
            fail(name, line, f"label targets non-labelable {page.id_tags[target]}#{target}")
    for line, attrs, implicit in page.fields:
        counts["form_controls"] += 1
        if not (implicit or attrs.get("id") in page.labels or attrs.get("aria-label")
                or attrs.get("aria-labelledby")):
            fail(name, line, f"form control has no label: {attrs.get('id', attrs.get('name', 'unnamed'))}")
    for line, kind, url in page.links:
        resolved = local_target(name, line, url, kind)
        if not resolved:
            continue
        target, fragment = resolved
        if fragment and target.endswith(".html"):
            counts["fragment_references"] += 1
            if fragment in set(pages[target].ids) | runtime_ids[target]:
                continue
            if target == "pricing/index.html" and fragment in LEGACY_OFFERS:
                model = (ROOT / "pricing/offer-guide-model.mjs").read_text()
                if re.search(rf"(?:[\"']{re.escape(fragment)}[\"']|\b{re.escape(fragment)}\b)", model):
                    counts["controller_fragments"] += 1
                    continue
            fail(name, line, f"missing fragment {url} -> {target}#{fragment}")

# CSS references are relative to their stylesheet, including font and art assets.
for name in sorted(p for p in TRACKED if p.endswith(".css")):
    source = (ROOT / name).read_text()
    source = re.sub(r"/\*.*?\*/", "", source, flags=re.S)
    for match in re.finditer(r"url\(\s*(['\"]?)(.*?)\1\s*\)", source):
        url = match.group(2).strip()
        if not url or url.startswith("#"):
            continue
        counts["css_resources"] += 1
        local_target(name, source[:match.start()].count("\n") + 1, url, "CSS resource")
    for match in re.finditer(r"@import\s+['\"]([^'\"]+)['\"]", source):
        counts["css_resources"] += 1
        local_target(name, source[:match.start()].count("\n") + 1, match.group(1), "CSS import")

# Resolve browser module imports without executing page code or contacting hosts.
for name in sorted(p for p in TRACKED if p.endswith((".js", ".mjs")) and not p.startswith("tools/")):
    source = (ROOT / name).read_text()
    imports = list(re.finditer(r"\b(?:import|export)\s+(?:[^;\n]*?\s+from\s*)?['\"]([^'\"]+)['\"]", source))
    imports += list(re.finditer(r"\bimport\s*\(\s*['\"]([^'\"]+)['\"]\s*\)", source))
    for match in imports:
        url = match.group(1)
        if url.startswith(("./", "../")):
            counts["module_imports"] += 1
            local_target(name, source[:match.start()].count("\n") + 1, url, "module import")

# Published illustrations can have their own internal references. Check SVGs
# separately so missing filters/clip paths or embedded local assets are visible.
for name in sorted(p for p in TRACKED if p.endswith(".svg")):
    counts["svg_files"] += 1
    source = (ROOT / name).read_text()
    try:
        tree = ET.fromstring(source)
    except ET.ParseError as error:
        fail(name, error.position[0], f"invalid SVG XML: {error}")
        continue
    identities = [node.attrib["id"] for node in tree.iter() if "id" in node.attrib]
    for identity, count in Counter(identities).items():
        if count > 1:
            fail(name, 1, f"duplicate SVG id {identity!r} ({count} occurrences)")
    for node in tree.iter():
        for attribute, value in node.attrib.items():
            if attribute.split("}")[-1] == "href":
                if value.startswith("#"):
                    if value[1:] not in identities:
                        fail(name, 1, f"missing SVG href target {value!r}")
                else:
                    local_target(name, 1, value, "SVG asset")
            for identity in re.findall(r"url\(\s*#([^\s)]+)\s*\)", value):
                counts["svg_references"] += 1
                if identity not in identities:
                    fail(name, 1, f"missing SVG filter/paint/clip target {identity!r}")

# Check every shipped script's parser boundary. This does not run page code.
scripts = sorted(p for p in TRACKED if p.endswith((".js", ".mjs")) and not p.startswith("tools/"))
for name in scripts:
    parsed = subprocess.run(["node", "--check", str(ROOT / name)],
                            capture_output=True, text=True)
    counts["parsed_scripts"] += 1
    if parsed.returncode:
        fail(name, 1, f"JavaScript syntax error:\n{parsed.stderr.strip()}")

# Literal DOM references must belong to at least one page using that script.
# Shared contact code intentionally runs on both portfolio and contact pages;
# page-presence guards are tested by verify-contact rather than inferred here.
for script in scripts:
    relevant = [page for name, page in pages.items() if any(
        ((ROOT / name).parent / urlsplit(url).path).resolve() == ROOT / script
        for url in page.scripts)]
    if not relevant:
        continue
    available = set().union(*(set(page.ids) | runtime_ids[page.name] for page in relevant))
    source = (ROOT / script).read_text()
    for match in re.finditer(r"\bgetElementById\(\s*['\"]([^'\"]+)['\"]\s*\)", source):
        counts["script_dom_references"] += 1
        if match.group(1) not in available:
            fail(script, source[:match.start()].count("\n") + 1,
                 f"literal DOM target absent from linked pages: {match.group(1)!r}")

print(f"Audited {len(HTML_FILES)} tracked HTML pages; {counts['local_targets']} local targets; "
      f"{counts['fragment_references']} fragments; {counts['id_references']} ID references; "
      f"{counts['form_controls']} labelled controls; {counts['css_resources']} CSS resources; "
      f"{counts['module_imports']} module imports.")
print(f"Recognized {counts['runtime_references']} runtime heading references and "
      f"{counts['controller_fragments']} controller-owned legacy fragments. "
      f"{counts['external_or_special']} external/special targets were not contacted.")
print(f"Checked {counts['images']} image alternatives, {counts['svg_files']} SVG files / "
      f"{counts['svg_references']} SVG references, {counts['parsed_scripts']} script syntax boundaries "
      f"and {counts['script_dom_references']} literal script-to-DOM references.")
if errors:
    print("\n".join(errors), file=sys.stderr)
    sys.exit(1)
print("No broken published local targets, missing labels, duplicate IDs or unresolved references found.")
