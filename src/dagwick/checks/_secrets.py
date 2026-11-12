from __future__ import annotations

import ast
import re

_PLAIN_NAME = re.compile(r"[A-Za-z_][A-Za-z0-9_.-]{0,63}")

SECRET_NAME_ENDINGS = (
    ("password",),
    ("passwd",),
    ("pwd",),
    ("secret",),
    ("token",),
    ("apikey",),
    ("api", "key"),
    ("access", "key"),
    ("secret", "key"),
    ("private", "key"),
    ("client", "secret"),
    ("credentials",),
)

PLACEHOLDERS = {
    "changeme",
    "change_me",
    "dummy",
    "example",
    "none",
    "null",
    "pass",
    "password",
    "placeholder",
    "pw",
    "redacted",
    "secret",
    "test",
    "todo",
    "token",
    "user",
}

PATTERNS = (
    ("AWS access key id", re.compile(r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b")),
    ("private key", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("GitHub token", re.compile(r"\b(?:gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{60,})\b")),
    ("Slack token", re.compile(r"\bxox[abprs]-[A-Za-z0-9-]{10,}")),
    ("Slack webhook URL", re.compile(r"https://hooks\.slack\.com/services/[A-Za-z0-9/]{20,}")),
    ("Google API key", re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b")),
)

# A scheme starts only where no scheme character comes before it, and every part
# has a length cap. Without these, a long run like "a.a.a." makes the regex
# engine retry from every position (quadratic time) and stalls the api-server.
URI_PASSWORD = re.compile(
    r"(?<![a-z0-9+.-])[a-z][a-z0-9+.-]{0,31}://[^/\s:@]{1,256}:([^@\s/]{1,256})@",
    re.IGNORECASE,
)
IDENTIFIER_LIKE = re.compile(r"[a-z_]+")
CAMEL = re.compile(r"(?<=[a-z0-9])(?=[A-Z])")


def _tokens(name: str) -> tuple[str, ...]:
    return tuple(t for t in re.split(r"[^a-z0-9]+", CAMEL.sub("_", name).lower()) if t)


def is_secret_name(name: str) -> bool:
    tokens = _tokens(name)
    return any(tokens[-len(end) :] == end for end in SECRET_NAME_ENDINGS if len(tokens) >= len(end))


def is_placeholder(value: str) -> bool:
    v = value.strip()
    if len(v) < 4 or any(c.isspace() for c in v):
        return True
    if "{{" in v or "${" in v or "{" in v and "}" in v:
        return True
    if v.startswith("<") and v.endswith(">"):
        return True
    if len(set(v)) == 1 or IDENTIFIER_LIKE.fullmatch(v):
        return True
    low = v.lower()
    return low in PLACEHOLDERS or low.startswith(("your", "my_", "my-", "fake", "sample"))


def _str(node: ast.AST | None) -> str | None:
    return node.value if isinstance(node, ast.Constant) and isinstance(node.value, str) else None


def _target_name(target: ast.expr) -> str | None:
    if isinstance(target, ast.Name):
        return target.id
    if isinstance(target, ast.Attribute):
        return target.attr
    if isinstance(target, ast.Subscript):
        return _str(target.slice)
    return None


def find_secrets(tree: ast.Module) -> list[tuple[int, str]]:
    found: set[tuple[int, str]] = set()

    def named(line: int, name: str | None, value: ast.AST | None) -> None:
        text = _str(value)
        if name and text is not None and is_secret_name(name) and not is_placeholder(text):
            # A dict key is any string, and could itself hold a credential: name it only
            # when it looks like a plain identifier.
            shown = f'"{name}"' if _PLAIN_NAME.fullmatch(name) else "a secret-named key"
            found.add((line, f"value assigned to {shown}"))

    for node in ast.walk(tree):
        if isinstance(node, ast.Assign):
            for target in node.targets:
                named(node.lineno, _target_name(target), node.value)
        elif isinstance(node, ast.AnnAssign):
            named(node.lineno, _target_name(node.target), node.value)
        elif isinstance(node, ast.keyword):
            named(node.value.lineno, node.arg, node.value)
        elif isinstance(node, ast.Dict):
            for key, value in zip(node.keys, node.values, strict=True):
                named(value.lineno, _str(key), value)
        elif isinstance(node, ast.Constant) and isinstance(node.value, str):
            for kind, pattern in PATTERNS:
                if pattern.search(node.value):
                    found.add((node.lineno, kind))
            for match in URI_PASSWORD.finditer(node.value):
                if not is_placeholder(match.group(1)):
                    found.add((node.lineno, "password in a connection URI"))
    return sorted(found)
