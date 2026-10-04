#!/usr/bin/env python3
"""Generate the small inline-SVG diagrams used by the case studies (ink on paper, no fills)."""
import html
INK="#292820"; MUTED="#64645b"; BLUE="#214ebe"; RED="#a64431"
FONT="font-family:'DM Sans',sans-serif"

def flow_svg(nodes, branch=None, vertical=False):
    """nodes: list of labels; branch: (from_index, label) drawn as a loop back/aside."""
    n=len(nodes)
    if not vertical:
        W=760; bw=108; gap=(W-20-n*bw)/(n-1); H=150 if branch else 110; y=38
        parts=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-label="Flow: {html.escape(" → ".join(nodes))}" style="width:100%;height:auto;display:block">',
               f'<defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5 0 10" fill="none" stroke="{INK}" stroke-width="1.3"/></marker></defs>']
        xs=[]
        for i,label in enumerate(nodes):
            x=10+i*(bw+gap); xs.append(x)
            parts.append(f'<rect x="{x:.1f}" y="{y}" width="{bw}" height="44" rx="6" fill="none" stroke="{INK}" stroke-width="1.3"/>')
            lines=wrap(label,16)
            for k,ln in enumerate(lines):
                ty=y+22+(k-(len(lines)-1)/2)*14+4
                parts.append(f'<text x="{x+bw/2:.1f}" y="{ty:.1f}" text-anchor="middle" font-size="12.5" fill="{INK}" style="{FONT}">{html.escape(ln)}</text>')
            if i<n-1:
                parts.append(f'<line x1="{x+bw+3:.1f}" y1="{y+22}" x2="{x+bw+gap-3:.1f}" y2="{y+22}" stroke="{INK}" stroke-width="1.3" marker-end="url(#a)"/>')
            parts.append(f'<text x="{x:.1f}" y="{y-12}" font-size="10.5" letter-spacing=".06em" fill="{MUTED}" style="{FONT}">{i+1:02d}</text>')
        if branch:
            fi,label=branch; x=xs[fi]+bw/2; by=y+44
            parts.append(f'<path d="M{x:.1f} {by} C {x:.1f} {by+36}, {x+150:.1f} {by+36}, {x+150:.1f} {by+36}" fill="none" stroke="{BLUE}" stroke-width="1.3" stroke-dasharray="4 4"/>')
            parts.append(f'<text x="{x+158:.1f}" y="{by+40}" font-size="12" fill="{BLUE}" style="{FONT}">{html.escape(label)}</text>')
        parts.append('</svg>'); return ''.join(parts)
    else:
        W=380; bh=44; gap=26; H=20+n*(bh+gap)-gap+ (40 if branch else 20); x=10; bw=200
        parts=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-label="Flow: {html.escape(" → ".join(nodes))}" style="width:100%;max-width:380px;height:auto;display:block">',
               f'<defs><marker id="b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5 0 10" fill="none" stroke="{INK}" stroke-width="1.3"/></marker></defs>']
        for i,label in enumerate(nodes):
            y=10+i*(bh+gap)
            parts.append(f'<rect x="{x}" y="{y}" width="{bw}" height="{bh}" rx="6" fill="none" stroke="{INK}" stroke-width="1.3"/>')
            parts.append(f'<text x="{x+14}" y="{y+27}" font-size="13" fill="{INK}" style="{FONT}">{html.escape(label)}</text>')
            parts.append(f'<text x="{x+bw+14}" y="{y+27}" font-size="10.5" letter-spacing=".06em" fill="{MUTED}" style="{FONT}">{i+1:02d}</text>')
            if i<n-1:
                parts.append(f'<line x1="{x+bw/2}" y1="{y+bh+3}" x2="{x+bw/2}" y2="{y+bh+gap-3}" stroke="{INK}" stroke-width="1.3" marker-end="url(#b)"/>')
        if branch:
            fi,label=branch; y=10+fi*(bh+gap)+bh/2
            parts.append(f'<path d="M{x+bw} {y} C {x+bw+40} {y}, {x+bw+40} {y+70}, {x+bw+40} {y+70}" fill="none" stroke="{BLUE}" stroke-width="1.3" stroke-dasharray="4 4"/>')
            for k,ln in enumerate(wrap(label,17)):
                parts.append(f'<text x="{x+bw+48}" y="{y+74+k*14}" font-size="12" fill="{BLUE}" style="{FONT}">{html.escape(ln)}</text>')
        parts.append('</svg>'); return ''.join(parts)

def wrap(s,n):
    words=s.split(); lines=[]; cur=''
    for w in words:
        if len(cur)+len(w)+1>n and cur: lines.append(cur); cur=w
        else: cur=(cur+' '+w).strip()
    if cur: lines.append(cur)
    return lines

