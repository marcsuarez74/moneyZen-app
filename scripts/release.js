#!/usr/bin/env node

/**
 * Script de release automatisé
 * Usage: node scripts/release.js [patch|minor|major]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RELEASE_TYPES = {
  patch: 'PATCH',
  minor: 'MINOR',
  major: 'MAJOR'
};

function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function incrementVersion(currentVersion, type) {
  const parts = currentVersion.split('.').map(Number);

  switch (type) {
    case 'major':
      return `${parts[0] + 1}.0.0`;
    case 'minor':
      return `${parts[0]}.${parts[1] + 1}.0`;
    case 'patch':
      return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
    default:
      throw new Error(`Type de release inconnu: ${type}`);
  }
}

function updatePackageJson(newVersion) {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  const oldVersion = packageJson.version;
  packageJson.version = newVersion;

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ package.json mis à jour: ${oldVersion} → ${newVersion}`);
}

function updateChangelog(newVersion) {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  let changelog = fs.readFileSync(changelogPath, 'utf8');

  const today = getCurrentDate();
  const unreleasedSection = '## [Unreleased]';
  const newVersionSection = `## [${newVersion}] - ${today}`;

  if (changelog.includes(unreleasedSection)) {
    changelog = changelog.replace(
      unreleasedSection,
      `${unreleasedSection}\n\n### Added\n- \n\n### Changed\n- \n\n### Fixed\n- \n\n${newVersionSection}`
    );
  }

  fs.writeFileSync(changelogPath, changelog);
  console.log(`✅ CHANGELOG.md mis à jour avec la version ${newVersion}`);
}

function updateVersionMd(newVersion) {
  const versionPath = path.join(process.cwd(), 'VERSION.md');
  let version = fs.readFileSync(versionPath, 'utf8');

  const today = getCurrentDate();
  const versionLine = version.match(/\*\*\d+\.\d+\.\d+\*\*/)[0];

  version = version.replace(versionLine, `**${newVersion}**`);

  // Ajouter une ligne dans l'historique
  const versionPattern = /## Historique des versions\n\n/;
  if (versionPattern.test(version)) {
    const newHistoryEntry = `| Version | Date | Description |\n|---------|------|-------------|\n| ${newVersion} | ${today} | [INSECIRRE LA DESCRIPTION] |`;
    version = version.replace(
      versionPattern,
      `## Historique des versions\n\n${newHistoryEntry}\n`
    );
  }

  fs.writeFileSync(versionPath, version);
  console.log(`✅ VERSION.md mis à jour avec la version ${newVersion}`);
}

function updateVersionJson(newVersion) {
  const versionJsonPath = path.join(process.cwd(), 'src', 'assets', 'version.json');

  let versionData;
  try {
    versionData = JSON.parse(fs.readFileSync(versionJsonPath, 'utf8'));
  } catch {
    versionData = {};
  }

  versionData.version = newVersion;
  versionData.date = getCurrentDate();
  versionData.commit = execSync('git rev-parse --short HEAD').toString().trim();
  versionData.branch = execSync('git branch --show-current').toString().trim();

  const assetsDir = path.dirname(versionJsonPath);
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  fs.writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 2));
  console.log(`✅ src/assets/version.json mis à jour`);
}

function commitChanges(newVersion) {
  try {
    execSync('git add package.json CHANGELOG.md VERSION.md src/assets/version.json');
    execSync(`git commit -m "release: bump version to ${newVersion}"`);
    console.log(`✅ Commit créé avec le message "release: bump version to ${newVersion}"`);
  } catch (error) {
    console.error('⚠️  Erreur lors du commit:', error.message);
  }
}

function createGitTag(newVersion) {
  try {
    execSync(`git tag -a v${newVersion} -m "Release version ${newVersion}"`);
    console.log(`✅ Tag Git créé: v${newVersion}`);
  } catch (error) {
    console.error('⚠️  Erreur lors de la création du tag:', error.message);
  }
}

function main() {
  const args = process.argv.slice(2);
  const releaseType = args[0]?.toLowerCase();

  if (!releaseType || !RELEASE_TYPES[releaseType]) {
    console.error('❌ Usage: node scripts/release.js [patch|minor|major]');
    console.error('');
    console.error('Types de release :');
    console.error('  patch : Correction de bug (1.0.0 → 1.0.1)');
    console.error('  minor : Nouvelle fonctionnalité (1.0.0 → 1.1.0)');
    console.error('  major : Changement majeur (1.0.0 → 2.0.0)');
    process.exit(1);
  }

  console.log(`🚀 Lancement d'une release ${RELEASE_TYPES[releaseType]}...\n`);

  // Récupérer la version actuelle
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const currentVersion = packageJson.version;

  console.log(`Version actuelle : ${currentVersion}`);

  // Calculer la nouvelle version
  const newVersion = incrementVersion(currentVersion, releaseType);
  console.log(`Nouvelle version : ${newVersion}\n`);

  // Demander confirmation
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question(`Confirmer la release ${newVersion} ? (Y/n) : `, (answer) => {
    readline.close();

    if (answer.toLowerCase() !== '' && answer.toLowerCase() !== 'y') {
      console.log('❌ Release annulée');
      process.exit(0);
    }

    console.log('\n📦 Mise à jour des fichiers...\n');

    // Mettre à jour tous les fichiers
    updatePackageJson(newVersion);
    updateChangelog(newVersion);
    updateVersionMd(newVersion);
    updateVersionJson(newVersion);

    // Commit et tag
    console.log('\n🏷️  Création du commit et du tag...\n');
    commitChanges(newVersion);
    createGitTag(newVersion);

    console.log('\n✨ Release terminée !');
    console.log(`\nProchaines étapes :`);
    console.log(`  1. Push du tag : git push origin v${newVersion}`);
    console.log(`  2. Créer une release GitHub à partir du tag v${newVersion}`);
    console.log(`  3. Déployer l'application : npm run deploy`);
  });
}

main();
