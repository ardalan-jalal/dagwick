from __future__ import annotations

import ast
import functools
import importlib
import importlib.util
import sys


@functools.lru_cache(maxsize=64)
def parse(source: str) -> ast.Module | None:
    try:
        return ast.parse(source)
    except (SyntaxError, ValueError):
        return None


class _ParseTimeCalls(ast.NodeVisitor):
    def __init__(self, match) -> None:
        self.match = match
        self.depth = 0
        self.lines: list[int] = []

    def _deferred(self, body) -> None:
        self.depth += 1
        for stmt in body if isinstance(body, list) else [body]:
            self.visit(stmt)
        self.depth -= 1

    def _function(self, node: ast.FunctionDef | ast.AsyncFunctionDef) -> None:
        for expr in node.decorator_list:
            self.visit(expr)
        for expr in [*node.args.defaults, *node.args.kw_defaults]:
            if expr is not None:
                self.visit(expr)
        self._deferred(node.body)

    visit_FunctionDef = _function
    visit_AsyncFunctionDef = _function

    def visit_Lambda(self, node: ast.Lambda) -> None:
        for expr in [*node.args.defaults, *node.args.kw_defaults]:
            if expr is not None:
                self.visit(expr)
        self._deferred(node.body)

    def visit_Call(self, node: ast.Call) -> None:
        if self.depth == 0 and self.match(node.func):
            self.lines.append(node.lineno)
        self.generic_visit(node)


def _variable_names(tree: ast.Module) -> set[str]:
    names = {"Variable"}
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom) and (node.module or "").startswith("airflow"):
            names.update(a.asname for a in node.names if a.name == "Variable" and a.asname)
    return names


def variable_get_lines(tree: ast.Module) -> list[int]:
    names = _variable_names(tree)

    def is_variable_get(func: ast.expr) -> bool:
        if not (isinstance(func, ast.Attribute) and func.attr == "get"):
            return False
        owner = func.value
        return (isinstance(owner, ast.Name) and owner.id in names) or (
            isinstance(owner, ast.Attribute) and owner.attr == "Variable"
        )

    visitor = _ParseTimeCalls(is_variable_get)
    visitor.visit(tree)
    return sorted(set(visitor.lines))


NEVER_IMPORT = ("airflow.providers.", "airflow.example_dags")


def _import_package(name: str) -> bool:
    parts = name.split(".")
    for i in range(1, len(parts) + 1):
        try:
            spec = importlib.util.find_spec(".".join(parts[:i]))
        except (ImportError, ValueError):
            return False
        if spec is None or spec.submodule_search_locations is None:
            return False
    importlib.import_module(name)
    return True


@functools.lru_cache(maxsize=256)
def airflow_redirects(module: str) -> dict[str, str]:
    if not module.startswith("airflow.") or module.startswith(NEVER_IMPORT):
        return {}
    mod = sys.modules.get(module)
    if mod is None:
        for candidate in (module, module.rpartition(".")[0]):
            try:
                if _import_package(candidate):
                    break
            except Exception:
                return {}
        mod = sys.modules.get(module)
    if mod is None:
        return {}
    hook = vars(mod).get("__getattr__")
    if not (
        isinstance(hook, functools.partial)
        and getattr(hook.func, "__name__", "") == "getattr_with_deprecation"
        and hook.args
        and isinstance(hook.args[0], dict)
    ):
        return {}
    real = vars(mod)
    return {name: target for name, target in hook.args[0].items() if name not in real}


def deprecated_imports(tree: ast.Module) -> list[tuple[int, str, str]]:
    found = []
    for node in ast.walk(tree):
        if not isinstance(node, ast.ImportFrom) or node.level or not node.module:
            continue
        redirects = airflow_redirects(node.module)
        for alias in node.names:
            target = redirects.get(alias.name)
            if target:
                found.append((node.lineno, f"{node.module}.{alias.name}", target))
    return sorted(found)
