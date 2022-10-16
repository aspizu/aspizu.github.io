import html
from pathlib import Path

for i in Path("_src").glob("*.doc"):
    contents = html.escape(i.read_text())
    with Path(f"{i.name}.html").open("w") as fp:
        # fmt: off
        fp.write(  "<html>"
                   "  <head>"
                  f"    <title>{i.name}</title>"
                   '    <link rel="stylesheet" href="style.css">'
                   "  </head>"
                   "  <body>"
                  f"    <pre><code>{contents}</code></pre>"
                   "  </body>"
                   "</html>" )
        # fmt: on
