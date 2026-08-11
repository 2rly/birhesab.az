# -*- coding: utf-8 -*-
import json, re
d = json.load(open('/tmp/priv.json', encoding='utf-8'))
items = d['data']['Privilege']
seen = set()
rows = []
for x in items:
    code = (x.get('code') or '').strip()
    name = re.sub(r'\s+', ' ', (x.get('name') or '').strip())
    if not code or code in seen:
        continue
    seen.add(code)
    rows.append((code, name))
rows.sort(key=lambda r: (r[0] != '000', r[0]))
out = [
    '// DGK imtiyaz (privilege) lugeti -- calculate-duty `privilege` sahesi ucun',
    '// Menbe: dictionaries/list -> Privilege',
    'export interface Privilege { code: string; name: string }',
    'export const privileges: Privilege[] = [',
]
for code, name in rows:
    out.append('  { code: ' + json.dumps(code, ensure_ascii=False) + ', name: ' + json.dumps(name, ensure_ascii=False) + ' },')
out.append('];')
out.append('')
open('src/data/privileges-2026.ts', 'w', encoding='utf-8').write("\n".join(out))
print('privileges written:', len(rows))
