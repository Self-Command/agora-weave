"""Index original ZIP members without executing or extracting their contents."""
import hashlib
import json
from pathlib import Path, PurePosixPath
import stat
import sys
import zipfile

source, output = map(Path, sys.argv[1:])
records = []
names = set()
expanded = 0
with zipfile.ZipFile(source) as archive:
    for member in archive.infolist():
        name = member.filename
        parts = PurePosixPath(name).parts
        if not parts or name.startswith('/') or '\\' in name or any(part in ('.', '..') for part in parts):
            raise ValueError('Unsafe archive member path')
        if name in names or member.flag_bits & 1 or stat.S_ISLNK(member.external_attr >> 16):
            raise ValueError('Duplicate, encrypted or symbolic archive member')
        names.add(name)
        if member.is_dir():
            continue
        expanded += member.file_size
        if len(records) >= 10000 or expanded > 128 * 1024 * 1024:
            raise ValueError('Original raw archive exceeds bounded indexing size')
        digest = hashlib.sha256()
        actual_size = 0
        with archive.open(member) as stream:
            while chunk := stream.read(1024 * 1024):
                actual_size += len(chunk)
                if actual_size > member.file_size:
                    raise ValueError('Original raw size mismatch')
                digest.update(chunk)
        if actual_size != member.file_size:
            raise ValueError('Truncated original raw archive')
        records.append({'path': name, 'sha256': digest.hexdigest(), 'size_bytes': actual_size})
if not records:
    raise ValueError('Empty raw evidence archive')
output.write_text(json.dumps(records, indent=2) + '\n', encoding='utf-8')
