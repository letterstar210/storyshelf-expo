param(
  [Parameter(Mandatory = $false)]
  [string]$Channel = "preview",

  [Parameter(Mandatory = $false)]
  [string]$Message = "Manual OTA update"
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "Publishing OTA update to channel '$Channel' ..."
$escapedMessage = $Message.Replace('"', '\"')
cmd /c "npm exec --package=eas-cli -c ""eas update --channel $Channel --message \""$escapedMessage\"""""
