import sys

from django.core.management.base import BaseCommand

from website.checks import verify_schema


class Command(BaseCommand):
    help = "Verify the database schema: connectivity, applied migrations, and table existence."

    def handle(self, *args, **options):
        problems = verify_schema()
        self.stdout.write(self.style.MIGRATE_HEADING("DB schema healthcheck"))
        if not problems:
            self.stdout.write(self.style.SUCCESS("OK: migrations applied and all model tables exist."))
            return
        for problem in problems:
            self.stderr.write(self.style.ERROR(f"FAIL: {problem}"))
        sys.exit(1)