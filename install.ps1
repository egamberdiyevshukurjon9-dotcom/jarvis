<#
  J.A.R.V.I.S. - Windows installer.

  Double-click install.cmd (it runs this file), or in PowerShell:
    powershell -ExecutionPolicy Bypass -File install.ps1
  Without a copy of the project yet, this one line downloads and installs it:
    irm https://raw.githubusercontent.com/egamberdiyevshukurjon9-dotcom/jarvis/main/install.ps1 | iex

  What it does, in order, skipping anything already there:
    1. Git, Node.js LTS and FFmpeg (through winget)
    2. Claude Code (the brain) and its login
    3. The project itself and its packages (npm install)
    4. The setup wizard: voice, mail/calendar, morning briefing, video folder
    5. A JARVIS shortcut on the desktop

  Kept to plain ASCII on purpose: Windows PowerShell 5.1 reads a script
  without a byte-order mark in the legacy code page, and anything else turns
  into garbage on screen.
#>

$ErrorActionPreference = 'Stop'
$RepoUrl = 'https://github.com/egamberdiyevshukurjon9-dotcom/jarvis.git'

function Say($text)  { Write-Host "  $text" }
function Ok($text)   { Write-Host "  [ok] $text" -ForegroundColor Green }
function Step($text) { Write-Host ""; Write-Host "== $text" -ForegroundColor Cyan }
function Warn($text) { Write-Host "  [!] $text" -ForegroundColor Yellow }
function Fail($text) {
  Write-Host ""
  Write-Host "  [x] $text" -ForegroundColor Red
  Write-Host ""
  Read-Host "  Yopish uchun Enter bosing (press Enter to close)" | Out-Null
  exit 1
}

