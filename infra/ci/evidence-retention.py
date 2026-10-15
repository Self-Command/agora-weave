"""Storage housekeeping only; never executes an archived file or project command."""
import datetime
import json
from pathlib import Path
import stat
import syslog
import time

BASE = Path("/srv/agoraweave-evidence/archive")
now = time.time()
for category, maximum_days in (("ordinary", 90), ("formal", 365), ("sensitive", 7)):
    root = BASE / category
    if not root.is_dir() or root.is_symlink():
        raise RuntimeError("Missing dedicated archive category")
    files = []
    for candidate in root.rglob("*"):
        info = candidate.lstat()
        if stat.S_ISREG(info.st_mode) and candidate.resolve().is_relative_to(root.resolve()):
            files.append((candidate, info))
    deadlines = {}
    errors = 0
    for candidate, info in files:
        if candidate.name != "index.json" and not candidate.name.endswith(".index.json"):
            continue
        try:
            if info.st_size > 2 * 1024 * 1024:
                raise ValueError("Index size limit")
            index = json.loads(candidate.read_text(encoding="utf-8"))
            expiry = datetime.datetime.fromisoformat(index["expires_at"].replace("Z", "+00:00"))
            if expiry.tzinfo is None:
                raise ValueError("Unqualified expiry")
            deadline = min(expiry.timestamp(), info.st_mtime + maximum_days * 86400)
            if candidate.name == "index.json":
                names = ("source.zip", "index.json", "receipt.json")
            else:
                prefix = candidate.name[:-len(".index.json")]
                names = tuple(prefix + suffix for suffix in (".source.zip", ".index.json", ".receipt.json"))
            for name in names:
                target = candidate.parent / name
                deadlines[target] = min(deadlines.get(target, deadline), deadline)
        except (KeyError, ValueError, TypeError, OSError):
            errors += 1
    removed = 0
    for candidate, info in files:
        deadline = min(deadlines.get(candidate, float("inf")), info.st_mtime + maximum_days * 86400)
        if now >= deadline:
            candidate.unlink()
            removed += 1
    for directory in sorted((item for item in root.rglob("*") if item.is_dir() and not item.is_symlink()),
                            key=lambda item: len(item.parts), reverse=True):
        try:
            directory.rmdir()
        except OSError:
            pass
    syslog.syslog(syslog.LOG_INFO, "agoraweave-evidence retention category=" + category +
                  " deleted_files=" + str(removed) + " invalid_indexes=" + str(errors))
