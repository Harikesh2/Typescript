from django.apps import apps
from django.conf import settings
from django.core import checks
from django.db import connection
from django.db.migrations.executor import MigrationExecutor


def verify_schema():
    problems = []
    try:
        executor = MigrationExecutor(connection)
        plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
        if plan:
            problems.append(
                (
                    "warning",
                    "unapplied migrations: "
                    + ", ".join(f"{m[0].app_label}.{m[0].name}" for m in plan),
                )
            )
        existing = set(connection.introspection.table_names())
        expected = {model._meta.db_table for model in apps.get_models()}
        missing = sorted(expected - existing)
        if missing:
            severity = "error" if not plan else "warning"
            problems.append((severity, "missing tables: " + ", ".join(missing)))
    except Exception as exc:
        problems.append(("error", f"could not verify schema: {exc}"))
    return problems


@checks.register
def db_schema_check(app_configs=None, **kwargs):
    if getattr(settings, 'USE_SQLITE', False):
        return []
    errors = []
    warnings = []
    for severity, message in verify_schema():
        level = checks.Error if severity == "error" else checks.Warning
        item = level(
            f"Database schema check failed: {message}",
            hint="Run `python manage.py migrate`, then `python manage.py healthcheck`.",
            obj="schema",
        )
        (errors if severity == "error" else warnings).append(item)
    return errors + warnings