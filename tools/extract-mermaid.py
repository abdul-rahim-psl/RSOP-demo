"""Copies the two Mermaid sources out of the demo doc into tests/fixtures, for the parity test.

Run from the project root whenever the doc changes:  python3 -I tools/extract-mermaid.py
"""
import pathlib
import sys
import xml.etree.ElementTree as ET
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
DOC = ROOT / 'docs' / 'Open_Connect_RAAST_Inquiry_and_Bill_Payment.docx'
OUT = ROOT / 'tests' / 'fixtures'
W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'

body = ET.fromstring(zipfile.ZipFile(DOC).read('word/document.xml')).find(W + 'body')
paras = [''.join(t.text or '' for t in p.iter(W + 't')).strip() for p in body.iter(W + 'p')]

# Each source starts at "sequenceDiagram" and runs until the next heading or instruction line.
blocks, current = [], None
for text in paras:
    if text == 'sequenceDiagram':
        current = [text]
        blocks.append(current)
    elif current is not None and text:
        if text.endswith('Mermaid source') or text.startswith('Copy the text'):
            current = None
        else:
            current.append(text)

if len(blocks) != 2:
    sys.exit(f'Expected 2 Mermaid sources in the doc, found {len(blocks)}')

OUT.mkdir(parents=True, exist_ok=True)
for name, lines in zip(['inquiry', 'payment'], blocks):
    (OUT / f'{name}.mmd').write_text('\n'.join(lines) + '\n')
    print(f'{name}.mmd: {len(lines)} lines')