function Has($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

# Programs installed a moment ago are on the machine PATH, not on this
# session's copy of it. Re-read both so the next step can find them.
function Refresh-Path {
  $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $user = [Environment]::GetEnvironmentVariable('Path', 'User')
  $env:Path = "$machine;$user"
  $npmGlobal = Join-Path $env:APPDATA 'npm'
  if ((Test-Path $npmGlobal) -and ($env:Path -notlike "*$npmGlobal*")) { $env:Path += ";$npmGlobal" }
  $localBin = Join-Path $HOME '.local\bin'
  if ((Test-Path $localBin) -and ($env:Path -notlike "*$localBin*")) { $env:Path += ";$localBin" }
}

function Winget-Install($id, $label) {
  if (-not (Has 'winget')) {
    Fail "winget topilmadi. Microsoft Store'dan 'App Installer' ni o'rnating, yoki $label ni qo'lda o'rnating, keyin qayta ishga tushiring."
  }
  Say "$label o'rnatilmoqda (installing)..."
  & winget install --id $id -e --silent --accept-package-agreements --accept-source-agreements | Out-Host
  Refresh-Path
}

Write-Host ""
Write-Host "  J.A.R.V.I.S. o'rnatuvchi (installer)" -ForegroundColor Cyan
Write-Host "  ------------------------------------"
Say "Bir necha daqiqa oladi. Internet ulangan bo'lsin."

# --- 1. Tools --------------------------------------------------------------
Step "1/5  Git, Node.js, FFmpeg"
Refresh-Path

if (Has 'git') { Ok "Git bor" } else { Winget-Install 'Git.Git' 'Git' }
if (-not (Has 'git')) { Fail "Git o'rnatilmadi. https://git-scm.com/download/win dan o'rnating." }

$nodeOk = $false
if (Has 'node') {
  $major = [int]((& node -p "process.versions.node.split('.')[0]").Trim())
  if ($major -ge 20) { $nodeOk = $true; Ok "Node.js $(& node -v) bor" }
  else { Warn "Node.js $(& node -v) eski, 20+ kerak. Yangilanadi." }
}
if (-not $nodeOk) { Winget-Install 'OpenJS.NodeJS.LTS' 'Node.js LTS' }
if (-not (Has 'node')) { Fail "Node.js o'rnatilmadi. https://nodejs.org dan LTS versiyasini o'rnating." }

if (Has 'ffmpeg') { Ok "FFmpeg bor" } else { Winget-Install 'Gyan.FFmpeg' 'FFmpeg' }
if (-not (Has 'ffmpeg')) { Warn "FFmpeg topilmadi - video montaj ishlamaydi. Keyin: winget install Gyan.FFmpeg" }

# --- 2. Claude Code ---------------------------------------------------------
Step "2/5  Claude Code (Jarvisning miyasi)"
if (Has 'claude') {
  Ok "Claude Code bor: $(& claude --version)"
} else {
  Say "Claude Code o'rnatilmoqda..."
  & npm.cmd install -g @anthropic-ai/claude-code | Out-Host
  Refresh-Path
  if (-not (Has 'claude')) {
    Say "npm orqali bo'lmadi, rasmiy o'rnatuvchi sinab ko'rilmoqda..."
    Invoke-RestMethod https://claude.ai/install.ps1 | Invoke-Expression
    Refresh-Path
  }
  if (-not (Has 'claude')) { Fail "Claude Code o'rnatilmadi. https://docs.claude.com/en/docs/claude-code dagi ko'rsatmaga qarang." }
  Ok "Claude Code o'rnatildi"
}

$creds = Join-Path $HOME '.claude\.credentials.json'
if ((Test-Path $creds) -or $env:ANTHROPIC_API_KEY) {
  Ok "Claude Code'ga kirilgan (logged in)"
} else {
  Warn "Claude Code'ga hali kirilmagan."
  Say "Hozir Claude Code ochiladi. Brauzerda hisobingizga kiring (Pro yoki Max obuna),"
  Say "keyin Claude Code oynasida /exit deb yozib Enter bosing - o'rnatish davom etadi."
  Read-Host "  Tayyor bo'lsangiz Enter bosing" | Out-Null
  & claude
  if (-not (Test-Path $creds)) { Warn "Kirish tasdiqlanmadi. Keyinroq terminalda 'claude' deb yozib kiring." }
}

# --- 3. The project -----------------------------------------------------------
Step "3/5  Jarvis loyihasi"
$here = $PSScriptRoot
if ($here -and (Test-Path (Join-Path $here 'package.json'))) {
  $dir = $here
  Ok "Loyiha papkasi: $dir"
} else {
  $dir = Join-Path $HOME 'jarvis'
  if (Test-Path (Join-Path $dir '.git')) {
    Say "Yangilanmoqda: $dir"
    & git -C $dir pull --ff-only | Out-Host
  } else {
    Say "Yuklab olinmoqda: $dir"
    & git clone $RepoUrl $dir | Out-Host
  }
  if (-not (Test-Path (Join-Path $dir 'package.json'))) { Fail "Loyihani yuklab bo'lmadi: $RepoUrl" }
}
Set-Location $dir

Say "Paketlar o'rnatilmoqda (npm install)..."
# The neural-voice package pulls in onnxruntime-node, whose installer tries to
# download a CUDA build. Nothing here uses a GPU runtime from Node.
$env:npm_config_onnxruntime_node_install_cuda = 'skip'
& npm.cmd install | Out-Host
if ($LASTEXITCODE -ne 0) { Fail "npm install muvaffaqiyatsiz bo'ldi. Yuqoridagi xatoni ko'ring." }
Ok "Paketlar tayyor"

# --- 4. Settings --------------------------------------------------------------
Step "4/5  Sozlash (ovoz, pochta, ertalabki xulosa, video papka)"
& node scripts/configure.mjs
if ($LASTEXITCODE -ne 0) { Fail "Sozlash tugamadi." }

# --- 4b. Claude skills -------------------------------------------------------
Step "Claude skilllari (~/.claude/skills)"
& node scripts/install-skills.mjs
if ($LASTEXITCODE -ne 0) { Warn "Skilllar o'rnatilmadi. Keyin: npm run skills" }

# --- 5. Shortcut ----------------------------------------------------------------
Step "5/5  Ish stolida JARVIS yorlig'i"
try {
  $desktop = [Environment]::GetFolderPath('Desktop')
  $shell = New-Object -ComObject WScript.Shell
  $lnk = $shell.CreateShortcut((Join-Path $desktop 'JARVIS.lnk'))
  $lnk.TargetPath = Join-Path $dir 'start-jarvis.cmd'
  $lnk.WorkingDirectory = $dir
  $lnk.Description = 'J.A.R.V.I.S.'
  $lnk.Save()
  Ok "Yorliq yaratildi: $desktop\JARVIS.lnk"
} catch {
  Warn "Yorliq yaratilmadi. Jarvisni $dir\start-jarvis.cmd bilan ishga tushiring."
}

& node scripts/setup.mjs | Out-Host

Write-Host ""
Write-Host "  Tayyor! (Done)" -ForegroundColor Green
Say "Ish stolidagi JARVIS yorlig'ini bosing. Chrome ochiladi:"
Say "INITIALISE ni bosing, mikrofonga ruxsat bering va 'Hey Jarvis' deng."
Write-Host ""
$go = Read-Host "  Hozir ishga tushirilsinmi? (ha/yo'q)"
if ($go -match '^(h|y)') { Start-Process (Join-Path $dir 'start-jarvis.cmd') -WorkingDirectory $dir }