def tabs_svg():
    """Five tabs vs one page."""
    W,H=760,250
    p=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-label="Before: five browser tabs for one problem. After: one Leetify page with statement, editor and tests." style="width:100%;height:auto;display:block">',
       f'<defs><marker id="c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5 0 10" fill="none" stroke="{INK}" stroke-width="1.3"/></marker></defs>',
       f'<text x="10" y="18" font-size="10.5" letter-spacing=".08em" fill="{MUTED}" style="{FONT}">BEFORE · FIVE TABS</text>',
       f'<text x="430" y="18" font-size="10.5" letter-spacing=".08em" fill="{MUTED}" style="{FONT}">AFTER · ONE PAGE</text>']
    tabs=[("Problem statement",10,40,-2),("Submit form",150,70,1.5),("VS Code",60,120,-1),("Notes",200,140,2),("My submissions",110,195,-1.5)]
    for label,x,y,rot in tabs:
        w=max(92,len(label)*6.6+22)
        p.append(f'<g transform="rotate({rot} {x+w/2} {y+16})"><path d="M{x} {y+32} V{y+6} q0-6 6-6 h{w-12} q6 0 6 6 V{y+32}" fill="none" stroke="{INK}" stroke-width="1.3"/><text x="{x+11}" y="{y+21}" font-size="12" fill="{INK}" style="{FONT}">{html.escape(label)}</text></g>')
    # tangled arrows between tabs
    for d in ["M60 60 C 90 95, 130 70, 165 72","M240 95 C 250 115, 170 120, 150 130","M110 150 C 110 170, 190 170, 200 160","M160 200 C 130 190, 60 180, 70 150"]:
        p.append(f'<path d="{d}" fill="none" stroke="{MUTED}" stroke-width="1.1" stroke-dasharray="3 4" marker-end="url(#c)"/>')
    # big arrow
    p.append(f'<line x1="330" y1="125" x2="400" y2="125" stroke="{INK}" stroke-width="1.6" marker-end="url(#c)"/>')
    # one window
    x,y,w,h=430,34,320,196
    p.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="none" stroke="{INK}" stroke-width="1.4"/>')
    p.append(f'<line x1="{x}" y1="{y+26}" x2="{x+w}" y2="{y+26}" stroke="{INK}" stroke-width="1.2"/>')
    for i in range(3): p.append(f'<circle cx="{x+14+i*12}" cy="{y+13}" r="3" fill="none" stroke="{INK}" stroke-width="1.1"/>')
    p.append(f'<rect x="{x+w-74}" y="{y+6}" width="60" height="14" rx="3" fill="{BLUE}"/><text x="{x+w-44}" y="{y+16.5}" text-anchor="middle" font-size="9.5" fill="#fff" style="{FONT}">Submit</text>')
    p.append(f'<line x1="{x+150}" y1="{y+26}" x2="{x+150}" y2="{y+h}" stroke="{INK}" stroke-width="1.2"/>')
    p.append(f'<line x1="{x+150}" y1="{y+128}" x2="{x+w}" y2="{y+128}" stroke="{INK}" stroke-width="1.2"/>')
    p.append(f'<text x="{x+14}" y="{y+52}" font-size="12.5" fill="{INK}" style="{FONT}">Statement</text>')
    for k in range(6): p.append(f'<line x1="{x+14}" y1="{y+66+k*12}" x2="{x+14+ (110 if k%3 else 80)}" y2="{y+66+k*12}" stroke="{MUTED}" stroke-width="1" opacity=".6"/>')
    p.append(f'<text x="{x+164}" y="{y+52}" font-size="12.5" fill="{INK}" style="{FONT}">Editor</text>')
    for k in range(5): p.append(f'<line x1="{x+164}" y1="{y+66+k*12}" x2="{x+164+(120 if k%2 else 70)}" y2="{y+66+k*12}" stroke="{BLUE}" stroke-width="1" opacity=".55"/>')
    p.append(f'<text x="{x+164}" y="{y+152}" font-size="12.5" fill="{INK}" style="{FONT}">Tests · Run · Verdict</text>')
    p.append(f'<line x1="{x+164}" y1="{y+168}" x2="{x+280}" y2="{y+168}" stroke="{MUTED}" stroke-width="1" opacity=".6"/>')
    p.append('</svg>'); return ''.join(p)

if __name__=='__main__':
    import sys
    flows={
     'elsewhere':(['Opening','Programme & filters','Artist detail','The right day pass','Checkout','Demo ticket'],(4,'Back to the programme or policy keeps your details')),
     'second-nature':(['Opening & practice','Room reveal','Project studies','The approach','Brief builder','Brief preview'],(4,'“I’d like guidance” instead of a number')),
     'side-note':(['Opening','Three coffees','Finder (brewer, milk, taste)','Configure size & grind','Bag','Demo checkout'],(2,'No brewer yet → honest next step')),
    }
    for slug,(nodes,branch) in flows.items():
        path=f'work/{slug}/index.html'; h=open(path,encoding='utf-8').read()
        block=f'<figure class="diagram"><div class="diagram-wide">{flow_svg(nodes,branch)}</div><div class="diagram-tall">{flow_svg(nodes,branch,vertical=True)}</div><figcaption>The flow, start to finish. The dotted line is the detour the design makes room for.</figcaption></figure>\n'
        if '<figure class="diagram">' in h:
            import re; h=re.sub(r'<figure class="diagram">.*?</figure>\n','',h,flags=re.S)
        h=h.replace('  <ol class="flow">', block+'  <ol class="flow">',1)
        open(path,'w',encoding='utf-8').write(h); print('diagram →',path)
    path='leetify/index.html'; h=open(path,encoding='utf-8').read()
    block=f'<figure class="diagram"><div class="diagram-wide">{tabs_svg()}</div><figcaption>Before and after: five tabs for one problem, or one page.</figcaption></figure>\n'
    if '<figure class="diagram">' in h:
        import re; h=re.sub(r'<figure class="diagram">.*?</figure>\n','',h,flags=re.S)
    anchor=' <figure class="shot pair">'
    h=h.replace(anchor, block+anchor,1)
    open(path,'w',encoding='utf-8').write(h); print('diagram →',path)
