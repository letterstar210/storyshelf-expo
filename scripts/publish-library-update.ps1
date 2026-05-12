param(
  [Parameter(Mandatory = $true)]
  [string]$InputFile,

  [Parameter(Mandatory = $false)]
  [string]$Message = "Update bundled library"
)

$ErrorActionPreference = "Stop"

$resolvedInput = Resolve-Path $InputFile

Write-Host "Generating bundled library from $resolvedInput ..."
npm run generate:default-library -- "$resolvedInput"

Write-Host "Publishing OTA update to preview channel ..."
$escapedMessage = $Message.Replace('"', '\"')
cmd /c "npm exec --package=eas-cli -c ""eas update --channel preview --message \""$escapedMessage\"""""
