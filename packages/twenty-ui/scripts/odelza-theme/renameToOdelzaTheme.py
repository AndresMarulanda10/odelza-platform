"""One-off codemod that moved the UI from Twenty's theme names to Odelza's.

Run from the repository root: python -I packages/twenty-ui/scripts/odelza-theme/renameToOdelzaTheme.py

It is idempotent. It renames:
- CSS variables --t-* to --odz-*
- the accessor themeCssVariables to odelzaThemeCssVariables
- THEME_LIGHT / THEME_DARK to ODELZA_THEME_LIGHT / ODELZA_THEME_DARK
- the theme CSS imports to odelza-theme-{light,dark}.css
- the blue family used as the action color to the primary family, so that
  blue only means blue (data colors, information, syntax)
- the 'blue' button / banner / info / checkbox accent to 'primary'
"""

import os
import re
import subprocess
import sys

PACKAGES = [
    'packages/twenty-ui',
    'packages/twenty-front',
    'packages/twenty-apps',
    'packages/twenty-front-component-renderer',
    'packages/twenty-sdk',
    'packages/twenty-emails',
]
EXTENSIONS = ('.ts', '.tsx', '.scss', '.css', '.html', '.md', '.mdx')
SKIPPED_PATH_PARTS = (
    '/node_modules/',
    '/dist/',
    'src/theme-constants/odelza-theme-',
    'src/theme-constants/odelzaThemeCssVariables.ts',
    'scripts/odelza-theme/',
    '/locales/',
)

# Places where blue is information, data or syntax and must stay blue.
KEEP_BLUE_PATH_PARTS = (
    'twenty-ui/src/input/CodeEditor/utils/getBaseCodeEditorTheme.ts',
    'twenty-ui/src/json-visualizer/',
    'twenty-ui/src/feedback/SidePanelInformationBanner/',
    'twenty-front/src/modules/page-layout/widgets/standalone-rich-text/components/DashboardColorIcon.tsx',
    'twenty-front/src/modules/file/hooks/useFileCategoryColors.ts',
    'twenty-front/src/modules/file/hooks/useFileIconColors.ts',
    'twenty-front/src/modules/object-metadata/utils/getIconColorForObjectType.ts',
    'twenty-front/src/modules/workflow/workflow-run/observability/WorkflowRunStepLogsEntries.tsx',
    'twenty-front/src/modules/settings/admin-panel/health-status/components/SettingsAdminWorkerMetricsGraph.tsx',
)

ALWAYS_RULES = [
    (re.compile(r'\bbackground\.transparent\.blue\b'), 'background.transparent.accent'),
    (re.compile(r'\bborder\.color\.blue\b'), 'border.color.accent'),
    (re.compile(r'--t-background-transparent-blue\b'), '--t-background-transparent-accent'),
    (re.compile(r'--t-border-color-blue\b'), '--t-border-color-accent'),
    (re.compile(r'\.IllustrationIcon\.'), '.illustrationIcon.'),
    (re.compile(r'--t--illustration-icon'), '--t-illustration-icon'),
    (re.compile(r'\bthemeCssVariables\b'), 'odelzaThemeCssVariables'),
    (re.compile(r'twenty-ui/theme-(light|dark)\.css'), r'twenty-ui/odelza-theme-\1.css'),
    (re.compile(r'@ui/theme-constants/theme-(light|dark)\.css'), r'@ui/theme-constants/odelza-theme-\1.css'),
    (re.compile(r'(?<![A-Z_])THEME_(LIGHT|DARK)\b'), r'ODELZA_THEME_\1'),
    (re.compile(r'@ui/theme/constants/Theme(Light|Dark)\b'), r'@ui/theme/constants/OdelzaTheme\1'),
]

ACTION_BLUE_RULES = [
    (re.compile(r'(\.color\.transparent\.)blue(\d+)\b'), r'\1primary\2'),
    (re.compile(r'(\.color\.)blue(\d{0,2})\b'), r'\1primary\2'),
    (re.compile(r'--t-color-transparent-blue(\d+)\b'), r'--t-color-transparent-primary\1'),
    (re.compile(r'--t-color-blue(\d{0,2})\b'), r'--t-color-primary\1'),
]

PREFIX_RULE = (re.compile(r'--t-(?=[a-z])'), '--odz-')

ACCENT_LINE = re.compile(r'accent', re.IGNORECASE)
BLUE_LITERAL = re.compile(r"(['\"])blue\1")


def rename_accent_literals(content: str) -> str:
    lines = content.split('\n')
    for index, line in enumerate(lines):
        if ACCENT_LINE.search(line) and BLUE_LITERAL.search(line):
            lines[index] = BLUE_LITERAL.sub(r'\1primary\1', line)
    return '\n'.join(lines)


def transform(path: str, content: str) -> str:
    for pattern, replacement in ALWAYS_RULES:
        content = pattern.sub(replacement, content)

    if not any(part in path for part in KEEP_BLUE_PATH_PARTS):
        for pattern, replacement in ACTION_BLUE_RULES:
            content = pattern.sub(replacement, content)
        content = rename_accent_literals(content)
        content = content.replace('CheckboxAccent.Blue', 'CheckboxAccent.Primary')

    pattern, replacement = PREFIX_RULE
    return pattern.sub(replacement, content)


def main() -> int:
    files = subprocess.run(
        ['git', 'ls-files', *PACKAGES],
        check=True,
        capture_output=True,
        text=True,
    ).stdout.splitlines()

    changed = 0
    for path in files:
        if not path.endswith(EXTENSIONS):
            continue
        if any(part in path for part in SKIPPED_PATH_PARTS):
            continue
        # The extended-length prefix lets Windows open paths over 260 characters
        full_path = (
            '\\\\?\\' + os.path.abspath(path).replace('/', '\\')
            if os.name == 'nt'
            else path
        )
        with open(full_path, encoding='utf-8', newline='') as source:
            original = source.read()
        updated = transform(path, original)
        if updated != original:
            with open(full_path, 'w', encoding='utf-8', newline='') as target:
                target.write(updated)
            changed += 1

    print(f'Updated {changed} files')
    return 0


if __name__ == '__main__':
    sys.exit(main())
