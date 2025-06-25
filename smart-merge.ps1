# Advanced PowerShell script for intelligent merging to master
# Save as: smart-merge.ps1

param(
    [string]$CommitMessage = "",
    [switch]$DryRun = $false,
    [switch]$Interactive = $false
)

Write-Host "🚀 Starting intelligent merge to master..." -ForegroundColor Green

# Get current branch name
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "📍 Current branch: $currentBranch" -ForegroundColor Cyan

if ($currentBranch -eq "master" -or $currentBranch -eq "main") {
    Write-Host "❌ Cannot merge from master/main to itself!" -ForegroundColor Red
    exit 1
}

# Step 1: Check for uncommitted changes
$statusOutput = git status --porcelain
if ($statusOutput) {
    Write-Host "📝 Found uncommitted changes:" -ForegroundColor Yellow
    git status --short
    
    if (-not $DryRun) {
        $response = Read-Host "Do you want to commit these changes? (y/N)"
        if ($response -eq "y" -or $response -eq "Y") {
            git add .
            
            if ([string]::IsNullOrEmpty($CommitMessage)) {
                $CommitMessage = Read-Host "Enter commit message"
                if ([string]::IsNullOrEmpty($CommitMessage)) {
                    $CommitMessage = "Auto-commit before merge to master"
                }
            }
            
            git commit -m $CommitMessage
            
            if ($LASTEXITCODE -ne 0) {
                Write-Host "❌ Failed to commit changes. Aborting." -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "❌ Please commit or stash your changes first." -ForegroundColor Red
            exit 1
        }
    }
}

# Step 2: Analyze changes
Write-Host "🔍 Analyzing changes between $currentBranch and master..." -ForegroundColor Yellow

# Get detailed diff information
$changedFiles = git diff --name-status master..$currentBranch | Where-Object { $_ -ne $null -and $_.Trim() -ne "" }

if ($changedFiles.Count -eq 0) {
    Write-Host "⚠️  No differences found between $currentBranch and master" -ForegroundColor Yellow
    exit 0
}

# Categorize changes
$addedFiles = @()
$modifiedFiles = @()
$deletedFiles = @()
$renamedFiles = @()

foreach ($line in $changedFiles) {
    $parts = $line.Split("`t")
    $status = $parts[0].Substring(0,1)
    $filename = $parts[1]
    
    switch ($status) {
        "A" { $addedFiles += $filename }
        "M" { $modifiedFiles += $filename }
        "D" { $deletedFiles += $filename }
        "R" { $renamedFiles += $filename }
    }
}

# Display analysis
Write-Host "📊 Change Analysis:" -ForegroundColor Cyan
Write-Host "  ➕ Added: $($addedFiles.Count) files" -ForegroundColor Green
Write-Host "  📝 Modified: $($modifiedFiles.Count) files" -ForegroundColor Yellow
Write-Host "  🗑️  Deleted: $($deletedFiles.Count) files" -ForegroundColor Red
Write-Host "  🔄 Renamed: $($renamedFiles.Count) files" -ForegroundColor Blue

Write-Host ""
Write-Host "📋 Changed files:" -ForegroundColor Cyan
foreach ($line in $changedFiles) {
    $parts = $line.Split("`t")
    $status = $parts[0]
    $filename = $parts[1]
    
    $statusSymbol = switch ($status.Substring(0,1)) {
        "A" { "➕" }
        "M" { "📝" }
        "D" { "🗑️ " }
        "R" { "🔄" }
        default { "❓" }
    }
    
    Write-Host "  $statusSymbol $filename" -ForegroundColor Gray
}

# Generate intelligent commit message if not provided
if ([string]::IsNullOrEmpty($CommitMessage)) {
    $changeTypes = @()
    
    # Detect types of changes
    $hasReactChanges = $changedFiles | Where-Object { $_ -like "*tsx*" -or $_ -like "*jsx*" }
    $hasConfigChanges = $changedFiles | Where-Object { $_ -like "*config*" -or $_ -like "*json*" }
    $hasStyleChanges = $changedFiles | Where-Object { $_ -like "*css*" -or $_ -like "*scss*" }
    $hasTestChanges = $changedFiles | Where-Object { $_ -like "*test*" -or $_ -like "*spec*" }
    
    if ($hasReactChanges) { $changeTypes += "React components" }
    if ($hasConfigChanges) { $changeTypes += "configuration" }
    if ($hasStyleChanges) { $changeTypes += "styles" }
    if ($hasTestChanges) { $changeTypes += "tests" }
    
    if ($changeTypes.Count -eq 0) { $changeTypes += "code" }
    
    $CommitMessage = "Update $($changeTypes -join ', ') from $currentBranch

Changes include:
- $($addedFiles.Count) new files
- $($modifiedFiles.Count) modified files
- $($deletedFiles.Count) deleted files"
}

Write-Host ""
Write-Host "💬 Proposed commit message:" -ForegroundColor Magenta
Write-Host $CommitMessage -ForegroundColor White

if ($DryRun) {
    Write-Host ""
    Write-Host "🔍 DRY RUN - No changes will be made" -ForegroundColor Yellow
    Write-Host "To execute: .\smart-merge.ps1" -ForegroundColor Cyan
    exit 0
}

if ($Interactive) {
    Write-Host ""
    $response = Read-Host "Proceed with merge? (Y/n)"
    if ($response -eq "n" -or $response -eq "N") {
        Write-Host "❌ Merge cancelled by user." -ForegroundColor Red
        exit 0
    }
}

# Execute the merge
Write-Host ""
Write-Host "🔄 Switching to master branch..." -ForegroundColor Yellow
git checkout master

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to switch to master. Aborting." -ForegroundColor Red
    git checkout $currentBranch
    exit 1
}

