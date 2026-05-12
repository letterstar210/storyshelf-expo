param(
  [Parameter(Mandatory = $false)]
  [int]$Port = 19006
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

$env:CI = "1"

Write-Host "Starting Expo web on http://127.0.0.1:$Port ..."
& ".\node_modules\.bin\expo.cmd" start --web --port $Port
