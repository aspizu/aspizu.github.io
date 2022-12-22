from pathlib import Path
from typing import Any


def expand(path: Path, _indent: int = 0):
    def puts(o: Any):
        print(_indent * "  " + str(o))

    puts(f"<p>{path.name}</p>")
    puts(f"<ul>")
    _indent += 1
    for subpath in path.iterdir():
        if subpath.is_dir():
            puts("<li>")
            _indent += 1
            expand(subpath, _indent)
            _indent -= 1
            puts("</li>")
        else:
            puts(f'<li><a href="/{subpath}">{subpath.name}</a></li>')
    _indent -= 1
    puts("</ul>")


print('<!DOCTYPE html>\n<html>\n<body>\n<div class="sitemap">')
expand(Path("pages"), _indent=1)
print("</div>\n</body>\n</html>")