Write-Host "📥 Pulling latest master..." -ForegroundColor Yellow
git pull origin master

Write-Host "🔀 Merging changes from $currentBranch..." -ForegroundColor Yellow

# Get all changed files
$allChangedFiles = git diff --name-only master..$currentBranch

$mergedCount = 0
$failedCount = 0

foreach ($file in $allChangedFiles) {
    # Check if file exists in the development branch
    $fileExists = git cat-file -e "${currentBranch}:${file}" 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        git checkout $currentBranch -- $file
        
        if ($LASTEXITCODE -eq 0) {
            $mergedCount++
        } else {
            $failedCount++
            Write-Host "    ❌ Failed to merge: $file" -ForegroundColor Red
        }
    }
}

Write-Host "📊 Merged $mergedCount files successfully" -ForegroundColor Green

# Commit the changes
Write-Host "💾 Committing changes to master..." -ForegroundColor Yellow
git add .
git commit -m $CommitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  No changes to commit or commit failed" -ForegroundColor Yellow
} else {
    Write-Host "🚀 Pushing to master..." -ForegroundColor Yellow
    git push origin master
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to push to master" -ForegroundColor Red
    } else {
        Write-Host "✅ Successfully pushed to master!" -ForegroundColor Green
    }
}

# Return to development branch
Write-Host "🔙 Returning to $currentBranch..." -ForegroundColor Yellow
git checkout $currentBranch

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to return to $currentBranch" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Merge completed successfully!" -ForegroundColor Green
Write-Host "📊 Final status:" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "💡 Usage examples:" -ForegroundColor Cyan
Write-Host "  .\smart-merge.ps1                    # Interactive merge" -ForegroundColor Gray
Write-Host "  .\smart-merge.ps1 -DryRun           # Preview changes only" -ForegroundColor Gray
Write-Host "  .\smart-merge.ps1 -Interactive      # Ask before merging" -ForegroundColor Gray
Write-Host "  .\smart-merge.ps1 -CommitMessage 'Custom message'" -ForegroundColor Gray
