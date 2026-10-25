import json,os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'project'))
t=json.load(open('tokens.json'))
out=[]
out.append("# Cure Home — Device UI/UX Design Guide\n")
out.append("*v0.1 · 2026-10-21 · Generated from the Cure Home design system (the \"Cure Home Design System\" artifact in Dilshan's Claude account, which Claude Design reads; source files mirrored in `design-system/`). Edit the design system, then regenerate this file with `design-system/gen_guide.py`.*\n")
out.append("""## Using this with Claude Design and Claude Code
- **Claude Design:** choose the **Cure Home** design system when starting a design. Ask for screens by name from *Screens & flows* (e.g. "Orbit View for Thaththa in Tamil, day theme, a weight reading arriving").
- **Claude Code (`apps/hub-ui`):** export `design-system/project/tokens.json` to CSS variables / Tailwind v4 `@theme`, keeping the token names. Rebuild the components below in React + TypeScript with Motion and anime.js; the design-system bundle is a visual reference, not production code.
- **Canvas:** 1280 × 800 CSS px at device scale 1.5 on the 10.1" panel.
""")
out.append("## Foundations\n")
out.append(('\n'+open('README.md').read().strip()).replace('\n## ','\n### ')+'\n')
for f in ['1-orbit-view.md','2-glass-and-depth.md','3-motion.md','4-screens.md','5-accessibility-privacy.md','6-build-stack.md']:
    s=open(f).read().strip().split('\n'); s[0]='#'+s[0]
    out.append('\n'.join(s).replace('\n## ','\n### ')+"\n")
out.append("## Tokens\n\n### Colour (night / day)\n\n| Token | Night | Day | Usage |\n|---|---|---|---|")
for c in t['color']['tokens']:
    v=c['value']; out.append(f"| `{c['name']}` | `{v['night']}` | `{v['day']}` | {c['usage']} |")
out.append("\n### Type\n\n| Style | Family | Size / line / weight | Usage |\n|---|---|---|---|")
for g in t['type']['groups']:
    for s in g['styles']:
        fam=s.get('family',g['family'])
        ls=(' / '+s['letterSpacing']) if 'letterSpacing' in s else ''
        out.append(f"| `{s['name']}` | {fam} | {s['fontSize']} / {s['lineHeight']} / {s['fontWeight']}{ls} | {s.get('usage','')} |")
out.append("\nFamilies: " + "; ".join(f"`{k}` = {v}" for k,v in t['type']['families'].items()) + "\n")
for fam,title in [('spacing','Spacing'),('radius','Radius'),('shadow','Shadow'),('blur','Blur'),('opacity','Opacity'),('size','Sizes')]:
    out.append(f"### {title}\n\n| Token | Value | Usage |\n|---|---|---|")
    for c in t[fam]['tokens']:
        v=c['value']; v=(v['night']+'` · day `'+v['day']) if isinstance(v,dict) else v
        out.append(f"| `{c['name']}` | `{v}` | {c.get('usage','')} |")
    out.append("")
out.append("## Components\n\nLive previews of each component are in the design system artifact (and `design-system/project/components/<Name>/preview.html`).\n")
for comp in sorted(os.listdir('components')):
    p=f'components/{comp}/README.md'
    if os.path.exists(p):
        s=open(p).read().strip().split('\n'); s[0]='##'+s[0]
        out.append('\n'.join(s)+"\n")
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', '04-design', 'DESIGN_GUIDE.md'),'w').write('\n'.join(out))
print('written', sum(len(x) for x in out))
