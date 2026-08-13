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
                "unapplied migrations: "
                + ", ".join(f"{m[0].app_label}.{m[0].name}" for m in plan)
            )
        existing = set(connection.introspection.table_names())
        expected = {model._meta.db_table for model in apps.get_models()}
        missing = sorted(expected - existing)
        if missing:
            problems.append("missing tables: " + ", ".join(missing))
    except Exception as exc:
        problems.append(f"could not verify schema: {exc}")
    return problems


@checks.register
def db_schema_check(app_configs=None, **kwargs):
    if getattr(settings, 'USE_SQLITE', False):
        return []
    return [
        checks.Warning(
            f"Database schema check failed: {problem}",
            hint="Run `python manage.py migrate`, then `python manage.py healthcheck`.",
            obj="schema",
        )
        for problem in verify_schema()
    ]