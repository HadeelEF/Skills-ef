#!/usr/bin/env python3
"""Read declared .NET build/package metadata; never restore, evaluate MSBuild, or read secrets."""
import argparse
import json
import os
from pathlib import Path
import sys
import xml.etree.ElementTree as ET

SKIP = {'.git', '.vs', '.idea', 'node_modules', 'bin', 'obj', 'vendor', 'packages'}


def local_name(tag):
    return tag.rsplit('}', 1)[-1]


def inspect_root(root):
    result = {'mode': 'static-declarations-not-msbuild-evaluation',
              'build_files': [], 'sdk_files': [], 'lock_files': [], 'errors': []}
    for directory, dirs, files in os.walk(root, followlinks=False):
        dirs[:] = sorted(d for d in dirs if d not in SKIP and
                         not Path(directory, d).is_symlink())
        for name in sorted(files):
            path = Path(directory, name)
            if path.is_symlink():
                continue
            relative = str(path.relative_to(root))
            try:
                if name.endswith(('.csproj', '.fsproj', '.vbproj', '.props', '.targets')):
                    tree = ET.parse(path)
                    item = {'path': relative, 'properties': [], 'packages': [],
                            'project_references': []}
                    for element in tree.iter():
                        tag = local_name(element.tag)
                        if tag in {'TargetFramework', 'TargetFrameworks', 'LangVersion',
                                   'Nullable', 'RuntimeIdentifier', 'RuntimeIdentifiers',
                                   'ManagePackageVersionsCentrally', 'RestorePackagesWithLockFile'}:
                            item['properties'].append({'name': tag, 'value': element.text or ''})
                        elif tag in {'PackageReference', 'PackageVersion'}:
                            children = {local_name(x.tag): x.text for x in element}
                            item['packages'].append({
                                'kind': tag,
                                'id': element.get('Include') or element.get('Update'),
                                'version': element.get('Version') or children.get('Version'),
                                'version_override': element.get('VersionOverride') or children.get('VersionOverride'),
                                'condition': element.get('Condition')})
                        elif tag == 'ProjectReference':
                            item['project_references'].append(element.get('Include'))
                    result['build_files'].append(item)
                elif name == 'global.json':
                    data = json.loads(path.read_text(encoding='utf-8-sig'))
                    sdk = data.get('sdk', {})
                    result['sdk_files'].append({'path': relative,
                        'sdk': {k: sdk[k] for k in ('version', 'rollForward', 'allowPrerelease') if k in sdk}})
                elif name == 'packages.lock.json':
                    data = json.loads(path.read_text(encoding='utf-8-sig'))
                    packages = []
                    for target, graph in data.get('dependencies', {}).items():
                        for package, detail in graph.items():
                            packages.append({'target': target, 'id': package,
                                             'type': detail.get('type'), 'resolved': detail.get('resolved')})
                    result['lock_files'].append({'path': relative, 'packages': packages})
            except (ET.ParseError, ValueError, OSError, AttributeError, TypeError) as error:
                result['errors'].append({'path': relative, 'error_type': type(error).__name__})
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root', type=Path)
    args = parser.parse_args()
    root = args.root.resolve()
    if not root.is_dir():
        parser.error('root must be an existing directory')
    result = inspect_root(root)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 1 if result['errors'] else 0


if __name__ == '__main__':
    sys.exit(main())
